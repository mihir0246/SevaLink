const { GoogleGenAI } = require('@google/genai');
const config = require('../config/config');

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

/**
 * Mirrors OVP's assignVolunteers mutation but enhanced with Gemini AI.
 * Instead of random pickVolunteer(), Gemini semantically ranks volunteers
 * by skill match, availability, and recipient needs.
 *
 * @param {Array} recipients - unassigned recipients with their needs
 * @param {Array} volunteers - available volunteers with skills
 * @returns {Array} AI-ranked matches [{recipientId, volunteerId, matchScore, reason}]
 */
async function matchVolunteersToRecipients(recipients, volunteers) {
  if (!config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️  Gemini API key not set — using fallback random matching');
    return fallbackMatching(recipients, volunteers);
  }

  try {
    const prompt = `
You are an intelligent volunteer coordinator for SevaLink, a community aid platform.

Your task is to optimally assign volunteers to community needs (recipients).

RECIPIENTS (people needing help):
${JSON.stringify(recipients.map(r => ({
  id: r._id,
  name: `${r.firstName} ${r.lastName}`,
  city: r.city,
  needType: r.needType,
  urgency: r.urgency,
  preferredProducts: r.preferredProducts
})), null, 2)}

AVAILABLE VOLUNTEERS:
${JSON.stringify(volunteers.map(v => ({
  id: v._id,
  name: `${v.firstName} ${v.lastName}`,
  skills: v.skills,
  city: v.city,
  canDeliver: v.canDeliver,
  rating: v.rating,
  actionsCompleted: v.actionsCompleted
})), null, 2)}

For each recipient, select the single best matching volunteer based on:
1. Skill relevance to the need type (e.g., Medical skills for Medical needs)
2. Same or nearby city
3. Higher rating and experience
4. Delivery capability for Food/Shelter needs

Return ONLY a valid JSON array (no markdown). Each object must have:
- "recipientId": string (the recipient's _id)
- "volunteerId": string (the best volunteer's _id)
- "matchScore": number 0-100
- "reason": string (brief explanation under 20 words)

Do not assign the same volunteer to more than one recipient if possible.
`;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    // Strip markdown code fences if present
    if (text.startsWith('```')) {
      text = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }

    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini API error:', err.message);
    console.warn('Falling back to random matching...');
    return fallbackMatching(recipients, volunteers);
  }
}

/**
 * Direct port of OVP's pickVolunteer() logic — used as fallback
 * if Gemini API key is not configured.
 */
function fallbackMatching(recipients, volunteers) {
  const pickedVolunteers = new Set();
  return recipients.map(recipient => {
    let volunteerIndex = Math.round(Math.random() * (volunteers.length - 1));
    let attempts = 0;
    while (pickedVolunteers.has(volunteers[volunteerIndex]._id.toString()) && attempts < volunteers.length) {
      volunteerIndex = (volunteerIndex + 1) % volunteers.length;
      attempts++;
    }
    const volunteer = volunteers[volunteerIndex];
    pickedVolunteers.add(volunteer._id.toString());
    return {
      recipientId: recipient._id.toString(),
      volunteerId: volunteer._id.toString(),
      matchScore: Math.floor(60 + Math.random() * 30),
      reason: 'Random assignment (Gemini API key not set)',
    };
  });
}

module.exports = { matchVolunteersToRecipients };
