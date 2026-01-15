import React, { useMemo, useState } from "react";
import TaxPageLayout from "./TaxPageLayout";
import { api } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoints";
import { addHistory } from "../../state/history";

type CompanySize = "SMALL" | "MEDIUM" | "LARGE";

type FormState = {
  revenue: string;
  companySize: CompanySize | "";
  includeBusinessExpenses: boolean;
  businessExpenses: string; // only used if includeBusinessExpenses
};

type FieldErrors = Partial<Record<keyof FormState, string>> & { general?: string };

type Band = {
  label: string;
  min: number; // inclusive
  max: number | null; // null = infinity
  rate: number; // e.g. 0.15 for 15%
};

const BANDS: Band[] = [
  { label: "₦0 - ₦800,000", min: 0, max: 800_000, rate: 0.0 },
  { label: "₦800,001 - ₦3,000,000", min: 800_000, max: 3_000_000, rate: 0.15 },
  { label: "₦3,000,001 - ₦12,000,000", min: 3_000_000, max: 12_000_000, rate: 0.18 },
  { label: "₦12,000,001 - ₦25,000,000", min: 12_000_000, max: 25_000_000, rate: 0.21 },
  { label: "₦25,000,001 - ₦50,000,000", min: 25_000_000, max: 50_000_000, rate: 0.23 },
  { label: "Above ₦50,000,000", min: 50_000_000, max: null, rate: 0.25 }
];

