import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateStoryFromImage(imageBase64: string, mood: string, context: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: imageBase64.split(',')[1] || imageBase64, mimeType: "image/jpeg" } },
        { text: `Mood: ${mood}. Context: ${context}. Create a short, evocative narrative for this memory.` }
      ]
    },
    config: {
      systemInstruction: "You are a warm, nostalgic storyteller helping an Alzheimer's patient remember a moment. Create a short, evocative narrative based on the image. Return a JSON object with title, location, date, and narrative fields.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          location: { type: Type.STRING },
          date: { type: Type.STRING },
          narrative: { type: Type.STRING }
        },
        required: ["title", "location", "date", "narrative"]
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return {
      title: "A Special Moment",
      location: "Home",
      date: "Some time ago",
      narrative: response.text
    };
  }
}

export async function generateStoryAudio(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}

export async function generateSamplePhoto() {
  // This is a mock for the simulation in the UI
  return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800";
}

export async function generateMusic(mood: string) {
  // In a real app, this might call a music generation model. 
  // For now, we'll return a placeholder or mock.
  // Since the UI expects a base64 PCM, we'll return null to indicate no music for now or a very short silent clip.
  return null;
}
