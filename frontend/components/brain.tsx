"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "@react-three/drei"
import * as THREE from "three"

export function Brain({ position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }) {
  const brainRef = useRef()
  const particlesRef = useRef([])
  const connectionsRef = useRef([])
  const pulseRef = useRef(0)

  // Generate random particles for brain visualization
  if (particlesRef.current.length === 0) {
    for (let i = 0; i < 300; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 1.5 + Math.random() * 0.3

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      particlesRef.current.push({
        position: new THREE.Vector3(x, y, z),
        originalPosition: new THREE.Vector3(x, y, z),
        size: 0.02 + Math.random() * 0.03,
        color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6),
        speed: 0.01 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
      })
    }

    // Generate connections between particles
    for (let i = 0; i < 150; i++) {
      const p1 = Math.floor(Math.random() * particlesRef.current.length)
      const p2 = Math.floor(Math.random() * particlesRef.current.length)
      if (p1 !== p2) {
        connectionsRef.current.push({
          points: [p1, p2],
          speed: 0.5 + Math.random() * 1.5,
          active: Math.random() > 0.7,
          opacity: 0.1 + Math.random() * 0.3,
          color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6),
        })
      }
    }
  }

  useFrame((state, delta) => {
    if (brainRef.current) {
      brainRef.current.rotation.y += 0.003

      // Pulse effect
      pulseRef.current += delta * 0.5
      const pulse = Math.sin(pulseRef.current) * 0.05 + 1

      // Animate particles
      particlesRef.current.forEach((particle, i) => {
        const time = state.clock.getElapsedTime()

        // Create breathing effect
        const breathe = Math.sin(time * particle.speed + particle.phase) * 0.03

        // Update particle position with breathing and pulse
        particle.position.x = particle.originalPosition.x * (1 + breathe) * pulse
        particle.position.y = particle.originalPosition.y * (1 + breathe) * pulse
        particle.position.z = particle.originalPosition.z * (1 + breathe) * pulse
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
          connection.opacity = Math.min(connection.opacity + delta * connection.speed, 0.8)
        } else {
          connection.opacity = Math.max(connection.opacity - delta * connection.speed, 0.1)
        }
      })
    }
  })

  return (
    <group position={position} scale={scale} rotation={rotation} ref={brainRef}>
      {/* Brain particles */}
      {particlesRef.current.map((particle, i) => (
        <Sphere
          key={`particle-${i}`}
          position={[particle.position.x, particle.position.y, particle.position.z]}
          args={[particle.size, 8, 8]}
        >
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={0.7}
            transparent
            opacity={0.8}
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
          <line key={`connection-${i}`} geometry={lineGeometry}>
            <lineBasicMaterial color={connection.color} opacity={connection.opacity} transparent linewidth={1} />
          </line>
        )
      })}
    </group>
  )
}
