const mineflayer = require('mineflayer')

// Função para criar o bot
function createBot() {
  const bot = mineflayer.createBot({
    host: "nimerserverofc.progamer.me", // IP/domínio
    port: 48642,                        // tua porta correta
    username: `Nimercraft_${Math.floor(Math.random() * 1000)}`, // nome aleatório
    version: "1.12.2"                   // versão do teu servidor
  })

  // Evento quando o bot entra
  bot.on('spawn', () => {
    console.log(`[AfkBot] Conectado como ${bot.username}`)
  })

  // Evento se der erro
  bot.on('error', err => {
    console.log(`[AfkBot ERROR] ${err}`)
  })

  // Evento se desconectar
  bot.on('end', () => {
    console.log("[AfkBot] Reconectando em 10s...")
    setTimeout(createBot, 10000)
  })
}

// Inicia o bot
createBot()
