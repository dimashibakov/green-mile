export const CAT_LABELS: Record<string, string> = {
  E11: "EB-1 extraordinary ability",
  E12: "EB-1 prof / researcher",
  E13: "EB-1 multinational mgr",
  E16: "EB-1 multinational mgr",
  E21: "EB-2 advanced degree",
  E32: "EB-3 skilled worker",
  F11: "family · unmarried son/dtr",
  CR1: "spouse of citizen",
  IR1: "spouse of citizen",
  DV: "diversity visa",
  other: "",
};

export const CAT_ORDER = [
  "E11", "E12", "E13", "E16", "E21", "E32", "F11", "CR1", "IR1", "DV", "other",
];

export function catLabel(cat: string): string {
  return CAT_LABELS[cat] ? cat + " · " + CAT_LABELS[cat] : cat;
}
