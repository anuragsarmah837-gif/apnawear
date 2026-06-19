import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// API: Health probe
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Server-side AI Stylist API route
app.post('/api/stylist', async (req, res) => {
  const { budget, gender, age, occasion, weather, stylePreference } = req.body;

  // Validate request inputs
  if (!occasion || !gender) {
    return res.status(400).json({ error: 'Gender and Occasion parameters are needed.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    // Generate a high-fidelity offline fallback representation
    // to secure continuous execution without failure
    const offlineResult = generateOfflineRecommendation(budget, gender, age, occasion, weather, stylePreference);
    return res.json({
      ...offlineResult,
      isOffline: true,
      notice: 'Using beautiful local expert engine.'
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const userPrompt = `
      As India's premier fashion designer and e-commerce stylist, design a premium yet budget-friendly fashion outfit composition for a customer with these preferences:
      - Budget preference: Under ${budget || '₹499'}
      - Target Gender Segment: ${gender}
      - Target Age Segment: ${age || 'Any'}
      - Occasion category: ${occasion}
      - Weather conditions: ${weather || 'Normal'}
      - Aesthetic Style Prefers: ${stylePreference || 'Traditional meets contemporary'}

      Available product catalog IDs for reference matching:
      - Men: m1 (Sanganeri Kurta, ₹399), m2 (Khadi Shirt, ₹349), m3 (Indigo Solid Shirt, ₹299), m4 (Comfort Joggers, ₹249), m5 (Kashmiri Waistcoat, ₹449)
      - Women: w1 (Jaipuri Anarkali Kurti, ₹429), w2 (Kalamkari Palazzo, ₹199), w3 (Meadow Smocked Top, ₹279), w4 (Bhagalpuri Silk Dupatta, ₹189), w5 (Chanderi Boho Tunic, ₹349)
      - Kids: k1 (Organic Jumpsuit, ₹149), k2 (Bandhani Kids Kurta Set, ₹399), k3 (Jungle Play Tees, ₹199), k4 (Elastic Cargo Shorts, ₹249)
      - Regional: r1 (Assam Eri Cotton stole, ₹449), r2 (Bengal Tant Scarf, ₹179), r3 (Phulkari Short Kurti, ₹349), r4 (Bagru Handbag & Dupatta Duo, ₹299), r5 (Kerala Kasavu Gold border stole, ₹249)

      Suggest 3-4 clothing slot items (like Topwear, Bottomwear, Accent, or Accessory) and try to match with the most relevant product IDs where appropriate.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: "You are the premium Indian fashion consultant and stylist AI. Always suggest cohesive color coordinate plans under ₹499. Provide clear details with traditional charm.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Captivating and elegant title for the personalized outfit' },
            description: { type: Type.STRING, description: 'Charming description highlighting why these items blend perfectly' },
            occasion: { type: Type.STRING },
            vibe: { type: Type.STRING, description: 'Fashion vibe, e.g., Traditional Indian Elegance, Boho College Casual' },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slot: { type: Type.STRING, description: 'e.g. Topwear, Bottomwear, Accent layer, Accessory' },
                  styleIdea: { type: Type.STRING, description: 'Detailed styling instruction' },
                  suggestedColor: { type: Type.STRING, description: 'Specific shade matching the composition' },
                  productMatchId: { type: Type.STRING, description: 'The exact ID from the available catalog (e.g., m1, w1, r3) that matches best' }
                },
                required: ['slot', 'styleIdea', 'suggestedColor']
              }
            },
            expertTip: { type: Type.STRING, description: 'A brief practical styling advice' },
            trendForecast: { type: Type.STRING, description: 'An intelligent fashion forecast for current Indian families' }
          },
          required: ['title', 'description', 'occasion', 'vibe', 'items', 'expertTip', 'trendForecast']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);

  } catch (error: any) {
    console.error('Gemini API execution error:', error);
    // Propagate fallback recommendation gracefully so UI is robust
    const offlineResult = generateOfflineRecommendation(budget, gender, age, occasion, weather, stylePreference);
    return res.json({
      ...offlineResult,
      isOffline: true,
      errorNotice: 'Gemini dynamic request error, returned beautiful expert look.'
    });
  }
});

// Offline styling matching engine
function generateOfflineRecommendation(
  budget: string,
  gender: string,
  age: string,
  occasion: string,
  weather: string,
  stylePreference: string
) {
  const normalizedGender = (gender || 'Women').toLowerCase();
  const normalizedOccasion = (occasion || 'Casual').toLowerCase();

  if (normalizedGender.includes('women')) {
    if (normalizedOccasion.includes('festive') || normalizedOccasion.includes('ethnic') || normalizedOccasion.includes('party')) {
      return {
        title: 'Princes of Jaipur Festive Ensemble',
        description: 'A striking combinations of rich Jaipuri traditional patterns with lightweight modern layers. This ensemble brings royal elegance to your family festivities at fraction of the price.',
        occasion: 'Festive Celebrations',
        vibe: 'Traditional Royal Splendor',
        items: [
          { slot: 'Topwear', styleIdea: 'A gorgeous flared Jaipuri floral printed cotton Anarkali kurti', suggestedColor: 'Coral Pink / Rose Cream', productMatchId: 'w1' },
          { slot: 'Bottomwear', styleIdea: 'Comfort straight palazzo trouser with kalamkari styling', suggestedColor: 'Deep Ochre Yellow', productMatchId: 'w2' },
          { slot: 'Accent Layer', styleIdea: 'A royal Bhagalpuri silk border designer dupatta', suggestedColor: 'Gilded Golden Beige', productMatchId: 'w4' }
        ],
        expertTip: 'Pair with round metallic jhumkas and flat juttis or Kolhapuris to complement the ethnic prints.',
        trendForecast: 'Handmade block prints combined with lightweight silk borders are leading dynamic Indian streetwear.'
      };
    } else {
      return {
        title: 'Indo-Western Boho College Look',
        description: 'A highly functional and stylish outfit designed for active college sessions. Combines breathable fabrics with traditional earthy Kalamkari details for a contemporary look.',
        occasion: 'College & Smart Casuals',
        vibe: 'Modern Fusion & Bohemian charm',
        items: [
          { slot: 'Topwear', styleIdea: 'Meadow Smocked Georgette top with elasticated sleeves', suggestedColor: 'Sage Green / Pastel Lilac', productMatchId: 'w3' },
          { slot: 'Bottomwear', styleIdea: 'Comfort cotton straight Kalamkari print palazzo', suggestedColor: 'Terracotta Earth', productMatchId: 'w2' },
          { slot: 'Accessory', styleIdea: 'Traditional Bagru handprint handbag pouch', suggestedColor: 'Indigo Pattern', productMatchId: 'r4' }
        ],
        expertTip: 'Tuck the front of the top in slightly for a defined look, and carry a printed cotton tote bag.',
        trendForecast: 'Smocked western designs paired with handcrafted block-printed bottoms are highly trending with Indian youth.'
      };
    }
  } else if (normalizedGender.includes('men')) {
    if (normalizedOccasion.includes('festive') || normalizedOccasion.includes('ethnic') || normalizedOccasion.includes('wedding')) {
      return {
        title: 'Gentry of Rajasthan Traditional Look',
        description: 'An elegant composition combining royal motifs with comfortable lightweight organic cotton textures. Crafted for the modern Indian family man.',
        occasion: 'Festival Ceremony',
        vibe: 'Sophisticated Rajasthani Heritage',
        items: [
          { slot: 'Topwear', styleIdea: 'Sanganeri cotton block printed traditional mens kurta', suggestedColor: 'Ivory white with Emerald print', productMatchId: 'm1' },
          { slot: 'Layering Waistcoat', styleIdea: 'Elegant Kashmiri embroidered print waistcoat jacket', suggestedColor: 'Rich Maroon / Crimson Gold', productMatchId: 'm5' },
          { slot: 'Bottomwear', styleIdea: 'Breathable straight ethnic cotton pajamas or trousers', suggestedColor: 'Pristine Snow White', productMatchId: 'm1' }
        ],
        expertTip: 'Leave the waistcoat buttons partially undone to display the block-print details on the chest.',
        trendForecast: 'Nehru jackets layered over printed cotton kurtas are replacing heavy sherwanis for modern family gatherings.'
      };
    } else {
      return {
        title: 'Loom-Textured Everyday Professional Chic',
        description: 'A crisp, breathable daytime option featuring handcrafted textures. High style and extreme sweat absorbency combined.',
        occasion: 'Everyday Active Work',
        vibe: 'Eco-conscious Intellectual Casual',
        items: [
          { slot: 'Topwear', styleIdea: 'Handwoven textured Khadi minimalist casual shirt', suggestedColor: 'Olive Khaki / Natural Cream', productMatchId: 'm2' },
          { slot: 'Bottomwear', styleIdea: 'Flex lightweight athletic cotton joggers', suggestedColor: 'Deep Charcoal Gray', productMatchId: 'm4' },
          { slot: 'Accent', styleIdea: 'Traditional Assamese handloom Eri cotton weave stole', suggestedColor: 'Natural Warm Ivory', productMatchId: 'r1' }
        ],
        expertTip: 'Roll up the sleeves to the elbows to complement the relaxed texture of the Khadi fabric.',
        trendForecast: 'Khadi shirts are shifting from traditional roles to active millennial corporate casualwear.'
      };
    }
  } else {
    // Kids/Unisex falling back gracefully
    return {
      title: 'Comfort First Playful Joy Outfit',
      description: 'A delightful selection created with children in mind: completely non-irritant, breathable, and filled with cheerful patterns.',
      occasion: 'Active Playtime & Puja',
      vibe: 'Playful Indian Roots',
      items: [
        { slot: 'Ethnic Choice', styleIdea: 'Ethnic Bandhani Prints kids comfortably loose Kurta Set', suggestedColor: 'Bright Mango Yellow', productMatchId: 'k2' },
        { slot: 'Comfy Shortwear', styleIdea: 'Smart twill cotton cargo shorts with secure elastic waistband', suggestedColor: 'Khaki Sand', productMatchId: 'k4' },
        { slot: 'Accessories', styleIdea: 'Playful jungle animal graphic tees', suggestedColor: 'Jungle green', productMatchId: 'k3' }
      ],
      expertTip: 'Choose soft organic cotton slips under ethnic clothing to safeguard child skin against irritation.',
      trendForecast: 'Breathable ethnic clothing with elastic waists is preferred over traditional rigid dress for children.'
    };
  }
}

// Integrated Vite setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
