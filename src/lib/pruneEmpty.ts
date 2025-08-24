export function pruneEmpty(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    const arr = obj
      .map(pruneEmpty)
      .filter((v) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0));
    return arr.length ? arr : undefined;
  }
  if (obj && typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => [k, pruneEmpty(v)] as const)
      .filter(
        ([, v]) =>
          v !== undefined &&
          v !== null &&
          !(Array.isArray(v) && v.length === 0) &&
          !(typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0)
      );
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  if (obj === "" || obj === null || obj === undefined || obj === false) return undefined;
  return obj;
}
