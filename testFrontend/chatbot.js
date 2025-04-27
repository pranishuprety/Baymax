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
  