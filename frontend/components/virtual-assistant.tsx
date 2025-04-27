"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, Torus, Trail } from "@react-three/drei"
import * as THREE from "three"

export function VirtualAssistant({ position = [0, 0, 0] }) {
  const groupRef = useRef()
  const particlesRef = useRef([])
  const orbitRef = useRef()
  const pulseRef = useRef(0)

  // Generate particles for the assistant visualization
  if (particlesRef.current.length === 0) {
    for (let i = 0; i < 80; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 0.8 + Math.random() * 0.2

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      particlesRef.current.push({
        position: new THREE.Vector3(x, y, z),
        originalPosition: new THREE.Vector3(x, y, z),
        size: 0.05 + Math.random() * 0.05,
        color: new THREE.Color().setHSL(0.55 + Math.random() * 0.2, 0.9, 0.7),
        speed: 0.01 + Math.random() * 0.02,
        offset: Math.random() * Math.PI * 2,
        orbitRadius: 0.1 + Math.random() * 0.3,
        orbitSpeed: 0.5 + Math.random() * 1.5,
      })
    }
  }

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005

      // Pulse effect
      pulseRef.current += delta * 0.5
      const pulse = Math.sin(pulseRef.current) * 0.05 + 1

      // Animate particles
      particlesRef.current.forEach((particle, i) => {
        const time = state.clock.getElapsedTime()

        // Create pulsing effect
        const pulseScale = 0.1 * Math.sin(time * particle.speed + particle.offset) + 1

        // Create orbital movement
        const orbitAngle = time * particle.orbitSpeed
        const orbitX = Math.cos(orbitAngle) * particle.orbitRadius
        const orbitY = Math.sin(orbitAngle) * particle.orbitRadius
        const orbitZ = Math.sin(orbitAngle * 0.7) * particle.orbitRadius

        // Update particle position with pulse, orbit and breathing
        particle.position.x = (particle.originalPosition.x * pulseScale + orbitX) * pulse
        particle.position.y = (particle.originalPosition.y * pulseScale + orbitY) * pulse
        particle.position.z = (particle.originalPosition.z * pulseScale + orbitZ) * pulse
      })

      // Animate orbit ring
      if (orbitRef.current) {
        orbitRef.current.rotation.x += 0.01
        orbitRef.current.rotation.z += 0.005
      }
    }
  })

  return (
    <group position={position} ref={groupRef}>
      {/* Core sphere with glow */}
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color="#6a3de8"
          emissive="#6a3de8"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* Inner energy core */}
      <Sphere args={[0.35, 32, 32]}>
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#a78bfa"
          emissiveIntensity={1}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.7}
        />
      </Sphere>

      {/* Orbiting torus */}
      <group ref={orbitRef}>
        <Torus args={[1.2, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.8} />
        </Torus>

        <Torus args={[1, 0.02, 16, 100]} rotation={[0, 0, Math.PI / 3]}>
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.8} />
        </Torus>

        <Torus args={[0.8, 0.015, 16, 100]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <meshStandardMaterial color="#c4b5fd" emissive="#c4b5fd" emissiveIntensity={0.8} />
        </Torus>
      </group>

      {/* Energy particles */}
      {particlesRef.current.map((particle, i) => (
        <group key={`assistant-particle-${i}`}>
          <Trail
            width={0.05}
            length={5}
            color={new THREE.Color(particle.color)}
            attenuation={(width) => width}
            visible={i % 5 === 0} // Only add trails to some particles
          >
            <Sphere
              position={[particle.position.x, particle.position.y, particle.position.z]}
              args={[particle.size, 8, 8]}
            >
              <meshStandardMaterial
                color={particle.color}
                emissive={particle.color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
              />
            </Sphere>
          </Trail>

          {/* Regular particles without trails */}
          {i % 5 !== 0 && (
            <Sphere
              position={[particle.position.x, particle.position.y, particle.position.z]}
              args={[particle.size, 8, 8]}
            >
              <meshStandardMaterial
                color={particle.color}
                emissive={particle.color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
              />
            </Sphere>
          )}
        </group>
      ))}
    </group>
  )
}
