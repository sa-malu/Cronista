async function findAuditExecutor(guild, type, targetId, maxAgeMs = 8000) {
  const fetched = await guild.fetchAuditLogs({ type, limit: 6 }).catch(() => null);
  if (!fetched) return null;

  const now = Date.now();
  const entry = fetched.entries.find(e => {
    const recent = now - e.createdTimestamp < maxAgeMs;
    const sameTarget = targetId ? (e.target?.id === targetId) : true;
    return recent && sameTarget;
  });

  if (!entry) return null;

  return {
    executorId: entry.executor?.id ?? null,
    executorTag: entry.executor?.tag ?? "Desconhecido",
    reason: entry.reason ?? null,
  };
}

module.exports = { findAuditExecutor };
