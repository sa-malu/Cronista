const { LOG_CHANNEL_ID, PUNISH_LOG_CHANNEL_ID } = require("../config");

async function sendLog(guild, embed) {
  const ch = await guild.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
  if (ch) await ch.send({ embeds: [embed] });
}

async function sendPunishLog(guild, embed) {
  const ch = await guild.channels.fetch(PUNISH_LOG_CHANNEL_ID).catch(() => null);
  if (ch) await ch.send({ embeds: [embed] });
}

module.exports = { sendLog, sendPunishLog };
