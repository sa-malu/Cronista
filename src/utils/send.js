const { LOG_CHANNEL_ID, VOICE_LOG_CHANNEL_ID, PUNISH_LOG_CHANNEL_ID } = require("../config");

async function sendToChannel(guild, channelId, embed) {
  if (!channelId) return;
  const ch = await guild.channels.fetch(channelId).catch(() => null);
  if (!ch) return;
  await ch.send({ embeds: [embed] }).catch(() => {});
}

async function sendLog(guild, embed) {
  return sendToChannel(guild, LOG_CHANNEL_ID, embed);
}

async function sendVoiceLog(guild, embed) {
  return sendToChannel(guild, VOICE_LOG_CHANNEL_ID || LOG_CHANNEL_ID, embed);
}

async function sendPunishLog(guild, embed) {
  return sendToChannel(guild, PUNISH_LOG_CHANNEL_ID, embed);
}

module.exports = { sendLog, sendVoiceLog, sendPunishLog };
