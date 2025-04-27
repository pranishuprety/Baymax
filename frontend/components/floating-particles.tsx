"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "@react-three/drei"
import * as THREE from "three"

export function FloatingParticles({ count = 50 }) {
  const particlesRef = useRef([])

  // Generate particles if they don't exist
  if (particlesRef.current.length === 0) {
    for (let i = 0; i < count; i++) {
      // Random position in a sphere
      const radius = 10 + Math.random() * 15
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      // Random properties
      particlesRef.current.push({
        position: new THREE.Vector3(x, y, z),
        size: 0.02 + Math.random() * 0.08,
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
      const maxDistance = 25
      if (particle.position.length() > maxDistance) {
        const direction = particle.position.clone().normalize()
        particle.position.sub(direction.multiplyScalar(1))

        // Reverse direction slightly
        particle.speed.x *= -0.8
        particle.speed.y *= -0.8
        particle.speed.z *= -0.8
      }
    })
  })

  return (
    <group>
      {particlesRef.current.map((particle, i) => (
        <Sphere
          key={`floating-particle-${i}`}
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
    </group>
  )
}
