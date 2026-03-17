import { GoogleGenAI } from "@google/genai";
import { LovedOne } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function identifyPerson(imageBase64: string, lovedOnes: LovedOne[]): Promise<LovedOne | null> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an assistant for an Alzheimer's patient. 
    I will provide an image and a list of loved ones. 
    Identify if the person in the image matches any of the loved ones provided.
    
    Loved Ones List:
    ${lovedOnes.map(lo => `ID: ${lo.id}, Name: ${lo.name}, Relationship: ${lo.relationship}`).join('\n')}
    
    If there is a match, return ONLY the ID of the matched loved one.
    If there is no match, return "NONE".
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64.split(',')[1] || imageBase64
              }
            }
          ]
        }
      ]
    });

    const result = response.text?.trim();
    if (result && result !== "NONE") {
      return lovedOnes.find(lo => lo.id === result) || null;
    }
  } catch (error) {
    console.error("Error identifying person:", error);
  }

  return null;
}
