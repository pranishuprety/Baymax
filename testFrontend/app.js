const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");
const chatBox = document.getElementById("chatBox");
const stopBtn = document.getElementById("stopBtn");
const newChatBtn = document.getElementById("newChatBtn");
const pastChats = document.getElementById("pastChats");

let latestEmotion = "neutral";
let recognition = null;
let conversationHistory = [{ role: "system", content: "You are a helpful therapist." }];
let pastSessions = JSON.parse(localStorage.getItem("pastSessions")) || [];

// ✅ Text-to-Speech
function speakText(text) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.pitch = 1;
  utterance.rate = 1;
  synth.speak(utterance);
}

// ✅ Stop Talking
stopBtn.addEventListener("click", () => {
  window.speechSynthesis.cancel();
  if (recognition) recognition.stop();
});

// ✅ Add Message
function addMessage(role, text) {
  const message = document.createElement("div");
  message.innerHTML = `<strong>${role}:</strong> ${text}`;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ✅ Save Past Sessions
function savePastSessions() {
  localStorage.setItem("pastSessions", JSON.stringify(pastSessions));
}

// ✅ Render Past Chats (with Rename/Delete)
function renderPastChats() {
  pastChats.innerHTML = "";
  pastSessions.forEach((session, index) => {
    const chatItem = document.createElement("div");
    chatItem.classList.add("past-chat-item");

    const chatName = document.createElement("span");
    chatName.innerText = session.name || `Chat #${index + 1}`;
    chatName.style.cursor = "pointer";
    chatName.addEventListener("click", () => loadSession(index));

    const renameBtn = document.createElement("button");
    renameBtn.innerText = "✏️";
    renameBtn.title = "Rename Chat";
    renameBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent triggering loadSession
      const newName = prompt("Enter new name:");
      if (newName) {
        session.name = newName;
        savePastSessions();
        renderPastChats();
      }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "🗑️";
    deleteBtn.title = "Delete Chat";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Are you sure you want to delete this chat?")) {
        pastSessions.splice(index, 1);
        savePastSessions();
        renderPastChats();
      }
    });

    chatItem.appendChild(chatName);
    chatItem.appendChild(renameBtn);
    chatItem.appendChild(deleteBtn);

    pastChats.appendChild(chatItem);
  });
}

// ✅ Load Past Session
function loadSession(index) {
  conversationHistory = [...pastSessions[index].conversation];
  chatBox.innerHTML = "";
  conversationHistory.forEach((msg) => {
    if (msg.role !== "system") {
      addMessage(msg.role === "user" ? "You" : "Therapist", msg.content);
    }
  });
}

// ✅ Start New Chat
newChatBtn.addEventListener("click", () => {
  const chatName = prompt("Enter a name for this chat:");
  if (chatName) {
    pastSessions.push({
      name: chatName,
      conversation: conversationHistory
    });
    savePastSessions();
    conversationHistory = [{ role: "system", content: "You are a helpful therapist." }];
    chatBox.innerHTML = "";
    renderPastChats();
  }
});

// 📷 Webcam Access
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => { video.srcObject = stream; })
  .catch((err) => { console.error("Error accessing webcam:", err); });

// 📸 Capture Face
captureBtn.addEventListener("click", async () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageBase64 = canvas.toDataURL("image/jpeg").split(",")[1]; // Get pure base64

  try {
    const response = await fetch("http://localhost:3001/detectEmotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64 })
    });

    const data = await response.json();

    if (data.faces && data.faces.length > 0) {
      const emotions = data.faces[0].attributes.emotion;
      const topEmotion = getTopEmotion(emotions);
      latestEmotion = topEmotion;
      addMessage("Emotion Detected", topEmotion);
      await sendMessageToLLM(`You just scanned someone's face and detected they are feeling ${topEmotion}.`);
    } else {
      addMessage("System", "No face detected.");
      latestEmotion = "neutral";
    }
  } catch (error) {
    console.error("Error detecting emotion:", error);
    addMessage("System", "Error detecting emotion.");
    latestEmotion = "neutral";
  }
});


