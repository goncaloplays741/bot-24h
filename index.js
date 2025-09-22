const mineflayer = require('mineflayer');

// Função para criar o bot
function createBot() {
  // Gera um nome de bot aleatório
  const randomNumber = Math.floor(Math.random() * 900) + 100; // 100–999
  const BOT_USERNAME = `Nimercraft_${randomNumber}`;

  // Cria o bot
  const bot = mineflayer.createBot({
    host: "nimerserverofc.progamer.me", // IP/domínio do servidor Minecraft
    port: 48642,                         // Porta atualizada
    username: BOT_USERNAME,
    version: "1.12.2",                   // Confirma a versão do servidor
    connectTimeout: 30000                 // Timeout aumentado
  });

  // Quando o bot entra no servidor
  bot.on('spawn', () => {
    console.log(`[AfkBot] Conectado como ${bot.username}`);
  });

  // Se ocorrer algum erro
  bot.on('error', err => {
    console.log(`[AfkBot ERROR] ${err.code || err.message}`);
    
    // Mensagem específica se houver timeout
    if (err.code === 'ETIMEDOUT') {
      console.log('[AfkBot] Timeout: verifica se a host permite conexão TCP na porta.');
    }

    // Reconecta em 10 segundos
    setTimeout(createBot, 10000);
  });

  // Se o bot desconectar
  bot.on('end', () => {
    console.log("[AfkBot] Bot desconectado, reconectando em 10s...");
    setTimeout(createBot, 10000);
  });
}

// Inicia o bot
createBot();
