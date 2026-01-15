export type HistoryItem = {
  id: string;
  type: "PAYE_PIT" | "VAT" | "FREELANCER" | "COMPANY";
  createdAt: string; // ISO string
  input: Record<string, any>;
  result: any;
};

const KEY = "taxlator_history_v1";

export function readHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeHistory(items: HistoryItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addHistory(item: Omit<HistoryItem, "id" | "createdAt">) {
  const items = readHistory();
  const newItem: HistoryItem = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    ...item
  };
  writeHistory([newItem, ...items].slice(0, 50)); // keep last 50
  return newItem;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
