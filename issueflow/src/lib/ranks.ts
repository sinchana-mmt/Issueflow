export function rankAtEnd(maxRank: number | null) {
  return (maxRank ?? 0) + 1000;
}

export function rankBeside(anchor: number, neighbor: number | null, place: "before" | "after") {
  if (neighbor == null) {
    return place === "before" ? anchor - 1000 : anchor + 1000;
  }
  const [low, high] = place === "before" ? [neighbor, anchor] : [anchor, neighbor];
  const mid = (low + high) / 2;
  if (mid === low || mid === high) return place === "before" ? anchor - 1 : anchor + 1;
  return mid;
}
