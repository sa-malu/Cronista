const { Client, GatewayIntentBits, Partials, Events } = require("discord.js");
const { TOKEN } = require("./config");

const registerSingularidade = require("./handlers/singularidade");
const registerEscrituras = require("./handlers/escrituras");
const registerMessageLogs = require("./handlers/messageLogs");
const registerVoiceLogs = require("./handlers/voiceLogs");
const registerPunishmentsSenescal = require("./handlers/punishmentsSenescal");
const registerWarnsFeed = require("./handlers/warnsFeed");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,       // kick/timeout (member update/remove)
    GatewayIntentBits.GuildModeration,    // ✅ ban/unban e eventos de moderação
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.once(Events.ClientReady, () => {
  console.log(`📜 Cronista online como ${client.user.tag}`);
});

// ✅ handlers (tem que chamar)
registerSingularidade(client);
registerEscrituras(client);
registerMessageLogs(client);          // ✅ ESTE é o que tá faltando aí
registerVoiceLogs(client);
registerPunishmentsSenescal(client);
registerWarnsFeed(client);

client.login(TOKEN);

