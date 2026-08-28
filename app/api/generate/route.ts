import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper function to retry if the model is busy (503 error)
async function generateWithRetry(prompt: string, retries = 3, delay = 1000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      return response.text;
    } catch (error: any) {
      // If it's a 503 (Unavailable) and we have retries left, wait and try again
      const isOverloaded = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('high demand');
      if (isOverloaded && i < retries - 1) {
        console.warn(`Model busy (503). Retrying attempt ${i + 2} in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

export async function POST(request: Request) {
  try {
    const { query, type } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const isClinical = type === 'Clinical Medicine';

    const prompt = isClinical
      ? `Provide structured medical information for the disease/condition: "${query}". 
         Return ONLY a valid JSON object with the following exact keys (use plain text with newlines/bullet points where appropriate):
         {
           "brand_names": "subtype or clinical variants if any",
           "body_systems": "primary body system (e.g., Cardiovascular, Respiratory, GI, etc.)",
           "pathophysiology": "pathology details",
           "cause": "etiology or causes",
           "symptoms": "signs and symptoms",
           "diagnostics_labs": "diagnostic tests, labs, or imaging needed",
           "treatment": "treatment guidelines, medications, or management",
           "complications": "consequences or complications"
         }`
      : `Provide structured pharmacological information for the medication: "${query}". 
         Return ONLY a valid JSON object with the following exact keys (use plain text with newlines where appropriate):
         {
           "brand_names": "common brand names separated by commas",
           "drug_class": "pharmacological class",
           "body_systems": "primary body system (e.g., Cardiovascular, GI / Renal, Central Nervous System, etc.)",
           "mechanism_of_action": "how the drug works",
           "indications": "primary uses and indications",
           "route": "routes of administration (e.g., PO, IV, Topical)",
           "side_effects": "common side effects and adverse reactions",
           "contraindications": "contraindications and major warnings",
           "clinical_pearls": "important study or clinical pearls"
         }`;

    const textResponse = await generateWithRetry(prompt);
    
    if (!textResponse) {
      throw new Error('No response received from Gemini.');
    }

    const parsedData = JSON.parse(textResponse);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate AI data.' }, { status: 500 });
  }
}