"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Stars, Cloud, Float, Text3D, OrbitControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Brain } from "@/components/brain"
import { FloatingParticles } from "@/components/floating-particles"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = (userType: string) => {
    if (userType === "patient") {
      router.push("/patient")
    } else {
      router.push("/doctor")
    }
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-black via-purple-950 to-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 to-transparent animate-pulse-slow"></div>

      {/* 3D Background */}
      <Canvas className="absolute inset-0">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Main brain visualization */}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <Brain position={[0, 0, -5]} scale={[3, 3, 3]} rotation={[0, Math.PI / 4, 0]} />
        </Float>

        {/* Floating clouds for atmosphere */}
        <Cloud position={[-4, -2, -10]} speed={0.4} opacity={0.2} />
        <Cloud position={[4, 3, -10]} speed={0.2} opacity={0.2} />

        {/* 3D Text */}
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
          <Text3D
            font="https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/fonts/helvetiker_regular.typeface.json"
            position={[0, 3, -5]}
            scale={[0.5, 0.5, 0.1]}
            curveSegments={32}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            BayMax!
            <meshStandardMaterial
              color="#a78bfa"
              emissive="#7c3aed"
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </Text3D>
        </Float>

        <FloatingParticles count={100} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="text-center mb-8">
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            BayMax AI Therapist
          </motion.h1>
          <motion.p
            className="text-xl text-purple-200 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your personal AI companion for mental wellness and professional development
          </motion.p>
        </div>

        {!showLogin ? (
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-10 py-7 text-lg rounded-xl mb-4 w-64 shadow-lg shadow-purple-900/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-800/50"
              onClick={() => setShowLogin(true)}
            >
              Get Started
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-[380px] bg-black/40 border border-purple-500/20 backdrop-blur-xl shadow-xl shadow-purple-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-center text-2xl">Welcome Back</CardTitle>
                <CardDescription className="text-purple-200 text-center">
                  Choose your account type to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="patient" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="patient">Patient</TabsTrigger>
                    <TabsTrigger value="doctor">Doctor</TabsTrigger>
                  </TabsList>
                  <TabsContent value="patient">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-purple-100">
                          Email
                        </Label>
                        <Input
                          id="email"
                          placeholder="Enter your email"
                          className="bg-purple-950/30 border-purple-500/30 focus:border-purple-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-purple-100">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="bg-purple-950/30 border-purple-500/30 focus:border-purple-400 transition-colors"
                        />
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md shadow-purple-900/30 transition-all duration-300"
                        onClick={() => handleLogin("patient")}
                      >
                        Login as Patient
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="doctor">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="doctor-email" className="text-purple-100">
                          Email
                        </Label>
                        <Input
                          id="doctor-email"
                          placeholder="Enter your email"
                          className="bg-purple-950/30 border-purple-500/30 focus:border-purple-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doctor-password" className="text-purple-100">
                          Password
                        </Label>
                        <Input
                          id="doctor-password"
                          type="password"
                          placeholder="••••••••"
                          className="bg-purple-950/30 border-purple-500/30 focus:border-purple-400 transition-colors"
                        />
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md shadow-purple-900/30 transition-all duration-300"
                        onClick={() => handleLogin("doctor")}
                      >
                        Login as Doctor
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center pb-6">
                <Button variant="link" className="text-purple-300 hover:text-white">
                  New user? Create an account
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  )
}
