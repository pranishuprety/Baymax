'use client';
import { useEffect, useRef, useState } from 'react';

export async function sendToLLM(userMessage, emotion) {
    const emotionPromptMap = {
      happiness: "You're a cheerful AI therapist. Respond positively.",
      sadness: "You're an empathetic AI therapist. Respond gently.",
      anger: "You're a calm AI therapist. Help the user cool down.",
      fear: "You're a comforting therapist. Help them feel safe.",
      neutral: "You're a friendly therapist. Ask how they're doing.",
      surprise: "You're a supportive therapist. Ask what happened.",
      disgust: "You're a professional therapist. Ask what’s wrong."
    };
  
    const systemInstruction = emotionPromptMap[emotion] || "You're a helpful therapist.";
  
    const fullPrompt = `${systemInstruction}\nUser says: "${userMessage}"`;
  
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "fbcabddcee3623fb026f0547bffac488ed2494a106530e8e3e2ce861448a0d74"
      },
      body: JSON.stringify({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      })
    });
  
    const data = await response.json();
  
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      return "Sorry, I couldn’t come up with a response.";
    }
  }

  const axios = require("axios");
  const fs = require("fs");
  const FormData = require("form-data");
  
  require('dotenv').config();
  
  const apiKey = process.env.FACE_PLUS_PLUS_API_KEY;
  const apiSecret = process.env.FACE_PLUS_PLUS_API_SECRET;
  
  
  const imagePath = "./face.jpg"; // Make sure this image exists!
  
  async function detectEmotion() {
    const form = new FormData();
    form.append("api_key", apiKey);
    form.append("api_secret", apiSecret);
    form.append("image_file", fs.createReadStream(imagePath));
    form.append("return_attributes", "emotion");
  
    try {
      const response = await axios.post(
        "https://api-us.faceplusplus.com/facepp/v3/detect",
        form,
        {
          headers: form.getHeaders(),
        }
      );
  
      console.log("Detected emotions:");
      console.log(JSON.stringify(response.data.faces[0].attributes.emotion, null, 2));
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
    }
  }
  
  detectEmotion();
  
  

export default function ChatPage() {
  const chatRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // assume chatbot.js exposes a global `initChatbot`
    // and testFacePlusPlus.js exposes `initEmotionDetector`
    // you can import them or paste their code above this component
    // then call:
    // initEmotionDetector();
    // initChatbot(el => setMessages(msgs => [...msgs, el]));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">AI Chat & Emotion</h1>
      <div id="emotion-root" className="mb-4" />
      <div id="chat-root" ref={chatRef} className="border p-4 h-64 overflow-auto mb-4" />
      <input id="chat-input" className="border p-2 w-full" placeholder="Type your message…" />
    </div>
  );
}
