import asyncHandler from '../utils/asyncHandler.js';
import { chatWithAI, getAIRecommendations } from '../services/aiService.js';
import { getRecommendedServices, getTrendingServices } from '../services/recommendationService.js';

// @desc    AI Chatbot
// @route   POST /api/ai/chat
// @access  Private
export const chat = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message?.trim()) {
    res.status(400);
    throw new Error('Message is required');
  }

  const aiResponse = await chatWithAI(message, history);

  // If AI detected a service search intent, fetch recommendations
  let services = [];
  if (aiResponse.intent === 'search_service' && aiResponse.extracted?.category) {
    const { category, maxPrice, city } = aiResponse.extracted;
    services = await getAIRecommendations(category, maxPrice, city);
  }

  res.json({
    success: true,
    reply:    aiResponse.reply,
    intent:   aiResponse.intent,
    extracted: aiResponse.extracted,
    services,
  });
});

// @desc    Get smart recommendations
// @route   GET /api/ai/recommendations
// @access  Private
export const getRecommendations = asyncHandler(async (req, res) => {
  const { category, maxPrice, city } = req.query;

  const services = await getRecommendedServices({
    category,
    maxPrice,
    city,
    userId: req.user._id,
  });

  res.json({ success: true, services });
});

// @desc    Get trending services
// @route   GET /api/ai/trending
// @access  Public
export const trending = asyncHandler(async (req, res) => {
  const services = await getTrendingServices(8);
  res.json({ success: true, services });
});
