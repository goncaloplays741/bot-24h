const mineflayer = require('mineflayer');

// Função para criar o bot
function createBot() {
  const randomNumber = Math.floor(Math.random() * 900) + 100; // 100–999
  const BOT_USERNAME = `Nimercraft_${randomNumber}`;

  const bot = mineflayer.createBot({
    host: "nimerserverofc.progamer.me", // IP/domínio
    port: 18242,                        // Porta correta
    username: BOT_USERNAME,
    version: "1.12.2",                  // Confirma a versão do teu servidor
    connectTimeout: 30000               // Timeout aumentado
  });

  // Evento quando o bot entra
  bot.on('spawn', () => {
    console.log(`[AfkBot] Conectado como ${bot.username}`);
  });

  // Evento se der erro
  bot.on('error', err => {
    console.log(`[AfkBot ERROR] ${err.message}`);
    // Reconecta após 10s se houver erro
    setTimeout(createBot, 10000);
  });

  // Evento se desconectar
  bot.on('end', () => {
    console.log("[AfkBot] Bot desconectado, reconectando em 10s...");
    setTimeout(createBot, 10000);
  });
}

// Inicia o bot
createBot();
