const { Events, EmbedBuilder, AuditLogEvent } = require("discord.js");
const { findAuditExecutor } = require("../utils/audit");
const { sendPunishLog } = require("../utils/send");

const DEBUG = false;
const dbg = (...a) => DEBUG && console.log("[PUNISH]", ...a);

function pedidoLine(exec) {
  if (exec?.executorId) return `<@${exec.executorId}> (${exec.executorTag})`;
  return "*Desconhecido (audit log indisponível)*";
}

module.exports = function registerPunishmentsSenescal(client) {
  console.log("✅ punishmentsSenescal handler carregado");

  // =============================
  // BAN
  // =============================
  client.on(Events.GuildBanAdd, async (ban) => {
    try {
      dbg("BAN EVENT", ban.user?.id);

      const exec = await findAuditExecutor(
        ban.guild,
        AuditLogEvent.MemberBanAdd,
        ban.user.id,
        20000
      ).catch(() => null);

      dbg("BAN AUDIT", exec);

      const embed = new EmbedBuilder()
        .setColor("#5B2C83")
        .setTitle("⛓️ Punição: Banimento")
        .addFields(
          { name: "Executor", value: "Senescal", inline: false },
          { name: "A pedido de", value: pedidoLine(exec), inline: false },
          { name: "Alvo", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: false },
          { name: "Motivo", value: exec?.reason ? exec.reason.slice(0, 1024) : "*Não informado*", inline: false }
        )
        .setTimestamp()
        .setFooter({ text: "Crônicas de Punições • Cronista" });

      await sendPunishLog(ban.guild, embed);
    } catch (e) {
      console.error("Erro no handler BAN:", e);
    }
  });

  // =============================
  // UNBAN
  // =============================
  client.on(Events.GuildBanRemove, async (ban) => {
    try {
      dbg("UNBAN EVENT", ban.user?.id);

      const exec = await findAuditExecutor(
        ban.guild,
        AuditLogEvent.MemberBanRemove,
        ban.user.id,
        20000
      ).catch(() => null);

      dbg("UNBAN AUDIT", exec);

      const embed = new EmbedBuilder()
        .setColor("#1B4F72")
        .setTitle("🔓 Punição: Unban")
        .addFields(
          { name: "Executor", value: "Senescal", inline: false },
          { name: "A pedido de", value: pedidoLine(exec), inline: false },
          { name: "Alvo", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: false },
          { name: "Motivo", value: exec?.reason ? exec.reason.slice(0, 1024) : "*Não informado*", inline: false }
        )
        .setTimestamp()
        .setFooter({ text: "Crônicas de Punições • Cronista" });

      await sendPunishLog(ban.guild, embed);
    } catch (e) {
      console.error("Erro no handler UNBAN:", e);
    }
  });

  // =============================
  // TIMEOUT (aplicado/removido/ajustado)
  // =============================
  client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    try {
      const oldUntil = oldMember.communicationDisabledUntil?.getTime() ?? null;
      const newUntil = newMember.communicationDisabledUntil?.getTime() ?? null;
      if (oldUntil === newUntil) return;

      dbg("TIMEOUT CHANGE", newMember.id, { oldUntil, newUntil });

      const exec = await findAuditExecutor(
        newMember.guild,
        AuditLogEvent.MemberUpdate,
        newMember.id,
        20000
      ).catch(() => null);

      dbg("TIMEOUT AUDIT", exec);

      const applied = !oldUntil && newUntil;
      const removed = oldUntil && !newUntil;
      const action = applied ? "Timeout aplicado" : removed ? "Timeout removido" : "Timeout ajustado";

      const embed = new EmbedBuilder()
        .setColor(applied ? "#111111" : removed ? "#1B4F72" : "#444444")
        .setTitle("⏳ Punição: Timeout")
        .addFields(
          { name: "Executor", value: "Senescal", inline: false },
          { name: "A pedido de", value: pedidoLine(exec), inline: false },
          { name: "Alvo", value: `<@${newMember.id}> (${newMember.user.tag})`, inline: false },
          { name: "Ação", value: action, inline: true },
          ...(newUntil ? [{ name: "Até", value: `<t:${Math.floor(newUntil / 1000)}:F>`, inline: true }] : []),
          { name: "Motivo", value: exec?.reason ? exec.reason.slice(0, 1024) : "*Não informado*", inline: false }
        )
        .setTimestamp()
        .setFooter({ text: "Crônicas de Punições • Cronista" });

      await sendPunishLog(newMember.guild, embed);
    } catch (e) {
      console.error("Erro no handler TIMEOUT:", e);
    }
  });

  // =============================
  // KICK (GuildMemberRemove + audit)
  // =============================
  client.on(Events.GuildMemberRemove, async (member) => {
    try {
      dbg("MEMBER REMOVE", member.id);

      const exec = await findAuditExecutor(
        member.guild,
        AuditLogEvent.MemberKick,
        member.id,
        25000
      ).catch(() => null);

      dbg("KICK AUDIT", exec);

      // Se não houver audit de kick, provavelmente a pessoa saiu sozinha.
      if (!exec) return;

      const embed = new EmbedBuilder()
        .setColor("#8B0000")
        .setTitle("👢 Punição: Kick")
        .addFields(
          { name: "Executor", value: "Senescal", inline: false },
          { name: "A pedido de", value: pedidoLine(exec), inline: false },
          { name: "Alvo", value: `<@${member.id}> (${member.user.tag})`, inline: false },
          { name: "Motivo", value: exec.reason ? exec.reason.slice(0, 1024) : "*Não informado*", inline: false }
        )
        .setTimestamp()
        .setFooter({ text: "Crônicas de Punições • Cronista" });

      await sendPunishLog(member.guild, embed);
    } catch (e) {
      console.error("Erro no handler KICK:", e);
    }
  });
};
