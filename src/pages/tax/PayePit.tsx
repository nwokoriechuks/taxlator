import React, { useState } from "react";
import TaxPageLayout from "./TaxPageLayout";
import { api } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoints";
import { addHistory } from "../../state/history";

export default function PayePit() {
  const [grossAnnualIncome, setGrossAnnualIncome] = useState("");
  const [rentRelief, setRentRelief] = useState("");
  const [otherDeductions, setOtherDeductions] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  async function calculate() {
    setError("");
    setBusy(true);
    try {
      // Update payload keys to match your API contract
      const payload = {
        type: "PAYE_PIT",
        period: "annual",
        grossAnnualIncome: Number(grossAnnualIncome || 0),
        rentRelief: Number(rentRelief || 0),
        otherDeductions: Number(otherDeductions || 0)
      };

      const { data } = await api.post(ENDPOINTS.taxCalculate, payload);
      setResult(data);

      addHistory({
        type: "PAYE_PIT",
        input: payload,
        result: data
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "PAYE/PIT calculation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <TaxPageLayout
      title="PAYE / PIT Calculator"
      subtitle="Calculate your personal income tax (PITA)."
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

      <label className="text-xs font-semibold text-slate-700">Gross Annual Income</label>
      <input
        className="mt-1 w-full rounded border px-3 py-2 text-sm"
        value={grossAnnualIncome}
        onChange={(e) => setGrossAnnualIncome(e.target.value)}
        placeholder="₦ 0"
      />

      <label className="text-xs font-semibold text-slate-700 mt-4 block">Rent Relief</label>
      <input
        className="mt-1 w-full rounded border px-3 py-2 text-sm"
        value={rentRelief}
        onChange={(e) => setRentRelief(e.target.value)}
        placeholder="₦ 0"
      />

      <label className="text-xs font-semibold text-slate-700 mt-4 block">Other Deductions</label>
      <input
        className="mt-1 w-full rounded border px-3 py-2 text-sm"
        value={otherDeductions}
        onChange={(e) => setOtherDeductions(e.target.value)}
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
