const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder,
  AuditLogEvent,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN;
const CARGO_VERIFICADO = "1476714100804554862";
const LOG_CHANNEL_ID = "1476725674403172515";

// =============================
// 🔹 Verifica se usuário está acima do bot
// =============================
function isAboveBot(member, botMember) {
  if (member.id === member.guild.ownerId) return true;
  return member.roles.highest.position > botMember.roles.highest.position;
}

client.once("ready", () => {
  console.log(`📜 Cronista online como ${client.user.tag}`);
});

// =============================
// 🔹 Cache simples para recuperar mensagens deletadas
// =============================
const MSG_CACHE_MAX = 2000; // ajusta se quiser
const msgCache = new Map(); // messageId -> { content, authorId, authorTag, channelId, createdAt, attachments[] }

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
    attachments
  });

  // limite pra não crescer infinito
  if (msgCache.size > MSG_CACHE_MAX) {
    const firstKey = msgCache.keys().next().value;
    msgCache.delete(firstKey);
  }
}

function getCached(messageId) {
  return msgCache.get(messageId);
}

// Atualiza cache no create
client.on("messageCreate", (message) => {
  if (!message.guild || message.author?.bot) return;
  cacheMessage(message);
});

// =============================
// 🔹 Enviar log embed
// =============================
async function sendLog(guild, embed) {
  try {
    const ch = await guild.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (!ch) return;
    await ch.send({ embeds: [embed] });
  } catch (e) {
    console.error("Erro ao enviar log:", e);
  }
}

// =============================
// 🔹 Puxar executor do Audit Log (para deletar/mutar)
// =============================
async function findAuditExecutor(guild, type, targetId, maxAgeMs = 8000) {
  // precisa permissão ViewAuditLog
  const fetched = await guild.fetchAuditLogs({ type, limit: 6 }).catch(() => null);
  if (!fetched) return null;

  const now = Date.now();

  const entry = fetched.entries.find((e) => {
    const sameTarget = e.target?.id === targetId;
    const recent = now - e.createdTimestamp < maxAgeMs;
    return sameTarget && recent;
  });

  if (!entry) return null;
  return {
    executorId: entry.executor?.id ?? null,
    executorTag: entry.executor?.tag ?? "Desconhecido",
    reason: entry.reason ?? null
  };
}

// =============================
// 🔹 Comandos (o teu conteúdo)
// =============================
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  const content = message.content.trim();
  const lower = content.toLowerCase();

  const botMember = message.guild.members.me;
  if (!botMember) return;

  // 📜 !escrituras (regras)
  if (lower === "!escrituras") {
    if (!isAboveBot(message.member, botMember)) return;

    const regrasEmbed = new EmbedBuilder()
      .setColor("#111111")
      .setTitle("📜 ESCRITURAS — Regras da Comunidade")
      .setDescription(
        [
          "**I. Respeito é lei**",
          "• Sem ofensas, assédio, discriminação ou humilhação.",
          "• Debates são permitidos; ataques pessoais não.",
          "",
          "**II. Sem caos desnecessário**",
          "• Sem spam, flood, copypasta repetida ou provocação só pra arrumar briga.",
          "• Evite caps lock e @menções em excesso.",
          "",
          "**III. Conteúdo permitido**",
          "• Nada de conteúdo sexual explícito, gore ou qualquer coisa ilegal.",
          "• Sem golpes, links suspeitos ou “downloads mágicos”.",
          "",
          "**IV. Convivência**",
          "• Não exponha dados pessoais (seus ou de terceiros).",
          "• Se alguém pedir para parar, pare.",
          "",
          "**V. Moderação**",
          "• A equipe pode apagar mensagens, aplicar timeout, kick ou ban quando necessário.",
          "• Burlar punições (alt/conta secundária) piora a penalidade.",
          "",
          "**VI. Canais e temas**",
          "• Use cada canal para o assunto certo.",
          "• Se não souber onde postar, pergunte.",
          "",
          "**📌 Observação**",
          "A **Margem** registra o que carrega intenção.",
          "Seja alguém que deixa um rastro bom."
        ].join("\n")
      )
      .setFooter({ text: "Margem da Realidade • Registro Imutável — Cronista" })
      .setTimestamp();

    await message.channel.send({ embeds: [regrasEmbed] });
    return;
  }

  // ✦ !singularidade (o teu original)
  if (lower !== "!singularidade") return;

  if (!isAboveBot(message.member, botMember)) {
    await message.delete().catch(() => {});
    return;
  }

  const recentes = await message.channel.messages.fetch({ limit: 50 }).catch(() => null);
  if (recentes) {
    const jaExiste = recentes.some(m =>
      m.author.id === client.user.id &&
      m.components?.[0]?.components?.some(c => c.customId === "atravessar_veu")
    );
    if (jaExiste) {
      await message.delete().catch(() => {});
      return;
    }
  }

  const embed = new EmbedBuilder()
    .setColor("#111111")
    .setTitle("✦ Singularidade ✦")
    .setDescription(
`O Véu ainda o separa deste mundo.

Apenas aqueles que contemplam as Singularidades
podem atravessar e existir na história.

Toque o selo abaixo e atravesse.`
    )
    .setFooter({ text: "O Véu separa mundos." });

  const botao = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("atravessar_veu")
      .setLabel("✦ Contemplar as Singularidades")
      .setStyle(ButtonStyle.Secondary)
  );

  await message.channel.send({ embeds: [embed], components: [botao] });
  await message.delete().catch(() => {});
});

