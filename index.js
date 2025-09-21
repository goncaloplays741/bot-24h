const mineflayer = require("mineflayer");
const {
  pathfinder,
  Movements,
  goals: { GoalBlock },
} = require("mineflayer-pathfinder");
const express = require("express");
const config = require("./settings.json");

const app = express();

// Servidor web para manter o bot "acordado"
app.get("/", (req, res) => res.send("Bot AFK online ✅"));
app.listen(process.env.PORT || 5000, "0.0.0.0", () =>
  console.log("Servidor web rodando na porta", process.env.PORT || 5000)
);

let currentBot = null;
let reconnectTimeout = null;
let activeIntervals = [];

// Função de cleanup
function cleanup() {
  activeIntervals.forEach((i) => clearInterval(i));
  activeIntervals = [];
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = null;

  if (currentBot) {
    currentBot.removeAllListeners();
    try { currentBot.quit(); } catch {}
    currentBot = null;
  }
}

// Reconexão segura
function scheduleReconnect(delay = config.utils["auto-reconnect-delay"] || 5000) {
  if (reconnectTimeout) return;
  console.log(`[AfkBot] Reconectando em ${delay / 1000}s...`);
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    createBot();
  }, delay);
}

// Função principal do bot
function createBot() {
  cleanup();

  // Gera nome aleatório para evitar duplicate_login
  const BOT_USERNAME = `${config["bot-account"].username}_${Math.floor(Math.random() * 1000)}`;

  currentBot = mineflayer.createBot({
    username: BOT_USERNAME,
    password: config["bot-account"].password,
    auth: config["bot-account"].type,
    host: config.server.ip,
    port: config.server.port,
    version: config.server.version,
    connectTimeout: 60000, // aumenta timeout para conexões lentas
  });

  const bot = currentBot;
  bot.loadPlugin(pathfinder);

  let mcData, defaultMove;
  try {
    mcData = require("minecraft-data")(bot.version);
    defaultMove = new Movements(bot, mcData);
  } catch (err) {
    console.error("[ERROR] Falha ao carregar minecraft-data:", err.message);
  }

  bot.once("spawn", async () => {
    console.log(`[AfkBot] Bot entrou no servidor como ${bot.username}`);

    // Chat messages seguras
    if (config.utils["chat-messages"].enabled && config.utils["chat-messages"].messages.length) {
      let i = 0;
      const chatInterval = setInterval(() => {
        if (bot && !bot.ended) {
          try { bot.chat(config.utils["chat-messages"].messages[i]); } catch {}
          i = (i + 1) % config.utils["chat-messages"].messages.length;
        }
      }, config.utils["chat-messages"]["repeat-delay"] * 1000);
      activeIntervals.push(chatInterval);
    }

    // Anti-AFK seguro
    if (config.utils["anti-afk"].enabled) {
      if (config.utils["anti-afk"].jump) bot.setControlState("jump", true);
      if (config.utils["anti-afk"].sneak) bot.setControlState("sneak", true);

      if (config.utils["anti-afk"].move || config.utils["anti-afk"].rotate) {
        const afkInterval = setInterval(() => {
          if (bot && !bot.ended) {
            try {
              if (config.utils["anti-afk"].move) {
                ["forward", "back", "left", "right"].forEach((dir) =>
                  bot.setControlState(dir, Math.random() > 0.5)
                );
              }
              if (config.utils["anti-afk"].rotate) {
                bot.look(Math.random() * 360, Math.random() * 90 - 45);
              }
            } catch {}
          }
        }, 7000); // menos frequente para não sobrecarregar
        activeIntervals.push(afkInterval);
      }
    }

    // Posicionamento
    if (config.position.enabled && defaultMove) {
      try {
        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new GoalBlock(config.position.x, config.position.y, config.position.z));
      } catch {}
    }
  });

  // Eventos de reconexão
  bot.on("end", () => {
    console.log("[AfkBot] Conexão encerrada");
    if (config.utils["auto-reconnect"]) scheduleReconnect();
  });

  bot.on("kicked", (reason) => {
    console.log(`[AfkBot] Kickado: ${reason}`);
    if (config.utils["auto-reconnect"]) scheduleReconnect();
  });

  bot.on("error", (err) => {
    console.error("[AfkBot ERROR]", err.message);
    if (config.utils["auto-reconnect"]) scheduleReconnect(10000);
  });

  bot.on("death", () => console.log("[AfkBot] Bot morreu e respawnou"));
  bot.on("goal_reached", () => console.log("[AfkBot] Objetivo alcançado"));
}

// Encerramento gracioso
process.on("SIGINT", () => { cleanup(); process.exit(0); });
process.on("SIGTERM", () => { cleanup(); process.exit(0); });

// Inicia o bot
createBot();
