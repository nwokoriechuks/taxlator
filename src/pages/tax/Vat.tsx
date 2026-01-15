import React, { useState } from "react";
import TaxPageLayout from "./TaxPageLayout";
import { api } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoints";
import { addHistory } from "../../state/history";

export default function Vat() {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  async function calculate() {
    setError("");
    setBusy(true);
    try {
      // Update payload keys to match your API contract if different
      const payload = { transactionAmount: Number(amount || 0) };
      const { data } = await api.post(ENDPOINTS.vatCalculate, payload);
      setResult(data);

      // NEW: store in local history
      addHistory({
        type: "VAT",
        input: payload,
        result: data
      });

    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "VAT calculation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <TaxPageLayout
      title="VAT Calculator"
      subtitle="Calculate Value Added Tax."
      rightPanel={
        result ? (
          <pre className="text-xs bg-slate-50 border rounded p-3 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : null
      }
    >
      {error ? (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>
      ) : null}

      <label className="text-xs font-semibold text-slate-700">Transaction Amount</label>
      <input
        className="mt-1 w-full rounded border px-3 py-2 text-sm"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="₦ 0"
      />

      <button
        onClick={calculate}
        disabled={busy}
        className="mt-6 w-full rounded bg-brand-800 text-white py-2.5 text-sm font-semibold hover:bg-brand-900 disabled:opacity-60"
      >
        {busy ? "Calculating..." : "Proceed"}
      </button>
    </TaxPageLayout>
  );
}