// =============================
// 🔹 Log: mensagem deletada
// =============================
client.on(Events.MessageDelete, async (message) => {
  if (!message.guild) return;
  if (message.author?.bot) return;

  // tenta pegar do cache (melhor)
  const cached = getCached(message.id);
  const authorId = message.author?.id || cached?.authorId;
  const authorTag = message.author?.tag || cached?.authorTag || "Desconhecido";

  // Conteúdo (se não tiver, tenta cache)
  const content = (message.content ?? cached?.content ?? "").trim();

  // anexos (cache)
  const attachments = cached?.attachments ?? [];

  // Quem deletou? (audit log)
  // Observação: audit log pra deletar mensagem é MessageDelete
  // nem sempre aparece (ex: auto-mod, purge rápido, falta perm)
  let executor = await findAuditExecutor(message.guild, AuditLogEvent.MessageDelete, authorId).catch(() => null);

  // Se executor não existe, pode ter sido o próprio usuário (ou não deu pra detectar)
  const deletedBySelf = executor?.executorId ? executor.executorId === authorId : true;

  const embed = new EmbedBuilder()
    .setColor("#1f1f1f")
    .setTitle("🕯️ Registro: Mensagem Excluída")
    .addFields(
      { name: "Canal", value: `<#${message.channelId}>`, inline: true },
      { name: "Autor", value: authorId ? `<@${authorId}> (${authorTag})` : authorTag, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "Margem • Exclusão registrada" });

  if (executor?.executorId) {
    if (deletedBySelf) {
      embed.addFields({ name: "Ação", value: "O usuário apagou a própria mensagem.", inline: false });
    } else {
      embed.addFields({
        name: "Ação",
        value: `<@${executor.executorId}> (${executor.executorTag}) apagou a mensagem deste autor.`,
        inline: false
      });
    }
    if (executor.reason) embed.addFields({ name: "Motivo (Audit Log)", value: executor.reason, inline: false });
  } else {
    embed.addFields({ name: "Ação", value: "Mensagem apagada (executor não identificável).", inline: false });
  }

  if (content.length) {
    embed.addFields({ name: "Mensagem", value: content.slice(0, 1024), inline: false });
  } else {
    embed.addFields({ name: "Mensagem", value: "*Conteúdo indisponível (não estava em cache).*", inline: false });
  }

  if (attachments.length) {
    const list = attachments.slice(0, 5).map(a => `• [${a.name}](${a.url})`).join("\n");
    embed.addFields({ name: "Anexos", value: list, inline: false });
  }

  await sendLog(message.guild, embed);
});

// =============================
// 🔹 Log: mensagem editada
// =============================
client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  if (!newMessage.guild) return;
  if (newMessage.author?.bot) return;

  // ignora embeds automáticos etc
  const before = (oldMessage.content ?? getCached(oldMessage.id)?.content ?? "").trim();
  const after = (newMessage.content ?? "").trim();

  // salva a versão nova no cache
  cacheMessage(newMessage);

  if (before === after) return;

  const embed = new EmbedBuilder()
    .setColor("#2b2b2b")
    .setTitle("✒️ Registro: Mensagem Editada")
    .addFields(
      { name: "Canal", value: `<#${newMessage.channelId}>`, inline: true },
      { name: "Autor", value: `<@${newMessage.author.id}> (${newMessage.author.tag})`, inline: true },
      { name: "O que foi modificado", value: "Conteúdo textual foi alterado.", inline: false },
      { name: "Antes", value: before.length ? before.slice(0, 1024) : "*vazio*", inline: false },
      { name: "Depois", value: after.length ? after.slice(0, 1024) : "*vazio*", inline: false }
    )
    .setTimestamp()
    .setFooter({ text: "Margem • Alteração registrada" });

  // Link da mensagem (se existir)
  if (newMessage.url) {
    embed.addFields({ name: "Link", value: newMessage.url, inline: false });
  }

  await sendLog(newMessage.guild, embed);
});

