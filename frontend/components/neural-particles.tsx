"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "@react-three/drei"
import * as THREE from "three"

export function NeuralParticles({ count = 50 }) {
  const particlesRef = useRef([])
  const connectionsRef = useRef([])

  // Generate particles if they don't exist
  if (particlesRef.current.length === 0) {
    for (let i = 0; i < count; i++) {
      // Random position in a sphere
      const radius = 8 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      // Random properties
      particlesRef.current.push({
        position: new THREE.Vector3(x, y, z),
        originalPosition: new THREE.Vector3(x, y, z),
        size: 0.02 + Math.random() * 0.05,
        color: new THREE.Color().setHSL(
          0.5 + Math.random() * 0.3, // Purple to blue hue
          0.7 + Math.random() * 0.3, // Saturation
          0.6 + Math.random() * 0.4, // Lightness
        ),
        speed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
        pulse: {
          speed: 0.5 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
        },
      })
    }

    // Generate connections between particles
    for (let i = 0; i < count / 2; i++) {
      const p1 = Math.floor(Math.random() * particlesRef.current.length)
      const p2 = Math.floor(Math.random() * particlesRef.current.length)
      if (p1 !== p2 && particlesRef.current[p1].position.distanceTo(particlesRef.current[p2].position) < 10) {
        connectionsRef.current.push({
          points: [p1, p2],
          active: Math.random() > 0.7,
          opacity: 0.1 + Math.random() * 0.2,
          pulseSpeed: 0.5 + Math.random() * 1.5,
          color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6),
        })
      }
    }
  }

  useFrame((state, delta) => {
    // Animate particles
    particlesRef.current.forEach((particle, i) => {
      const time = state.clock.getElapsedTime()

      // Move particles
      particle.position.x += particle.speed.x
      particle.position.y += particle.speed.y
      particle.position.z += particle.speed.z

      // Boundary check - if particle goes too far, bring it back
      const maxDistance = 20
      if (particle.position.length() > maxDistance) {
        const direction = particle.position.clone().normalize()
        particle.position.sub(direction.multiplyScalar(1))

        // Reverse direction slightly
        particle.speed.x *= -0.8
        particle.speed.y *= -0.8
        particle.speed.z *= -0.8
      }
    })

    // Animate connections
    connectionsRef.current.forEach((connection, i) => {
      const time = state.clock.getElapsedTime()

      // Randomly activate connections for neural firing effect
      if (Math.random() < 0.002) {
        connection.active = !connection.active
      }

      // Fade effect for active connections
      if (connection.active) {
        connection.opacity = Math.min(connection.opacity + delta * connection.pulseSpeed, 0.5)
      } else {
        connection.opacity = Math.max(connection.opacity - delta * connection.pulseSpeed, 0.05)
      }
    })
  })

  return (
    <group>
      {/* Neural particles */}
      {particlesRef.current.map((particle, i) => (
        <Sphere
          key={`neural-particle-${i}`}
          position={[particle.position.x, particle.position.y, particle.position.z]}
          args={[particle.size, 8, 8]}
        >
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </Sphere>
      ))}

      {/* Connections between particles */}
      {connectionsRef.current.map((connection, i) => {
        const start = particlesRef.current[connection.points[0]].position
        const end = particlesRef.current[connection.points[1]].position

        const points = [new THREE.Vector3(start.x, start.y, start.z), new THREE.Vector3(end.x, end.y, end.z)]

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

        return (
          <line key={`neural-connection-${i}`} geometry={lineGeometry}>
            <lineBasicMaterial color={connection.color} opacity={connection.opacity} transparent linewidth={1} />
          </line>
        )
      })}
    </group>
  )
}
