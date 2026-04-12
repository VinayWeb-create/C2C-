import { geminiModel } from '../config/gemini.js';
import Service from '../models/Service.js';

const SYSTEM_CONTEXT = `You are the expert career assistant for "C2C — Campus to Corporate", a specialized platform that bridges the gap between students/freelancers and corporate needs. We provide digital services like Web Development, Graphic Design, SEO, Video Editing, PPT Presentations, and Content Writing.

Your job is to:
1. Understand which digital or professional service the user needs
2. Extract key info: service type (category), budget (in INR), project scope, urgency
3. Respond in a professional, career-focused, and helpful tone
4. Always respond in JSON format with this structure:
{
  "reply": "your friendly response text",
  "intent": "search_service | general_query | booking_help | greeting | other",
  "extracted": {
    "category": "Web Development | Graphic Design | PPT Presentations | SEO | etc or null",
    "maxPrice": number or null,
    "city": "client preference or null",
    "urgency": "urgent | scheduled | null"
  }
}`;

// Chat with Gemini — returns parsed intent + reply
export const chatWithAI = async (userMessage, conversationHistory = []) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY is not configured in .env file');
    return {
      reply: "I'm currently in offline mode. Please contact the administrator to enable AI features.",
      intent: 'other',
      extracted: { category: null, maxPrice: null, city: null, urgency: null },
    };
  }

  try {
    // Gemini requires the history to start with a 'user' message.
    // Skip the initial assistant greeting if it's the first message.
    const validHistory = [];
    let foundFirstUser = false;
    
    for (const m of conversationHistory) {
      if (m.role === 'user') foundFirstUser = true;
      if (foundFirstUser) {
        validHistory.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        });
      }
    }

    const chat = geminiModel.startChat({
      history: validHistory,
    });

    const prompt = `${SYSTEM_CONTEXT}\n\nUser message: "${userMessage}"\n\nEnsure the response is valid JSON according to the schema.`;
    const result = await chat.sendMessage(prompt);
    const text   = result.response.text();

    try {
      // If we used responseMimeType: "application/json", text is already JSON
      return JSON.parse(text);
    } catch (parseErr) {
      // Fallback: Find JSON block if Gemini still adds conversational text
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const clean = jsonMatch ? jsonMatch[0] : text;
        return JSON.parse(clean);
      } catch (innerErr) {
        console.error('Gemini JSON Parse Error:', innerErr.message, 'Raw text:', text);
        return {
          reply: "I understand you're looking for help. Could you please specify a bit more?",
          intent: 'general_query',
          extracted: { category: null, maxPrice: null, city: null, urgency: null },
        };
      }
    }
  } catch (err) {
    console.error('Gemini Chat Error:', err.message);
    return {
      reply: "I'm experiencing a temporary connection issue. Please try again in a moment!",
      intent: 'other',
      extracted: { category: null, maxPrice: null, city: null, urgency: null },
    };
  }
};

// Smart recommendations — score services by rating, price, and bookings
export const getAIRecommendations = async (category, maxPrice, city, limit = 6) => {
  const query = { isActive: true };
  if (category) query.category = new RegExp(category, 'i');
  if (maxPrice)  query['price.amount'] = { $lte: maxPrice };
  if (city)      query['location.city'] = new RegExp(city, 'i');

  const services = await Service.find(query)
    .populate('provider', 'name avatar')
    .limit(50);

  // Score each service: 50% rating, 30% price (lower = better), 20% bookings
  const maxBookings = Math.max(...services.map((s) => s.totalBookings || 0), 1);
  const maxPrice_   = Math.max(...services.map((s) => s.price.amount), 1);

  const scored = services.map((s) => {
    const ratingScore  = (s.rating.average / 5) * 50;
    const priceScore   = (1 - s.price.amount / maxPrice_) * 30;
    const bookingScore = (s.totalBookings / maxBookings) * 20;
    return { ...s.toObject(), score: ratingScore + priceScore + bookingScore };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
};

// Generate AI description for a service listing
export const generateServiceDescription = async (title, category, price) => {
  try {
    const prompt = `Write a professional 2-sentence service description for a ${category} provider named "${title}" charging ₹${price}. Keep it concise and appealing for Indian customers. Reply with only the description text.`;
    const result = await geminiModel.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return '';
  }
};
