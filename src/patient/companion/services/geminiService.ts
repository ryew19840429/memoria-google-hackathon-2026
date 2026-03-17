import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const COMPANION_OPTIONS = [
  { id: 'nurse', name: 'Nurse Sarah', avatar: '👩‍⚕️', description: 'Professional and calm', imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400' },
  { id: 'friend', name: 'Old Friend', avatar: '🤝', description: 'Warm and familiar', imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400' },
  { id: 'family', name: 'Family Member', avatar: '🏠', description: 'Loving and patient', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400' }
];

export const VOICE_OPTIONS = [
  { id: 'kore', name: 'Kore', voiceName: 'Kore' },
  { id: 'puck', name: 'Puck', voiceName: 'Puck' },
  { id: 'fenrir', name: 'Fenrir', voiceName: 'Fenrir' }
];

export async function generateCompanionResponse(prompt: string, history: any[], context: string, systemInstruction: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      ...history,
      { role: 'user', parts: [{ text: `Context about the patient:\n${context}\n\nUser message: ${prompt}` }] }
    ],
    config: {
      systemInstruction,
      temperature: 0.7,
      tools: [{ googleMaps: {} }]
    }
  });
  return response.text;
}

export async function verifyAddress(address: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Verify this address and provide a brief description of the area: ${address}`,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const mapsUri = groundingChunks?.find((chunk: any) => chunk.maps?.uri)?.maps?.uri;
    
    return {
      text: response.text,
      mapsUri
    };
  } catch (e) {
    console.error("Address verification failed:", e);
    return null;
  }
}

export async function generateSpeech(text: string, voiceName: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;
  
  if (base64Audio) {
    return { data: base64Audio, mimeType: mimeType || 'audio/pcm;rate=24000' };
  }
  return null;
}
