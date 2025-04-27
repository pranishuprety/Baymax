"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, BarChart2, FileText, Settings, Search, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Canvas } from "@react-three/fiber";
import { Environment, Float, Text } from "@react-three/drei";

export default function DoctorDashboard() {
  const [showChatbot, setShowChatbot] = useState(false);

  const patients = [
    { id: 1, name: "Alex Johnson", avatar: "AJ", lastVisit: "2 days ago", status: "Stable", conditions: ["Anxiety", "Depression"] },
    { id: 2, name: "Morgan Smith", avatar: "MS", lastVisit: "1 week ago", status: "Improving", conditions: ["PTSD"] },
    { id: 3, name: "Jamie Williams", avatar: "JW", lastVisit: "Yesterday", status: "Needs attention", conditions: ["Bipolar Disorder"] },
    { id: 4, name: "Taylor Brown", avatar: "TB", lastVisit: "3 days ago", status: "Stable", conditions: ["Anxiety"] },
  ];

  const appointments = [
    { id: 1, patient: "Alex Johnson", time: "10:00 AM", duration: "30 minutes", type: "Follow-up" },
    { id: 2, patient: "Morgan Smith", time: "11:30 AM", duration: "45 minutes", type: "Therapy" },
    { id: 3, patient: "Jamie Williams", time: "2:00 PM", duration: "60 minutes", type: "Initial Assessment" },
    { id: 4, patient: "Taylor Brown", time: "4:15 PM", duration: "30 minutes", type: "Medication Review" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-gray-900 text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 flex-col bg-gray-900/80 backdrop-blur-sm min-h-screen p-4 border-r border-purple-500/20">
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-purple-400">BayMax!</h1>
            <Badge className="ml-2 bg-purple-600 text-white border-none">Doctor</Badge>
          </div>

          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start hover:bg-purple-900/20 hover:text-purple-200">
              <Calendar className="mr-2 h-5 w-5" />
              Appointments
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-purple-900/20 hover:text-purple-200">
              <Users className="mr-2 h-5 w-5" />
              Patients
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-purple-900/20 hover:text-purple-200">
              <BarChart2 className="mr-2 h-5 w-5" />
              Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-purple-900/20 hover:text-purple-200">
              <FileText className="mr-2 h-5 w-5" />
              Reports
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-purple-900/20 hover:text-purple-200">
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start mt-8 bg-purple-900/30 hover:bg-purple-900/50 hover:text-purple-200 border border-purple-500/30"
              onClick={() => setShowChatbot(!showChatbot)}
            >
              <Brain className="mr-2 h-5 w-5 text-purple-400" />
              AI Assistant
            </Button>
          </nav>

          {/* 3D Background Element */}
          <div className="mt-auto h-48 relative overflow-hidden rounded-lg border border-purple-500/20">
            <Canvas>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Environment preset="studio" />

              <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh>
                  <sphereGeometry args={[1.5, 32, 32]} />
                  <meshStandardMaterial color="#6a3de8" emissive="#6a3de8" emissiveIntensity={0.5} wireframe />
                </mesh>
              </Float>

              <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
                <Text
                  font="/fonts/Inter_Bold.json"
                  fontSize={0.3}
                  position={[0, 0, 0]}
                  color="#a78bfa"
                  anchorX="center"
                  anchorY="middle"
                >
                  BayMax!
                </Text>
              </Float>
            </Canvas>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-purple-400">
                  Doctor Dashboard
                </h1>
                <p className="text-purple-300">Welcome back, Dr. Smith</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-8 bg-gray-800/50 border-purple-500/30 focus:border-purple-400 w-64"
                  />
                </div>

                <Avatar className="h-10 w-10 border-2 border-purple-500/50">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback className="bg-purple-700">DS</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-purple-500/20 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-200">Total Patients</CardTitle>
                <CardDescription>Active patients under your care</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end">
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-purple-400">42</p>
                  <Badge className="ml-2 mb-1 bg-green-600 text-white border-none">+3 this month</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border-purple-500/20 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-200">Today's Appointments</CardTitle>
                <CardDescription>Scheduled for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end">
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-purple-400">6</p>
                  <Badge className="ml-2 mb-1 bg-blue-600 text-white border-none">+2 today</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          <div className="bg-gray-800/50 backdrop-blur-sm border-purple-500/20 shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-purple-200">Upcoming Appointments</h2>
            <ul className="space-y-4">
              {appointments.map((appt) => (
                <li key={appt.id} className="flex justify-between items-center border-b border-purple-500/10 pb-2">
                  <div>
                    <p className="font-semibold">{appt.patient}</p>
                    <p className="text-sm text-purple-400">{appt.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{appt.time}</p>
                    <p className="text-sm text-purple-400">{appt.duration}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div> {/* End of flex-1 */}
      </div> {/* End of flex */}
    </div>
  );
}
