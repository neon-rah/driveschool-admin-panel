"use client"; // Assurez-vous que ce fichier est exécuté côté client uniquement

import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Créez une instance de Pusher
const pusherClient = new Pusher(process.env.NEXT_PUBLIC_REVERB_APP_KEY || "my-app-key", {
    cluster: "custom", // Valeur arbitraire, ignorée avec wsHost
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
    forceTLS: false, // Mettez à true si vous utilisez HTTPS
    enabledTransports: ["ws"], // Utilisez WebSocket uniquement
    disableStats: true // Optionnel : désactive les stats pour réduire les logs
});

// Configurez Laravel Echo avec le client Pusher
const echo = new Echo({
    broadcaster: "reverb",
    client: pusherClient, // Passez explicitement le client Pusher
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
    wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
    wssPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
    forceTLS: false,
    enabledTransports: ["ws"],
});

export default echo;