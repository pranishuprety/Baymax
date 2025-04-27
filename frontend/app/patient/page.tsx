"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, Send, Calendar, Book, BarChart2, MessageSquare, Bell, Sparkles } from "lucide-react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, Float, Text, Html } from "@react-three/drei"
import { VirtualAssistant } from "@/components/virtual-assistant"
import { FloatingMenu } from "@/components/floating-menu"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { MoodTracker } from "@/components/mood-tracker"
import { NeuralParticles } from "@/components/neural-particles"

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
  timestamp: Date
  thinking?: boolean
}

export default function PatientDashboard() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm your AI therapist. How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [isListening, setIsListening] = useState(false)
  const [showMoodTracker, setShowMoodTracker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getAIResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes("anxious") || lowerInput.includes("anxiety")) {
      return "I notice you're feeling anxious. Let's practice a quick breathing exercise together. Breathe in for 4 counts, hold for 4, and exhale for 6. Would you like to try that now?";
    } else if (lowerInput.includes("sad") || lowerInput.includes("depressed") || lowerInput.includes("unhappy")) {
      return "I'm sorry to hear you're feeling down. Remember that your emotions are valid, and it's okay to not be okay sometimes. Would you like to talk about what might be contributing to these feelings?";
    } else if (lowerInput.includes("happy") || lowerInput.includes("good") || lowerInput.includes("great")) {
      return "I'm glad to hear you're feeling positive today! What's something that contributed to your good mood that we could note for future reference?";
    } else if (lowerInput.includes("tired") || lowerInput.includes("exhausted") || lowerInput.includes("sleep")) {
      return "Sleep and rest are crucial for mental health. Have you been having trouble with your sleep routine lately? We could discuss some strategies for better sleep hygiene.";
    } else {
      const responses = [
        "I understand how you're feeling. Would you like to talk more about that?",
        "That's interesting. How does that make you feel when you think about it more deeply?",
        "I'm here to support you. What else is on your mind today?",
        "Thank you for sharing that with me. Let's explore this further - how long have you been feeling this way?",
        "It sounds like you're going through a lot. Remember to be kind to yourself during this process.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev: Message[]) => {
      const updated = [...prev, newMessage];
      // Show AI is thinking
      const thinkingMessage: Message = {
        id: updated.length + 1,
        content: "Thinking...",
        sender: "ai",
        timestamp: new Date(),
        thinking: true,
      };
      setTimeout(() => {
        setMessages((prev2: Message[]) => {
          // Remove thinking message and add AI response
          const filtered = prev2.filter((msg) => !msg.thinking);
          const aiResponse: Message = {
            id: filtered.length + 1,
            content: getAIResponse(input),
            sender: "ai",
            timestamp: new Date(),
          };
          return [...filtered, aiResponse];
        });
      }, 1200);
      return [...updated, thinkingMessage];
    });
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    setIsListening((prev) => {
      if (!prev) {
        setTimeout(() => {
          setIsListening(false);
          setInput("I've been feeling anxious about my upcoming presentation.");
        }, 2000);
      }
      return !prev;
    });
  };

  const menuItems = [
    { icon: <Calendar className="h-5 w-5" />, label: "Appointment", color: "bg-blue-500" },
    {
      icon: <Book className="h-5 w-5" />,
      label: "Mood Diary",
      color: "bg-green-500",
      onClick: () => setShowMoodTracker(!showMoodTracker),
    },
    { icon: <BarChart2 className="h-5 w-5" />, label: "Progress", color: "bg-purple-500" },
    { icon: <MessageSquare className="h-5 w-5" />, label: "Messages", color: "bg-yellow-500" },
    { icon: <Bell className="h-5 w-5" />, label: "Notifications", color: "bg-red-500" },
  ]

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-gray-900 text-white">
      {/* 3D Background with Virtual Assistant */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />

          <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
            <VirtualAssistant position={[0, -1, -3]} />
          </Float>

          <NeuralParticles count={100} />

          <Environment preset="studio" />
          <OrbitControls enableZoom={false} enablePan={false} />

          {/* 3D UI Elements */}
          <Float position={[-5, 2, -5]} speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <Text font="/fonts/Inter_Bold.json" fontSize={0.5} color="#a78bfa" anchorX="center" anchorY="middle">
              MindfulAI
            </Text>
          </Float>

          <Float position={[5, 3, -6]} speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.5} />
            </mesh>
          </Float>

          <Float position={[-4, -2, -4]} speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
            <mesh>
              <torusGeometry args={[0.7, 0.2, 16, 32]} />
              <meshStandardMaterial color="#8b5cf6" wireframe />
            </mesh>
          </Float>

          {/* Floating HTML content */}
          <Html position={[4, -3, -2]} transform distanceFactor={10}>
            <div className="bg-purple-900/80 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30 shadow-lg w-40">
              <h3 className="text-sm font-bold text-white mb-1">Today's Goal</h3>
              <p className="text-xs text-purple-200">Complete breathing exercise</p>
            </div>
          </Html>
        </Canvas>
      </div>

      {/* Floating Menu */}
      <FloatingMenu items={menuItems} />

      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full px-4">
        <header className="py-4 border-b border-purple-800/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-900/50 text-purple-200 border-purple-500/30 px-3 py-1 flex items-center">
                <Sparkles className="h-3 w-3 mr-1 text-purple-300" />
                AI Therapist Session
              </Badge>
            </div>
            <Badge className="bg-green-900/50 text-green-200 border-green-500/30 px-3 py-1">
              Online
            </Badge>
          </div>
        </header>
        <ScrollArea className="flex-grow py-4 px-2">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message: Message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.sender === "ai" && (
                    <Avatar className="h-8 w-8 mr-2 border-2 border-purple-500/50">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback className="bg-purple-700">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <Card
                    className={`px-4 py-2 max-w-[80%] ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white border-none shadow-lg shadow-purple-900/20"
                        : message.thinking
                          ? "bg-gray-800/70 text-gray-300 border-gray-700/50"
                          : "bg-gray-800/70 backdrop-blur-sm text-gray-100 border-gray-700/50"
                    }`}
                  >
                    {message.thinking ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></div>
                        <div
                          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </Card>
                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8 ml-2 border-2 border-purple-500/50">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback className="bg-violet-700">ME</AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        </ScrollArea>

        <div className="py-4 px-2">
          <div className="flex items-center space-x-2">
            <Button
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${isListening ? "bg-red-500 text-white border-red-400" : "bg-gray-800 border-purple-500/30 hover:bg-purple-900/50"}`}
              onClick={toggleListening}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Input
              className="bg-gray-800/50 backdrop-blur-sm border-purple-500/30 focus:border-purple-400 transition-colors"
              placeholder="Type your message..."
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              variant="default"
              size="icon"
              className="rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md"
              onClick={handleSendMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
        </div>
      </div>

      {/* Mood Tracker Overlay */}
      <AnimatePresence>
        {showMoodTracker && (
          <motion.div
            className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <MoodTracker onClose={() => setShowMoodTracker(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
