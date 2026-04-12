import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // We might need to use fetch directly to see the real error
dotenv.config();

async function checkModels() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Checking models for key starting with:", key.substring(0, 10));
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
       console.error("API Error:", data.error.message);
       return;
    }
    
    console.log("Available models:");
    data.models.forEach(m => console.log(` - ${m.name}`));
  } catch (err) {
    console.error("Connection error:", err.message);
  }
}

checkModels();
