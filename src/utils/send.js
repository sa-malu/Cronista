const MSG_CACHE_MAX = 2000;
const msgCache = new Map();

function cacheMessage(message) {
  if (!message?.id || !message.guildId) return;

  const attachments = [];
  if (message.attachments?.size) {
    for (const [, att] of message.attachments) {
      attachments.push({ name: att.name, url: att.url });
    }
  }

  msgCache.set(message.id, {
    content: message.content ?? "",
    authorId: message.author?.id ?? null,
    authorTag: message.author?.tag ?? "Desconhecido",
    channelId: message.channelId,
    createdAt: Date.now(),
    attachments,
  });

  if (msgCache.size > MSG_CACHE_MAX) {
    const firstKey = msgCache.keys().next().value;
    msgCache.delete(firstKey);
  }
}

function getCached(messageId) {
  return msgCache.get(messageId);
}

module.exports = { cacheMessage, getCached };
