const mineflayer = require('mineflayer');

function createBot() {
  const randomNumber = Math.floor(Math.random() * 900) + 100; // 100–999
  const BOT_USERNAME = `Nimercraft_${randomNumber}`;

  const bot = mineflayer.createBot({
    host: "nimerserverofc.progamer.me", // IP/domínio do servidor Minecraft
    port: 18242,                        // Porta do servidor (não funciona no Render)
    username: BOT_USERNAME,
    version: "1.12.2",
    connectTimeout: 30000
  });

  bot.on('spawn', () => {
    console.log(`[AfkBot] Conectado como ${bot.username}`);
  });

  bot.on('error', err => {
    console.log(`[AfkBot ERROR] ${err.message}`);
    if (err.code === 'ETIMEDOUT') {
      console.log('[AfkBot] Timeout detectado. Verifica se a host permite TCP na porta.');
    }
    setTimeout(createBot, 10000);
  });

  bot.on('end', () => {
    console.log("[AfkBot] Bot desconectado, reconectando em 10s...");
    setTimeout(createBot, 10000);
  });
}

// Inicia o bot
createBot();