function toNumberSafe(v: string): number {
  const cleaned = v.replace(/,/g, "").trim();
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function formatNaira(n: number): string {
  if (!Number.isFinite(n)) return "₦0.00";
  return `₦${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function clampNonNegative(n: number): number {
  return n < 0 ? 0 : n;
}

function computeTaxByBands(taxableIncome: number) {
  let remaining = taxableIncome;
  let totalTax = 0;

  const breakdown = BANDS.map((b) => {
    const bandMin = b.min;
    const bandMax = b.max;

    // band width
    const width = bandMax === null ? Infinity : bandMax - bandMin;

    // amount in band: taxableIncome above min capped by width
    const amountInBand = clampNonNegative(Math.min(Math.max(taxableIncome - bandMin, 0), width));
    const taxInBand = amountInBand * b.rate;

    totalTax += taxInBand;
    remaining -= amountInBand;

    return {
      band: b,
      amountInBand,
      taxInBand
    };
  });

  return { totalTax, breakdown };
}

/**
 * Extract total tax from various possible upstream response shapes.
 * If your API returns a known shape, simplify this.
 */
function extractUpstreamTax(json: any): number | null {
  const candidates = [
    json?.totalTax,
    json?.taxDue,
    json?.taxAmount,
    json?.data?.totalTax,
    json?.data?.taxDue,
    json?.data?.taxAmount,
    json?.result?.totalTax,
    json?.result?.taxDue
  ];

  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) return c;
    if (typeof c === "string") {
      const n = Number(c.replace(/,/g, ""));
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export default function Company() {
  const [form, setForm] = useState<FormState>({
    revenue: "",
    companySize: "",
    includeBusinessExpenses: true,
    businessExpenses: ""
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  const [showBreakdown, setShowBreakdown] = useState(false);

  // result state
  const [resultMode, setResultMode] = useState(false);
  const [upstreamRaw, setUpstreamRaw] = useState<any>(null);

  const revenueN = useMemo(() => toNumberSafe(form.revenue), [form.revenue]);
  const businessExpensesN = useMemo(() => toNumberSafe(form.businessExpenses), [form.businessExpenses]);

  // For this UI (per your screenshot), Total Deductions is shown.
  // Since the form doesn’t ask for more deductions, we keep it 0 by default.
  // If you later add “Allowable deductions”, plug it here.
  const totalDeductionsN = 0;

  const computed = useMemo(() => {
    const grossIncome = clampNonNegative(revenueN);
    const businessExpenses = form.includeBusinessExpenses ? clampNonNegative(businessExpensesN) : 0;

    const netIncome = clampNonNegative(grossIncome - businessExpenses);
    const annualTaxableIncome = clampNonNegative(netIncome - totalDeductionsN);

    const { totalTax, breakdown } = computeTaxByBands(annualTaxableIncome);

    return {
      grossIncome,
      businessExpenses,
      totalDeductions: totalDeductionsN,
      annualTaxableIncome,
      netIncome,
      totalTax,
      monthlyTax: totalTax / 12,
      breakdown
    };
  }, [revenueN, businessExpensesN, form.includeBusinessExpenses]);

  function validate(): boolean {
    const next: FieldErrors = {};

    // Revenue required and must be a valid number
    if (!form.revenue.trim()) next.revenue = "Revenue is required";
    else if (!Number.isFinite(revenueN)) next.revenue = "Revenue must be a valid number";
    else if (revenueN < 0) next.revenue = "Revenue cannot be negative";

    // Company size required
    if (!form.companySize) next.companySize = "Select company size";

    // Business expenses checks
    if (form.includeBusinessExpenses) {
      if (!form.businessExpenses.trim()) next.businessExpenses = "Enter total business expenses";
      else if (!Number.isFinite(businessExpensesN)) next.businessExpenses = "Expenses must be a valid number";
      else if (businessExpensesN < 0) next.businessExpenses = "Expenses cannot be negative";
      else if (Number.isFinite(revenueN) && businessExpensesN > revenueN) {
        next.businessExpenses = "Expenses cannot be greater than revenue";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onProceed() {
    if (!validate()) return;

    setBusy(true);
    setErrors({});
    try {
      // Payload: use endpoint directly for company logic.
      // If your API expects different keys, adjust here.
      const payload = {
        type: "COMPANY", // common discriminator
        taxType: "company", // alternate discriminator
        period: "annual",
        revenue: computed.grossIncome,
        companySize: form.companySize,
        includeBusinessExpenses: form.includeBusinessExpenses,
        businessExpenses: computed.businessExpenses
      };

      const { data } = await api.post(ENDPOINTS.taxCalculate, payload);

      setUpstreamRaw(data);

      // Save to local history
      addHistory({
        type: "COMPANY",
        input: payload,
        result: data
      });

      setResultMode(true);
    } catch (err: any) {
      setErrors({
        general: err?.response?.data?.message || err?.message || "Company Income Tax calculation failed"
      });
      setResultMode(false);
    } finally {
      setBusy(false);
    }
  }

  // Total tax shown on result page:
  // Prefer upstream total tax if present, otherwise local computed.
  const finalTotalTax = useMemo(() => {
    const upstreamTax = extractUpstreamTax(upstreamRaw);
    if (upstreamTax !== null) return upstreamTax;
    return computed.totalTax;
  }, [upstreamRaw, computed.totalTax]);

  const finalMonthlyTax = finalTotalTax / 12;

  // For breakdown panel, we show the full breakdown based on computed values
  // so the UI is always populated even if upstream doesn't send breakdown.
  const breakdownRows = useMemo(() => {
    // Build the "Break Down Your Tax" section lines similar to your screenshot:
    // "First ₦800,000" etc.
    // We'll only list bands that actually apply (amountInBand > 0 or first band always).
    return computed.breakdown
      .filter((x, idx) => idx === 0 || x.amountInBand > 0)
      .map((x) => ({
        label:
          x.band.max === null
            ? `Above ${formatNaira(x.band.min)}`
            : `First ${x.band.label.split(" - ")[1]}`, // keeps it close to screenshot style
        ratePct: `${Math.round(x.band.rate * 100)}%`,
        amountInBand: x.amountInBand,
        taxInBand: x.taxInBand,
        band: x.band
      }));
  }, [computed.breakdown]);

  // FORM VIEW (matches screenshot left)
  const formView = (
    <div>
      {errors.general ? (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {errors.general}
        </div>
      ) : null}

      <label className="text-xs font-semibold text-slate-700">Revenue</label>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm text-slate-600">₦</span>
        <input
          className={`w-full rounded border px-3 py-2 text-sm ${errors.revenue ? "border-red-300" : ""}`}
          value={form.revenue}
          inputMode="decimal"
          onChange={(e) => setForm((s) => ({ ...s, revenue: e.target.value }))}
          placeholder="0"
        />
      </div>
      {errors.revenue ? <div className="mt-1 text-xs text-red-600">{errors.revenue}</div> : null}

      <div className="mt-4">
        <label className="text-xs font-semibold text-slate-700">Company Size</label>
        <div className="mt-1">
          <select
            className={`w-full rounded border px-3 py-2 text-sm bg-white ${errors.companySize ? "border-red-300" : ""}`}
            value={form.companySize}
            onChange={(e) => setForm((s) => ({ ...s, companySize: e.target.value as CompanySize }))}
          >
            <option value="">Select Size</option>
            <option value="SMALL">Small Company (0%)</option>
            <option value="MEDIUM">Medium Company (20%)</option>
            <option value="LARGE">Large Company (30%)</option>
          </select>
        </div>
        {errors.companySize ? <div className="mt-1 text-xs text-red-600">{errors.companySize}</div> : null}
      </div>

      <div className="mt-4 rounded-xl border bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-800">Include Business Expenses</div>
            <div className="text-[11px] text-slate-600">
              Add allowable business expenses (reduces taxable income).
            </div>
          </div>

          <input
            type="checkbox"
            checked={form.includeBusinessExpenses}
            onChange={(e) => setForm((s) => ({ ...s, includeBusinessExpenses: e.target.checked }))}
            className="h-4 w-4 accent-brand-800"
          />
        </div>

        {form.includeBusinessExpenses ? (
          <div className="mt-3">
            <label className="text-xs font-semibold text-slate-700">Total Business Expenses</label>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-slate-600">₦</span>
              <input
                className={`w-full rounded border px-3 py-2 text-sm ${errors.businessExpenses ? "border-red-300" : ""}`}
                value={form.businessExpenses}
                inputMode="decimal"
                onChange={(e) => setForm((s) => ({ ...s, businessExpenses: e.target.value }))}
                placeholder="0"
              />
            </div>
            {errors.businessExpenses ? (
              <div className="mt-1 text-xs text-red-600">{errors.businessExpenses}</div>
            ) : null}
          </div>
        ) : null}
      </div>

      <button
        onClick={onProceed}
        disabled={busy}
        className="mt-6 w-full rounded bg-brand-800 text-white py-2.5 text-sm font-semibold hover:bg-brand-900 disabled:opacity-60"
      >
        {busy ? "Calculating..." : "Proceed"}
      </button>
    </div>
  );

  // RESULT VIEW (matches screenshot right + second attachment breakdown)
  const resultView = (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <div className="text-center">
          <div className="text-xs text-slate-600">Company Income Tax Result</div>
          <div className="mt-1 text-2xl font-extrabold text-brand-800">{formatNaira(finalTotalTax)}</div>
          <div className="text-xs text-slate-600">Total Tax Due</div>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-100 p-4">
            <div className="text-xs text-slate-600">Gross Income</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{formatNaira(computed.grossIncome)}</div>
          </div>
          <div className="rounded-xl bg-slate-100 p-4">
            <div className="text-xs text-slate-600">Net Income</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{formatNaira(computed.netIncome)}</div>
          </div>
        </div>

        {/* View tax breakdown dropdown */}
        <button
          onClick={() => setShowBreakdown((v) => !v)}
          className="mt-4 w-full flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-200"
        >
          <span>View Tax Breakdown</span>
          <span className="text-slate-500">{showBreakdown ? "▴" : "▾"}</span>
        </button>

        {showBreakdown ? (
          <div className="mt-4 rounded-xl border bg-slate-50 p-4">
            <div className="text-sm font-semibold text-brand-800">Tax Calculation Breakdown</div>

            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <div>Business Expenses (100%)</div>
                <div className="font-medium text-slate-900">
                  -{formatNaira(computed.businessExpenses)}
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex items-center justify-between">
                <div>Total Deductions</div>
                <div className="font-medium text-slate-900">{formatNaira(computed.totalDeductions)}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="font-medium">Annual Taxable Income</div>
                <div className="font-semibold text-slate-900">{formatNaira(computed.annualTaxableIncome)}</div>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="text-[12px] font-semibold text-slate-800">Progressive Tax Band (Annual)</div>
              <div className="space-y-1">
                {BANDS.map((b) => (
                  <div key={b.label} className="flex items-center justify-between">
                    <div className="text-slate-700">{b.label}</div>
                    <div className="text-slate-700">{Math.round(b.rate * 100)}%</div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-slate-200" />

              <div className="text-[12px] font-semibold text-slate-800">Break Down Your Tax</div>

              <div className="space-y-2">
                {breakdownRows.map((r, idx) => {
                  // Build “Tax 15% of ₦1,149,000” style
                  const label =
                    idx === 0
                      ? `First ${formatNaira(Math.min(computed.annualTaxableIncome, 800_000)).replace(".00", "")}`
                      : r.band.max === null
                      ? `Above ${formatNaira(r.band.min).replace(".00", "")}`
                      : `Taxable Remaining = ${formatNaira(r.amountInBand).replace(".00", "")}`;

                  const right =
                    idx === 0
                      ? formatNaira(r.taxInBand)
                      : `Tax ${Math.round(r.band.rate * 100)}% of ${formatNaira(r.amountInBand).replace(".00", "")}`;

                  return (
                    <div key={`${r.band.label}-${idx}`} className="flex items-start justify-between gap-4">
                      <div className="text-slate-700">{label}</div>
                      <div className="text-right text-slate-900 font-medium">
                        {idx === 0 ? formatNaira(r.taxInBand) : formatNaira(r.taxInBand)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex items-center justify-between">
                <div>Total Annual Tax</div>
                <div className="font-semibold text-slate-900">{formatNaira(finalTotalTax)}</div>
              </div>

              <div className="flex items-center justify-between">
                <div>Monthly Tax</div>
                <div className="font-medium text-slate-900">{formatNaira(finalMonthlyTax)}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <button
        onClick={() => {
          setResultMode(false);
          setShowBreakdown(false);
          setUpstreamRaw(null);
        }}
        className="w-full rounded bg-brand-800 text-white py-3 text-sm font-semibold hover:bg-brand-900"
      >
        Calculate Another Tax
      </button>
    </div>
  );

  return (
    <TaxPageLayout
      title="Company Income Tax"
      subtitle="Calculate company income tax based on Nigerian CIT rules."
      rightPanel={resultMode ? resultView : undefined}
    >
      {resultMode ? (
        <div className="text-sm text-slate-700">
          You can review the result on the right panel, or calculate another tax.
        </div>
      ) : (
        formView
      )}
    </TaxPageLayout>
  );
}
