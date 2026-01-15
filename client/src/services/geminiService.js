// src/services/geminiService.js
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'votre-api-key-gemini';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const generateSeoContent = async (departure, arrival, routesData = []) => {
  try {
    console.log('🔍 [GEMINI SERVICE] Début de génération SEO');
    console.log('📊 [GEMINI SERVICE] Données reçues:', {
      departure,
      arrival,
      routesCount: routesData.length,
      sampleRoute: routesData[0] || 'Aucune donnée'
    });

    // Données de base pour le contexte
    const companyCount = routesData.length;
    const minPrice = routesData.length > 0 ? Math.min(...routesData.map(r => r.priceRange?.min || r.price || 6000)) : 6000;
    const maxPrice = routesData.length > 0 ? Math.max(...routesData.map(r => r.priceRange?.max || r.price || 8000)) : 8000;
    const duration = routesData[0]?.estimatedDuration || '5-6 heures';
    
    console.log('📈 [GEMINI SERVICE] Statistiques calculées:', {
      companyCount,
      minPrice,
      maxPrice,
      duration
    });

    // Prompt optimisé pour le SEO
    const prompt = `
En tant qu'expert SEO et rédacteur spécialisé dans le transport en Côte d'Ivoire, génère un contenu optimisé pour la page : "Bus ${departure} → ${arrival}".

CONTEXTE:
- Trajet: ${departure} vers ${arrival}
- Prix: ${minPrice} - ${maxPrice} FCFA
- Durée: ${duration}
- Nombre de compagnies: ${companyCount}
- Service: Conciergerie indépendante (nous ne sommes PAS une compagnie de transport)

GÉNÈRE UN JSON AVEC:
1. title: 55-60 caractères, accrocheur, avec prix et année
2. description: 150-160 caractères, persuasive, avec emojis
3. h1: 40-50 caractères, engageant
4. content: 2-3 phrases riches en informations utiles

FORMAT DE RÉPONSE UNIQUEMENT:
{
  "title": "",
  "description": "", 
  "h1": "",
  "content": ""
}

Ton public: Voyageurs ivoiriens cherchant des bus fiables et économiques.
`;

    console.log('📝 [GEMINI SERVICE] Prompt généré:', prompt.substring(0, 200) + '...');
    
    // VÉRIFICATION DE LA CLÉ API
    console.log('🔑 [GEMINI SERVICE] Clé API utilisée:', GEMINI_API_KEY ? '***' + GEMINI_API_KEY.slice(-4) : 'NON DÉFINIE');
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'votre-api-key-gemini') {
      console.error('❌ [GEMINI SERVICE] CLÉ API MANQUANTE - Vérifie REACT_APP_GEMINI_API_KEY');
      throw new Error('Clé API Gemini non configurée');
    }

    const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    console.log('🌐 [GEMINI SERVICE] URL API:', apiUrl.replace(GEMINI_API_KEY, '***'));

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    console.log('🚀 [GEMINI SERVICE] Envoi requête à Gemini...');
    console.log('📦 [GEMINI SERVICE] Corps de la requête:', JSON.stringify(requestBody).substring(0, 300) + '...');

    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const endTime = Date.now();
    console.log(`⏱️ [GEMINI SERVICE] Réponse reçue après ${endTime - startTime}ms`);
    console.log('📨 [GEMINI SERVICE] Status HTTP:', response.status);
    console.log('📨 [GEMINI SERVICE] Status Text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [GEMINI SERVICE] Erreur HTTP détaillée:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Erreur Gemini ${response.status}: ${response.statusText}`);
    }

    console.log('✅ [GEMINI SERVICE] Réponse HTTP OK, traitement des données...');
    const data = await response.json();
    console.log('📄 [GEMINI SERVICE] Réponse brute Gemini:', data);

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ [GEMINI SERVICE] Structure de réponse invalide:', data);
      throw new Error('Structure de réponse Gemini invalide');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('📝 [GEMINI SERVICE] Texte généré:', generatedText);
    
    // Extraire le JSON de la réponse
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('🎉 [GEMINI SERVICE] JSON parsé avec succès:', parsedData);
        
        // Validation des champs requis
        const requiredFields = ['title', 'description', 'h1', 'content'];
        const missingFields = requiredFields.filter(field => !parsedData[field]);
        
        if (missingFields.length > 0) {
          console.error('❌ [GEMINI SERVICE] Champs manquants:', missingFields);
          throw new Error(`Champs manquants: ${missingFields.join(', ')}`);
        }
        
        console.log('✅ [GEMINI SERVICE] Génération SEO terminée avec succès');
        return parsedData;
      } catch (parseError) {
        console.error('❌ [GEMINI SERVICE] Erreur parsing JSON:', parseError);
        console.error('📄 [GEMINI SERVICE] Texte à parser:', jsonMatch[0]);
        throw new Error('Erreur de parsing JSON Gemini');
      }
    } else {
      console.error('❌ [GEMINI SERVICE] Aucun JSON trouvé dans la réponse');
      console.error('📄 [GEMINI SERVICE] Texte complet:', generatedText);
      throw new Error('Format de réponse Gemini invalide - JSON non trouvé');
    }

  } catch (error) {
    console.error('💥 [GEMINI SERVICE] Erreur complète:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    console.warn('🔄 [GEMINI SERVICE] Utilisation du contenu par défaut');
    const fallbackContent = getDefaultSeoContent(departure, arrival, routesData);
    console.log('📝 [GEMINI SERVICE] Fallback généré:', fallbackContent);
    
    return fallbackContent;
  }
};

// Fallback si Gemini échoue
const getDefaultSeoContent = (departure, arrival, routesData) => {
  console.log('🔄 [GEMINI SERVICE] Génération fallback manuel');
  
  const companyCount = routesData.length;
  const minPrice = routesData.length > 0 ? Math.min(...routesData.map(r => r.priceRange?.min || r.price || 6000)) : 6000;
  const duration = routesData[0]?.estimatedDuration || '5-6 heures';

  const fallback = {
    title: `Bus ${departure} → ${arrival} dès ${minPrice} FCFA | Goudron-Connect 2025`,
    description: `🚌 Bus ${departure}-${arrival} dès ${minPrice} FCFA • ${duration} • ${companyCount} compagnies • Service conciergerie indépendant • Réservation facile`,
    h1: `Bus ${departure} - ${arrival} : Comparaison ${companyCount} Compagnies`,
    content: `Réservez votre bus entre ${departure} et ${arrival} en toute sérénité. Notre service de conciergerie indépendant compare ${companyCount} compagnies pour vous garantir le meilleur prix et le plus grand confort. Trajet d'environ ${duration}.`
  };

  console.log('✅ [GEMINI SERVICE] Fallback créé:', fallback);
  return fallback;
};