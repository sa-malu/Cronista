const { Events, EmbedBuilder, AuditLogEvent } = require("discord.js");
const { findAuditExecutor } = require("../utils/audit");
const { sendPunishLog } = require("../utils/send");
const { SENESCAL_ID } = require("../config");

function pedidoLine(exec) {
  if (exec?.executorId) {
    return `<@${exec.executorId}> (${exec.executorTag})`;
  }
  return "*Desconhecido (audit indisponível)*";
}

async function getSenescalIcon(guild) {
  if (!SENESCAL_ID) return null;
  const member = await guild.members.fetch(SENESCAL_ID).catch(() => null);
  return member?.user.displayAvatarURL({ dynamic: true, size: 256 }) ?? null;
}

module.exports = function registerPunishmentsSenescal(client) {
  console.log("✅ punishmentsSenescal handler carregado");

  // =============================
  // BAN
  // =============================
  client.on(Events.GuildBanAdd, async (ban) => {
    try {
      const exec = await findAuditExecutor(
        ban.guild,
        AuditLogEvent.MemberBanAdd,
        ban.user.id,
        20000
      ).catch(() => null);

      const icon = await getSenescalIcon(ban.guild);

      const embed = new EmbedBuilder()
        .setColor("#5B2C83")
        .setTitle("⛓️ Decreto do Senescal: Banimento")
        .setThumbnail(icon)
        .addFields(
          { name: "Executor", value: "Senescal", inline: false },
          { name: "A pedido de", value: pedidoLine(exec), inline: false },
          { name: "Alvo", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: false },
          { name: "Motivo", value: exec?.reason ?? "*Não informado*", inline: false }
        )
        .setTimestamp()
        .setFooter({
          text: "Crônicas de Punições • Senescal",
          iconURL: icon ?? undefined
        });

      await sendPunishLog(ban.guild, embed);
    } catch (e) {
      console.error("Erro BAN:", e);
    }
  });

  // =============================
  // UNBAN
  // =============================
  client.on(Events.GuildBanRemove, async (ban) => {
    try {
      const exec = await findAuditExecutor(
        ban.guild,
        AuditLogEvent.MemberBanRemove,
        ban.user.id,
        20000
      ).catch(() => null);

      const icon = await getSenescalIcon(ban.guild);

      const embed = new EmbedBuilder()
        .setColor("#1B4F72")
        .setTitle("🔓 Decreto do Senescal: Revogação de Ban")
        .setThumbnail(icon)
        .addFields(
          { name: "Executor", value: "Senescal", inline: false },
          { name: "A pedido de", value: pedidoLine(exec), inline: false },
          { name: "Alvo", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: false },
          { name: "Motivo", value: exec?.reason ?? "*Não informado*", inline: false }
        )
        .setTimestamp()
        .setFooter({
          text: "Crônicas de Punições • Senescal",
          iconURL: icon ?? undefined
        });

      await sendPunishLog(ban.guild, embed);
    } catch (e) {
      console.error("Erro UNBAN:", e);
    }
  });

  // =============================
  // TIMEOUT
  // =============================
  client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    try {
      const oldUntil = oldMember.communicationDisabledUntil?.getTime() ?? null;
      const newUntil = newMember.communicationDisabledUntil?.getTime() ?? null;
      if (oldUntil === newUntil) return;

      const exec = await findAuditExecutor(
        newMember.guild,
        AuditLogEvent.MemberUpdate,
        newMember.id,
        20000
      ).catch(() => null);

      const icon = await getSenescalIcon(newMember.guild);

      const applied = !oldUntil && newUntil;
      const removed = oldUntil && !newUntil;
      const action = applied
        ? "Timeout aplicado"
        : removed
        ? "Timeout removido"
        : "Timeout ajustado";

      const embed = new EmbedBuilder()
        .setColor(applied ? "#111111" : removed ? "#1B4F72" : "#444444")
        .setTitle("⏳ Decreto do Senescal: Timeout")
        .setThumbnail(icon)
        .addFields(
          { name: "Executor", value: "Senescal", inline: false },
          { name: "A pedido de", value: pedidoLine(exec), inline: false },
          { name: "Alvo", value: `<@${newMember.id}> (${newMember.user.tag})`, inline: false },
          { name: "Ação", value: action, inline: true },
          ...(newUntil
            ? [{ name: "Até", value: `<t:${Math.floor(newUntil / 1000)}:F>`, inline: true }]
            : []),
          { name: "Motivo", value: exec?.reason ?? "*Não informado*", inline: false }
        )
        .setTimestamp()
        .setFooter({
          text: "Crônicas de Punições • Senescal",
          iconURL: icon ?? undefined
        });

      await sendPunishLog(newMember.guild, embed);
    } catch (e) {
      console.error("Erro TIMEOUT:", e);
    }
  });

  // =============================
  // KICK
  // =============================
  client.on(Events.GuildMemberRemove, async (member) => {
    try {
      const exec = await findAuditExecutor(
        member.guild,
        AuditLogEvent.MemberKick,
        member.id,
        25000
      ).catch(() => null);

      if (!exec) return; // ignora saída voluntária

      const icon = await getSenescalIcon(member.guild);

      const embed = new EmbedBuilder()
        .setColor("#8B0000")
        .setTitle("👢 Decreto do Senescal: Expulsão")
        .setThumbnail(icon)
        .addFields(
          { name: "Executor", value: "Senescal", inline: false },
          { name: "A pedido de", value: pedidoLine(exec), inline: false },
          { name: "Alvo", value: `<@${member.id}> (${member.user.tag})`, inline: false },
          { name: "Motivo", value: exec.reason ?? "*Não informado*", inline: false }
        )
        .setTimestamp()
        .setFooter({
          text: "Crônicas de Punições • Senescal",
          iconURL: icon ?? undefined
        });

      await sendPunishLog(member.guild, embed);
    } catch (e) {
      console.error("Erro KICK:", e);
    }
  });
};