async function sendMessageToLLM(userMessage) {
  const emotionPromptMap = {
    happiness: "You're a cheerful AI therapist. Respond positively.",
    sadness: "You're an empathetic AI therapist. Respond gently.",
    anger: "You're a calm AI therapist. Help the user cool down.",
    fear: "You're a comforting therapist. Help them feel safe.",
    neutral: "You're a friendly therapist. Ask how they're doing.",
    surprise: "You're a supportive therapist. Ask what happened.",
    disgust: "You're a professional therapist. Ask what’s wrong."
  };

  const systemInstruction = emotionPromptMap[latestEmotion] || "You're a helpful therapist.";
  conversationHistory[0] = { role: "system", content: systemInstruction };
  conversationHistory.push({ role: "user", content: userMessage });

  try {
    const apiKey = "fbcabddcee3623fb026f0547bffac488ed2494a106530e8e3e2ce861448a0d74"; // ⚡ Hardcoded key here
    if (!apiKey) {
      throw new Error("TOGETHER_AI_API_KEY is not set");
    }

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: conversationHistory,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const therapistText = data.choices[0].message.content;
      addMessage("Therapist", therapistText);
      speakText(therapistText);
      conversationHistory.push({ role: "assistant", content: therapistText });
    } else {
      addMessage("Therapist", "(no reply)");
    }
  } catch (error) {
    console.error("LLM error:", error);
    addMessage("Therapist", `(error getting response: ${error.message})`);
  }
}


// ✏️ Chat Mode Text
document.getElementById("sendBtn").addEventListener("click", async () => {
  const userInput = document.getElementById("userInput").value.trim();
  if (userInput) {
    addMessage("You", userInput);
    await sendMessageToLLM(userInput);
    document.getElementById("userInput").value = "";
  }
});

// 🎤 Voice Input
const startVoiceInputBtn = document.getElementById("startVoiceInputBtn");
const stopVoiceInputBtn = document.getElementById("stopVoiceInputBtn");
const voiceInputText = document.getElementById("voiceInputText");

startVoiceInputBtn.addEventListener("click", () => {
  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();

  if (!recognition) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      const spokenText = event.results[0][0].transcript;
      voiceInputText.innerText = `You said: "${spokenText}"`;
      addMessage("You (Voice)", spokenText);
      await sendMessageToLLM(spokenText);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error", event.error);
      voiceInputText.innerText = "Sorry, could not hear.";
    };

    recognition.onend = () => {
      voiceInputText.innerText = "Voice input ended.";
    };
  }

  recognition.start();
  voiceInputText.innerText = "Listening... 🎙️";
});

stopVoiceInputBtn.addEventListener("click", () => {
  if (recognition) {
    recognition.stop();
    voiceInputText.innerText = "Stopped Listening 🛑";
  }
});

// 🎚️ Mode Switching
const chatModeBtn = document.getElementById("chatModeBtn");
const voiceModeBtn = document.getElementById("voiceModeBtn");
const chatSection = document.getElementById("chatSection");
const voiceSection = document.getElementById("voiceSection");

voiceModeBtn.addEventListener("click", () => {
  chatSection.style.display = "none";
  voiceSection.style.display = "block";
});

chatModeBtn.addEventListener("click", () => {
  chatSection.style.display = "block";
  voiceSection.style.display = "none";
});

// 📦 Get Top Emotion
function getTopEmotion(emotionObject) {
  let topEmotion = "";
  let maxScore = -Infinity;
  for (const [emotion, score] of Object.entries(emotionObject)) {
    if (score > maxScore) {
      maxScore = score;
      topEmotion = emotion;
    }
  }
  return topEmotion;
}

// 🚀 Load past chats on startup
renderPastChats();
