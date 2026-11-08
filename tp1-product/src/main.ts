import { buildApp } from './app.js';

// Récupération du port depuis les variables d'environnement (.env ou défaut 3000)
const port = Number(process.env.PORT ?? 3000);

// Démarrage de l'écoute HTTP
buildApp().listen(port, () => {
  console.log(`[product] Serveur démarré sur http://localhost:${port}`);
});
