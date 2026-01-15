// server/routes/geminiRoutes.js - VERSION AVEC IA RÉELLE
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// 🔧 FORCER le chargement du .env
dotenv.config();

const router = express.Router();

// DEBUG des variables
console.log('🔍 [GEMINI DEBUG] GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'PRÉSENTE' : 'ABSENTE');

// Vérifier si la clé API est configurée
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

router.post('/generate-seo', async (req, res) => {
  try {
    const { departure, arrival, routesData } = req.body;
    
    console.log('🤖 [GEMINI] Début génération SEO IA pour:', departure, '→', arrival);
    
    // Si Gemini n'est pas configuré, utiliser la version manuelle
    if (!genAI) {
      console.warn('⚠️ [GEMINI] Clé API non configurée - Fallback manuel');
      return sendManualSeo(res, departure, arrival, routesData);
    }

    // Préparer les données pour l'IA
    const routeInfo = {
      departure,
      arrival,
      companyCount: routesData?.length || 0,
      minPrice: routesData?.length > 0 ? Math.min(...routesData.map(r => r.priceRange?.min || r.price || 6000)) : 6000,
      maxPrice: routesData?.length > 0 ? Math.max(...routesData.map(r => r.priceRange?.max || r.price || 8000)) : 8000,
      duration: routesData?.[0]?.estimatedDuration || '5-6 heures',
      hasVIP: routesData?.some(route => route.busType === 'vip') || false,
      amenities: routesData?.[0]?.amenities || []
    };

    console.log('📊 [GEMINI] Données préparées pour IA:', routeInfo);

    // Prompt optimisé pour l'IA
    const prompt = `
Tu es un expert SEO et rédacteur spécialisé dans le transport en bus en Côte d'Ivoire. 

Génère un contenu SEO UNIQUE et OPTIMISÉ pour une page qui compare les compagnies de bus sur le trajet : ${departure} → ${arrival}

**CONTEXTE :**
- Trajet : ${departure} vers ${arrival}
- Prix : ${routeInfo.minPrice} - ${routeInfo.maxPrice} FCFA
- Durée : ${routeInfo.duration}
- Nombre de compagnies : ${routeInfo.companyCount}
- Service : Conciergerie indépendante (nous ne sommes PAS une compagnie de transport)
- Public cible : Voyageurs ivoiriens cherchant des bus fiables et économiques

**GÉNÈRE UNIQUEMENT UN JSON AVEC :**
1. "title" : 55-70 caractères, accrocheur, avec prix et mots-clés
2. "description" : 150-160 caractères, persuasive avec emojis
3. "h1" : Titre principal engageant, 40-60 caractères  
4. "content" : 3-4 phrases riches en informations utiles et naturelles

**STYLE :**
- Ton naturel et conversationnel
- Inclure des émotions (sérénité, confiance, économie)
- Utiliser des mots-clés locaux
- Adapter au contexte ivoirien

**FORMAT DE RÉPONSE STRICT :**
{
  "title": "",
  "description": "",
  "h1": "", 
  "content": ""
}
`;

    console.log('🚀 [GEMINI] Appel à l\'IA Gemini...');
    
   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📨 [GEMINI] Réponse brute de l\'IA:', text);

    // Extraire le JSON de la réponse
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ [GEMINI] Format de réponse IA invalide');
      throw new Error('Format de réponse Gemini invalide');
    }
    
    const seoContent = JSON.parse(jsonMatch[0]);
    
    // Validation du contenu
    if (!seoContent.title || !seoContent.description || !seoContent.h1 || !seoContent.content) {
      console.error('❌ [GEMINI] Champs manquants dans la réponse IA');
      throw new Error('Réponse IA incomplète');
    }

    console.log('✅ [GEMINI] SEO généré par IA:', seoContent);
    
    res.json({
      success: true,
      data: seoContent,
      source: 'gemini_ai'
    });
    
  } catch (error) {
    console.error('❌ [GEMINI] Erreur IA:', error);
    
    // Fallback vers la version manuelle en cas d'erreur
    console.log('🔄 [GEMINI] Fallback vers version manuelle');
    sendManualSeo(res, req.body.departure, req.body.arrival, req.body.routesData);
  }
});

// Fonction fallback manuelle
function sendManualSeo(res, departure, arrival, routesData) {
  const companyCount = routesData?.length || 0;
  const minPrice = routesData?.length > 0 ? Math.min(...routesData.map(r => r.priceRange?.min || r.price || 6000)) : 6000;
  const duration = routesData?.[0]?.estimatedDuration || '5-6 heures';
  
  const seoContent = {
    title: `Bus ${departure} → ${arrival} dès ${minPrice} FCFA | Goudron-Connect 2025`,
    description: `🚌 ${departure} ${arrival} en bus dès ${minPrice} FCFA • ${duration} • ${companyCount} compagnies • Service conciergerie indépendant`,
    h1: `Bus ${departure} - ${arrival} : ${minPrice} FCFA ⭐ ${duration}`,
    content: `Réservez votre bus entre ${departure} et ${arrival} en toute sérénité. Notre service de conciergerie indépendant compare ${companyCount} compagnies pour vous garantir le meilleur prix.`
  };
  
  console.log('📝 [MANUEL] SEO manuel généré:', seoContent);
  
  res.json({
    success: true,
    data: seoContent,
    source: 'manual_fallback'
  });
}

export default router;