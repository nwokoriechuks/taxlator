import React, { useMemo, useState } from "react";
import { clearHistory, readHistory, type HistoryItem } from "../state/history";

function typeLabel(t: HistoryItem["type"]) {
  switch (t) {
    case "PAYE_PIT":
      return "PAYE / PIT";
    case "VAT":
      return "VAT";
    case "FREELANCER":
      return "Freelancer";
    case "COMPANY":
      return "Company Income Tax";
    default:
      return t;
  }
}

export default function History() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const items = useMemo(() => readHistory(), [refreshKey]);
  const selected = items.find((x) => x.id === selectedId) ?? null;

  return (
    <div className="bg-slate-100 min-h-[80vh] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
          <div>
            <div className="text-xl font-semibold text-slate-900">History</div>
            <div className="text-sm text-slate-600 mt-1">
              Saved calculations stored on this device.
            </div>
          </div>

          <button
            onClick={() => {
              clearHistory();
              setSelectedId(null);
              setRefreshKey((k) => k + 1);
            }}
            className="px-3 py-2 rounded border text-sm bg-white hover:bg-slate-50"
          >
            Clear History
          </button>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-4">
          <div className="bg-white border rounded-2xl shadow-soft overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold text-sm">Recent Calculations</div>

            {items.length === 0 ? (
              <div className="p-4 text-sm text-slate-600">No history yet.</div>
            ) : (
              <div className="divide-y">
                {items.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => setSelectedId(it.id)}
                    className={`w-full text-left p-4 hover:bg-slate-50 ${
                      selectedId === it.id ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">{typeLabel(it.type)}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(it.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {JSON.stringify(it.input)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border rounded-2xl shadow-soft overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold text-sm">Details</div>
            {!selected ? (
              <div className="p-4 text-sm text-slate-600">Select an item to view details.</div>
            ) : (
              <div className="p-4">
                <div className="text-sm font-semibold">{typeLabel(selected.type)}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(selected.createdAt).toLocaleString()}
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-700">Input</div>
                  <pre className="mt-1 text-xs bg-slate-50 border rounded p-3 overflow-auto">
                    {JSON.stringify(selected.input, null, 2)}
                  </pre>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-700">Result</div>
                  <pre className="mt-1 text-xs bg-slate-50 border rounded p-3 overflow-auto">
                    {JSON.stringify(selected.result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
