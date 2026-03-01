module.exports = {
  TOKEN: process.env.TOKEN,

  CARGO_VERIFICADO: process.env.CARGO_VERIFICADO || "1476714100804554862",
  VEU_CHANNEL_ID: process.env.VEU_CHANNEL_ID,

  LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID, // geral
  VOICE_LOG_CHANNEL_ID: process.env.VOICE_LOG_CHANNEL_ID || null, // opcional
  PUNISH_LOG_CHANNEL_ID: process.env.PUNISH_LOG_CHANNEL_ID, // punições Senescal

  SENESCAL_ID: process.env.SENESCAL_ID || null,
  SENESCAL_FEED_CHANNEL_ID: process.env.SENESCAL_FEED_CHANNEL_ID || null,
};
