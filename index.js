const mineflayer = require('mineflayer');
const ngrok = require('ngrok');

(async () => {
  const tunnel = await ngrok.connect({
    proto: 'tcp',
    addr: 48642,
  });

  const [host, port] = tunnel.replace('tcp://', '').split(':');

  const bot = mineflayer.createBot({
    host,
    port: parseInt(port),
    username: 'Nimercraft_123',
    version: '1.12.2',
    connectTimeout: 30000,
  });

  bot.on('spawn', () => {
    console.log(`[AfkBot] Conectado como ${bot.username}`);
  });

  bot.on('error', (err) => {
    console.log(`[AfkBot ERROR] ${err.code || err.message}`);
    setTimeout(() => process.exit(1), 10000);
  });

  bot.on('end', () => {
    console.log('[AfkBot] Bot desconectado, reconectando em 10s...');
    setTimeout(() => process.exit(1), 10000);
  });
})();
