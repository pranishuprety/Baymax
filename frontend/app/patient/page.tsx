'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Float, Text } from '@react-three/drei';
import { VirtualAssistant } from '@/components/virtual-assistant';
import { NeuralParticles } from '@/components/neural-particles';
import { FloatingMenu } from '@/components/floating-menu';
import { Calendar, Book, BarChart2, MessageSquare, Bell, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { MoodTracker } from '@/components/mood-tracker';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
}

export default function PatientDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [detectedEmotion, setDetectedEmotion] = useState('…');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: "Hello! I'm your AI therapist. How are you feeling today?", sender: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [showMoodTracker, setShowMoodTracker] = useState(false);

  const menuItems = [
    { icon: <Calendar className="h-5 w-5" />, label: 'Appointment', color: 'bg-blue-500' },
    { icon: <Book className="h-5 w-5" />, label: 'Mood Diary', color: 'bg-green-500' },
    { icon: <BarChart2 className="h-5 w-5" />, label: 'Progress', color: 'bg-purple-500' },
    { icon: <MessageSquare className="h-5 w-5" />, label: 'Messages', color: 'bg-yellow-500' },
    { icon: <Bell className="h-5 w-5" />, label: 'Notifications', color: 'bg-red-500' },
  ];

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e: any) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setVoiceText(transcript);
    };
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else { recognitionRef.current?.start(); setIsListening(true); }
  };

  const captureEmotion = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
    try {
      const res = await fetch('http://localhost:3001/detectEmotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      const emo = data.faces?.[0]?.attributes?.emotion;
      if (emo) {
        const [best] = Object.entries(emo).sort((a, b) => b[1] - a[1]);
        setDetectedEmotion(best[0]);
      } else {
        setDetectedEmotion('unknown');
      }
    } catch {
      setDetectedEmotion('error');
    }
  };

  const handleSend = async () => {
    const text = mode === 'voice' ? voiceText : input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: prev.length + 1, content: text, sender: 'user' }]);
    setInput(''); setVoiceText('');
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch('http://localhost:3001/therapist/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: token || 'guest', message: text }),
      });
      const { reply } = await resp.json();
      setMessages(prev => [...prev, { id: prev.length + 1, content: reply, sender: 'ai' }]);
    } catch {
      setMessages(prev => [...prev, { id: prev.length + 1, content: `I heard: ${text}`, sender: 'ai' }]);
    }
  };

  return (
    <div className="relative h-screen bg-gray-900 text-white">
      {/* 3D Background */}
      <Canvas className="absolute inset-0">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Float><VirtualAssistant position={[0, -1, -3]} /></Float>
        <NeuralParticles count={100} />
        <Environment preset="studio" />
        <OrbitControls enableZoom={false} enablePan={false} />
        <Float position={[0, 2, -2]}>
          <Text fontSize={0.5} color="#a78bfa">BayMax!</Text>
        </Float>
      </Canvas>

      {/* Floating Menu */}
      <FloatingMenu items={menuItems} />

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col md:flex-row h-full max-w-6xl mx-auto w-full pt-16 gap-4">
        {/* Left */}
        <div className="w-full md:w-1/3 flex flex-col items-center p-4 space-y-4">
          <video ref={videoRef} className="w-full h-auto bg-black rounded" autoPlay playsInline />
          <Button onClick={captureEmotion} className="w-full bg-purple-600">🎥 Capture Emotion</Button>
          <Badge className="w-full text-center bg-gray-800">{detectedEmotion}</Badge>
          <Button variant={mode === 'chat' ? 'solid' : 'outline'} className="w-full" onClick={() => setMode('chat')}>Chat Mode</Button>
          <Button variant={mode === 'voice' ? 'solid' : 'outline'} className="w-full" onClick={() => setMode('voice')}>Voice Mode</Button>
        </div>

        {/* Right */}
        <div className="w-full md:w-2/3 flex flex-col p-4">
          <ScrollArea className="flex-grow bg-gray-800/50 rounded-lg p-2 overflow-auto">
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {msg.sender === 'ai' && (
                    <Avatar className="h-8 w-8 mr-2"><AvatarFallback>AI</AvatarFallback></Avatar>
                  )}
                  <Card className={`px-4 py-2 max-w-[70%] ${msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                    {msg.content}
                  </Card>
                  {msg.sender === 'user' && (
                    <Avatar className="h-8 w-8 ml-2"><AvatarFallback>U</AvatarFallback></Avatar>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </ScrollArea>

          {/* Input Section */}
          <div className="flex gap-2 mt-2">
            {mode === 'chat' ? (
              <>
                <Input
                  className="flex-grow"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your message..."
                />
                <Button onClick={handleSend} className="bg-purple-600">Send</Button>
              </>
            ) : (
              <>
                <Button onClick={toggleListening} className={`bg-purple-600 ${isListening ? 'animate-pulse' : ''}`}>
                  <Mic className="mr-2" /> {isListening ? 'Listening...' : 'Start Voice'}
                </Button>
                <Input
                  className="flex-grow"
                  value={voiceText}
                  onChange={e => setVoiceText(e.target.value)}
                  placeholder="Speak or edit your message..."
                />
                <Button onClick={handleSend} className="bg-purple-600">Send</Button>
              </>
            )}
          </div>

          {/* Mood Tracker Toggle */}
          <Button className="mt-4 bg-green-600" onClick={() => setShowMoodTracker(v => !v)}>
            {showMoodTracker ? 'Hide Mood Tracker' : 'Show Mood Tracker'}
          </Button>
          <AnimatePresence>
            {showMoodTracker && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4"
              >
                <MoodTracker />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
