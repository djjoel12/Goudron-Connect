import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// ===== Import routes mises à jour =====
import companyRoutes from "./routes/companyRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import enhancedRouteRoutes from "./routes/enhancedRouteRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js"; // ← NOUVEAU IMPORT

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; 

// ===== Pour __dirname en ES modules =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Middlewares =====
app.use(cors({ origin: "*" }));
app.use(express.json());

// ===== Create uploads folder if not exists =====
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ===== Serve static files (logos) =====
app.use("/uploads", express.static(uploadDir));

// ===== SERVIR LE FRONTEND REACT - CHEMIN CORRIGÉ =====
const clientBuildPath = path.join(__dirname, "../client/build");

console.log("📁 Chemin du build React:", clientBuildPath);

// Vérifier si le build existe
if (fs.existsSync(clientBuildPath)) {
  console.log("✅ Build React trouvé");
  app.use(express.static(clientBuildPath));
} else {
  console.warn("⚠️ Build React non trouvé à:", clientBuildPath);
}

// ===== Routes API =====
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Goudron-Connect API is running" });
});

app.use("/api/companies", companyRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/enhanced-routes", enhancedRouteRoutes);
app.use("/api/gemini", geminiRoutes); // ← NOUVELLE ROUTE AJOUTÉE

// ===== ROUTE CATCH-ALL SÉCURISÉE POUR REACT =====
app.use((req, res, next) => {
  // Si c'est une route API, continuer
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Si c'est un fichier statique, continuer
  if (req.path.includes('.')) {
    return next();
  }
  
  // Pour toutes les autres routes, servir index.html si le build existe
  if (fs.existsSync(clientBuildPath)) {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  } else {
    res.json({ 
      message: "ChapTicket API is running", 
      note: "Frontend build not found - run 'npm run build' in client directory" 
    });
  }
});

// ===== Database + Server start =====
async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("⚠️ MONGODB_URI non défini — démarrage sans DB");
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("✅ MongoDB connecté");
    }

    // Vérifier si la clé Gemini est configurée
    if (process.env.GEMINI_API_KEY) {
      console.log("🤖 Gemini API: Configurée");
    } else {
      console.warn("⚠️ Gemini API: Clé non configurée - GEMINI_API_KEY manquante dans .env");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Serveur lancé sur le port ${PORT}`);
      console.log(`🌐 Frontend React servi depuis: ${clientBuildPath}`);
      console.log(`🤖 Routes Gemini disponibles: /api/gemini/generate-seo`);
      
      // Log supplémentaire pour debug
      console.log("📁 Dossier courant:", process.cwd());
      console.log("📁 Dossier server:", __dirname);
    });
  } catch (err) {
    console.error("❌ Erreur au démarrage :", err);
    process.exit(1);
  }
}

start();