// =============================
// 🔹 Log: Voz (entrar/sair/mover, mute/deafen, cam/stream, server mute/deafen)
// =============================
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const guild = newState.guild;
  if (!guild) return;

  const member = newState.member || oldState.member;
  if (!member || member.user.bot) return;

  const userLine = `<@${member.id}> (${member.user.tag})`;

  const oldChannel = oldState.channelId;
  const newChannel = newState.channelId;

  // 1) Entrou / saiu / moveu
  if (oldChannel !== newChannel) {
    const embed = new EmbedBuilder()
      .setColor("#111111")
      .setTitle("🔊 Registro: Movimento em Voz")
      .addFields({ name: "Usuário", value: userLine, inline: false })
      .setTimestamp()
      .setFooter({ text: "Margem • Voz registrada" });

    if (!oldChannel && newChannel) {
      embed.addFields({ name: "Ação", value: `Entrou em <#${newChannel}>`, inline: false });
    } else if (oldChannel && !newChannel) {
      embed.addFields({ name: "Ação", value: `Saiu de <#${oldChannel}>`, inline: false });
    } else if (oldChannel && newChannel) {
      embed.addFields({ name: "Ação", value: `Moveu de <#${oldChannel}> para <#${newChannel}>`, inline: false });
    }

    await sendLog(guild, embed);
  }

  // helpers (nem todo campo existe em todo ambiente, então protegemos)
  const oldSelfMute = !!oldState.selfMute;
  const newSelfMute = !!newState.selfMute;
  const oldSelfDeaf = !!oldState.selfDeaf;
  const newSelfDeaf = !!newState.selfDeaf;

  const oldServerMute = !!oldState.serverMute;
  const newServerMute = !!newState.serverMute;
  const oldServerDeaf = !!oldState.serverDeaf;
  const newServerDeaf = !!newState.serverDeaf;

  // camera (selfVideo) e stream (streaming)
  const oldVideo = !!oldState.selfVideo;
  const newVideo = !!newState.selfVideo;
  const oldStream = !!oldState.streaming;
  const newStream = !!newState.streaming;

  // 2) Mute/Deafen próprios
  if (oldSelfMute !== newSelfMute || oldSelfDeaf !== newSelfDeaf) {
    const changes = [];
    if (oldSelfMute !== newSelfMute) changes.push(`Auto-mudo: **${newSelfMute ? "ativado" : "desativado"}**`);
    if (oldSelfDeaf !== newSelfDeaf) changes.push(`Auto-surdo: **${newSelfDeaf ? "ativado" : "desativado"}**`);

    const embed = new EmbedBuilder()
      .setColor("#171717")
      .setTitle("🎚️ Registro: Estado do Usuário (Voz)")
      .addFields(
        { name: "Usuário", value: userLine, inline: false },
        { name: "Mudança", value: changes.join("\n"), inline: false }
      )
      .setTimestamp()
      .setFooter({ text: "Margem • Ajuste pessoal registrado" });

    await sendLog(guild, embed);
  }

  // 3) Mute/Deafen pelo servidor (tenta descobrir quem fez)
  if (oldServerMute !== newServerMute || oldServerDeaf !== newServerDeaf) {
    const changes = [];
    if (oldServerMute !== newServerMute) changes.push(`Mute do servidor: **${newServerMute ? "aplicado" : "removido"}**`);
    if (oldServerDeaf !== newServerDeaf) changes.push(`Surdez do servidor: **${newServerDeaf ? "aplicada" : "removida"}**`);

    // Audit log: MemberUpdate geralmente registra mute/deaf
    const executor = await findAuditExecutor(guild, AuditLogEvent.MemberUpdate, member.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setColor("#0f0f0f")
      .setTitle("🛡️ Registro: Moderação em Voz")
      .addFields(
        { name: "Alvo", value: userLine, inline: false },
        { name: "Mudança", value: changes.join("\n"), inline: false }
      )
      .setTimestamp()
      .setFooter({ text: "Margem • Intervenção registrada" });

    if (executor?.executorId) {
      embed.addFields({ name: "Executor", value: `<@${executor.executorId}> (${executor.executorTag})`, inline: false });
      if (executor.reason) embed.addFields({ name: "Motivo (Audit Log)", value: executor.reason, inline: false });
    } else {
      embed.addFields({ name: "Executor", value: "*Não identificável (sem audit log/permissão ou fora da janela).*", inline: false });
    }

    await sendLog(guild, embed);
  }

  // 4) Câmera e transmissão
  if (oldVideo !== newVideo || oldStream !== newStream) {
    const changes = [];
    if (oldVideo !== newVideo) changes.push(`Câmera: **${newVideo ? "ativada" : "desativada"}**`);
    if (oldStream !== newStream) changes.push(`Transmissão: **${newStream ? "iniciada" : "encerrada"}**`);

    const embed = new EmbedBuilder()
      .setColor("#141414")
      .setTitle("📷 Registro: Vídeo/Transmissão")
      .addFields(
        { name: "Usuário", value: userLine, inline: false },
        { name: "Mudança", value: changes.join("\n"), inline: false }
      )
      .setTimestamp()
      .setFooter({ text: "Margem • Sinais registrados" });

    await sendLog(guild, embed);
  }
});

client.login(TOKEN);





