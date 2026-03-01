// src/handlers/punishmentsSenescal.js
const { Events, EmbedBuilder, AuditLogEvent } = require("discord.js");
const { SENESCAL_ID } = require("../config");
const { findAuditExecutor } = require("../utils/audit");
const { sendPunishLog } = require("../utils/send");

// Ligue/desligue debug aqui:
const DEBUG = true;

function dbg(...args) {
  if (DEBUG) console.log("[PUNISH]", ...args);
}

module.exports = function registerPunishmentsSenescal(client) {
  console.log("✅ punishmentsSenescal handler carregado");

  // =============================
  // BAN
  // =============================
  client.on(Events.GuildBanAdd, async (ban) => {
    try {
      if (!SENESCAL_ID) return;

      dbg("BAN EVENT", ban.user?.id);

      const exec = await findAuditExecutor(
        ban.guild,
        AuditLogEvent.MemberBanAdd,
        ban.user.id,
        15000 // janela maior
      ).catch(() => null);

      dbg("BAN AUDIT", exec);

      // Só registra se executor for Senescal
      if (!exec || exec.executorId !== SENESCAL_ID) return;

      const embed = new EmbedBuilder()
        .setColor("#5B2C83")
        .setTitle("⛓️ Punição: Banimento (Senescal)")
        .addFields(
          { name: "Alvo", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: false },
          { name: "Executor", value: `Senescal (<@${exec.executorId}>)`, inline: false },
          { name: "Motivo", value: exec.reason ? exec.reason.slice(0, 1024) : "*Não informado*", inline: false }
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
      if (!SENESCAL_ID) return;

      dbg("UNBAN EVENT", ban.user?.id);

      const exec = await findAuditExecutor(
        ban.guild,
        AuditLogEvent.MemberBanRemove,
        ban.user.id,
        15000
      ).catch(() => null);

      dbg("UNBAN AUDIT", exec);

      if (!exec || exec.executorId !== SENESCAL_ID) return;

      const embed = new EmbedBuilder()
        .setColor("#1B4F72")
        .setTitle("🔓 Punição: Unban (Senescal)")
        .addFields(
          { name: "Alvo", value: `<@${ban.user.id}> (${ban.user.tag})`, inline: false },
          { name: "Executor", value: `Senescal (<@${exec.executorId}>)`, inline: false },
          { name: "Motivo", value: exec.reason ? exec.reason.slice(0, 1024) : "*Não informado*", inline: false }
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
      if (!SENESCAL_ID) return;

      const oldUntil = oldMember.communicationDisabledUntil?.getTime() ?? null;
      const newUntil = newMember.communicationDisabledUntil?.getTime() ?? null;

      // Só reage quando muda timeout
      if (oldUntil === newUntil) return;

      dbg("TIMEOUT CHANGE", newMember.id, { oldUntil, newUntil });

      const exec = await findAuditExecutor(
        newMember.guild,
        AuditLogEvent.MemberUpdate,
        newMember.id,
        15000
      ).catch(() => null);

      dbg("TIMEOUT AUDIT", exec);

      if (!exec || exec.executorId !== SENESCAL_ID) return;

      const applied = !oldUntil && newUntil;
      const removed = oldUntil && !newUntil;
      const action = applied ? "Timeout aplicado" : removed ? "Timeout removido" : "Timeout ajustado";

      const embed = new EmbedBuilder()
        .setColor("#111111")
        .setTitle("⏳ Punição: Timeout (Senescal)")
        .addFields(
          { name: "Alvo", value: `<@${newMember.id}> (${newMember.user.tag})`, inline: false },
          { name: "Executor", value: `Senescal (<@${exec.executorId}>)`, inline: false },
          { name: "Ação", value: action, inline: true },
          ...(newUntil ? [{ name: "Até", value: `<t:${Math.floor(newUntil / 1000)}:F>`, inline: true }] : []),
          { name: "Motivo", value: exec.reason ? exec.reason.slice(0, 1024) : "*Não informado*", inline: false }
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
      if (!SENESCAL_ID) return;

      dbg("MEMBER REMOVE EVENT", member.id);

      // Observação: GuildMemberRemove pode ser saída voluntária.
      // Só consideramos kick se o audit log bater.
      const exec = await findAuditExecutor(
        member.guild,
        AuditLogEvent.MemberKick,
        member.id,
        20000 // kick às vezes demora mais
      ).catch(() => null);

      dbg("KICK AUDIT", exec);

      if (!exec || exec.executorId !== SENESCAL_ID) return;

      const embed = new EmbedBuilder()
        .setColor("#8B0000")
        .setTitle("👢 Punição: Kick (Senescal)")
        .addFields(
          { name: "Alvo", value: `<@${member.id}> (${member.user.tag})`, inline: false },
          { name: "Executor", value: `Senescal (<@${exec.executorId}>)`, inline: false },
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
