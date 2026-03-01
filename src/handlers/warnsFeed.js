const { Events, EmbedBuilder } = require("discord.js");
const { SENESCAL_ID, SENESCAL_FEED_CHANNEL_ID } = require("../config");
const { sendPunishLog } = require("../utils/send");

module.exports = function registerWarnsFeed(client) {
  client.on(Events.MessageCreate, async (message) => {
    if (!message.guild) return;
    if (!SENESCAL_ID || !SENESCAL_FEED_CHANNEL_ID) return;

    if (message.channelId !== SENESCAL_FEED_CHANNEL_ID) return;
    if (message.author.id !== SENESCAL_ID) return;

    // Formato esperado:
    // WARN|targetId|motivo
    // UNWARN|targetId|motivo
    const text = (message.content || "").trim();
    const parts = text.split("|");
    const type = (parts[0] || "").toUpperCase();

    if (!["WARN", "UNWARN"].includes(type)) return;

    const targetId = parts[1]?.trim();
    const reason = parts.slice(2).join("|").trim() || "*Não informado*";

    const embed = new EmbedBuilder()
      .setColor(type === "WARN" ? "#C27C0E" : "#1B4F72")
      .setTitle(type === "WARN" ? "⚠️ Punição: Warn (Senescal)" : "✅ Punição: Warn removido (Senescal)")
      .addFields(
        { name: "Alvo", value: targetId ? `<@${targetId}>` : "*Indisponível*", inline: false },
        { name: "Motivo", value: reason.slice(0, 1024), inline: false }
      )
      .setTimestamp()
      .setFooter({ text: "Crônicas de Punições • Cronista" });

    await sendPunishLog(message.guild, embed);

    // opcional: apaga o feed pra não poluir
    await message.delete().catch(() => {});
  });
};
