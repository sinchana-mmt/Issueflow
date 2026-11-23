export type BlockEdge = { from: string; to: string };

export function createsBlockCycle(existing: BlockEdge[], from: string, to: string) {
  if (from === to) return true;
  const next = new Map<string, string[]>();
  for (const edge of existing) {
    const list = next.get(edge.from) ?? [];
    list.push(edge.to);
    next.set(edge.from, list);
  }
  const added = next.get(from) ?? [];
  added.push(to);
  next.set(from, added);

  const stack = [to];
  const seen = new Set<string>();
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || seen.has(node)) continue;
    if (node === from) return true;
    seen.add(node);
    for (const child of next.get(node) ?? []) stack.push(child);
  }
  return false;
}
