console.log("✅ messageLogs handler carregado");

const { Events, EmbedBuilder, AuditLogEvent } = require("discord.js");
const { cacheMessage, getCached } = require("../utils/cache");
const { sendLog } = require("../utils/send");
const { findAuditExecutor } = require("../utils/audit");

module.exports = function registerMessageLogs(client) {
  client.on(Events.MessageCreate, (message) => {
    if (!message.guild) return;
    if (message.author?.bot) return;
    cacheMessage(message);
  });

  client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    console.log("✏️ UPDATE EVENT", {
      guild: !!newMessage.guild,
      channelId: newMessage.channelId,
      authorId: newMessage.author?.id,
      oldPartial: oldMessage.partial,
      newPartial: newMessage.partial
    });
    if (!newMessage.guild) return;
    if (newMessage.author?.bot) return;

    const before = (oldMessage.content ?? getCached(oldMessage.id)?.content ?? "").trim();
    const after = (newMessage.content ?? "").trim();

    cacheMessage(newMessage);

    if (before === after) return;

    const embed = new EmbedBuilder()
      .setColor("#C27C0E") // edit = laranja
      .setTitle("✏️ Registro: Mensagem Editada")
      .addFields(
        { name: "Canal", value: `<#${newMessage.channelId}>`, inline: true },
        { name: "Autor", value: `<@${newMessage.author.id}> (${newMessage.author.tag})`, inline: true },
        { name: "O que foi modificado", value: "Conteúdo textual foi alterado.", inline: false },
        { name: "Antes", value: before.length ? before.slice(0, 1024) : "*vazio*", inline: false },
        { name: "Depois", value: after.length ? after.slice(0, 1024) : "*vazio*", inline: false }
      )
      .setTimestamp()
      .setFooter({ text: "Margem • Alteração registrada" });

    if (newMessage.url) embed.addFields({ name: "Link", value: newMessage.url, inline: false });

    await sendLog(newMessage.guild, embed);
  });

  client.on(Events.MessageDelete, async (message) => {
  if (!message.guild) return;
  if (message.author?.bot) return;

  const cached = getCached(message.id);

  const authorId = message.author?.id || cached?.authorId;
  const authorTag = message.author?.tag || cached?.authorTag || "Desconhecido";
  const content = (message.content ?? cached?.content ?? "").trim();

  // 🔐 PROTEÇÃO DO AUDIT LOG AQUI
  let executor = null;

  try {
    executor = await findAuditExecutor(
      message.guild,
      AuditLogEvent.MessageDelete,
      authorId
    );
  } catch (e) {
    console.error("Erro ao buscar audit log:", e);
  }

  const embed = new EmbedBuilder()
    .setColor("#8B0000")
    .setTitle("🗑️ Registro: Mensagem Excluída")
    .addFields(
      { name: "Canal", value: `<#${message.channelId}>`, inline: true },
      {
        name: "Autor",
        value: authorId
          ? `<@${authorId}> (${authorTag})`
          : authorTag,
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter({ text: "Margem • Exclusão registrada" });

  if (executor?.executorId) {
    if (executor.executorId === authorId) {
      embed.addFields({
        name: "Ação",
        value: "O usuário apagou a própria mensagem.",
        inline: false,
      });
    } else {
      embed.addFields({
        name: "Ação",
        value: `<@${executor.executorId}> (${executor.executorTag}) apagou a mensagem deste autor.`,
        inline: false,
      });
    }
  } else {
    embed.addFields({
      name: "Ação",
      value: "Mensagem apagada (executor não identificável).",
      inline: false,
    });
  }

  if (content.length) {
    embed.addFields({
      name: "Mensagem",
      value: content.slice(0, 1024),
      inline: false,
    });
  } else {
    embed.addFields({
      name: "Mensagem",
      value: "*Conteúdo indisponível.*",
      inline: false,
    });
  }

  try {
    await sendLog(message.guild, embed);
  } catch (e) {
    console.error("Erro ao enviar log:", e);
  }
});
