const { GoogleGenAI } = require('@google/genai');
const config = require('../config/config');

const genAI = new GoogleGenAI(config.geminiApiKey);

/**
 * Uses Gemini Pro Vision (or 1.5 Flash) to extract structured survey data 
 * from images, PDFs, or CSV text.
 */
async function extractSurveyData(fileBuffer, mimeType, fileName) {
  if (!config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Define the extraction target schema for Gemini
  const prompt = `
    You are an AI assistant for SevaLink, an NGO aid platform.
    Look at this survey document (image, PDF, or data) and extract the community need information.
    
    Extract the following fields accurately:
    - name (Full name of the person needing help)
    - householdId (Any ID number on the form, else generate HH-YYYY-NNNN)
    - city (The city mentioned)
    - area (Specific area, neighborhood, or zone)
    - needType (Must be one of: Food, Medical, Shelter, Education, Other)
    - quantity (e.g., "5 people", "3 boxes", "Monthly")
    - urgency (low, medium, high, or critical)
    - notes (Any other relevant details like medical conditions or specific requests)
    
    If there are other fields unique to this form (e.g., "Number of children", "Allergies"), 
    include them in a special "metadata" object.
    
    Also, provide a "confidence" score (0-1) for each extracted field.
    
    Return ONLY a valid JSON object in this format:
    {
      "extracted": {
        "name": "...",
        "householdId": "...",
        "city": "...",
        "area": "...",
        "needType": "...",
        "quantity": "...",
        "urgency": "...",
        "notes": "...",
        "metadata": { ... }
      },
      "confidence": {
        "name": 0.95,
      }
    }
  `;

  try {
    const response = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType
        }
      }
    ]);

    let text = response.response.text().trim();
    if (text.startsWith('```')) {
      text = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }

    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini Extraction Error:', err.message);
    throw new Error('AI could not extract data from the file. Please ensure the file is clear and readable.');
  }
}

module.exports = { extractSurveyData };
