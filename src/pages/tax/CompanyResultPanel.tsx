// taxlator/src/pages/tax/CompanyResultPanel.tsx
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

function formatNaira(value: unknown) {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return "₦0.00";
	return `₦${n.toLocaleString("en-NG", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

function toFiniteNumber(v: unknown, fallback = 0) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : fallback;
}

type Props = {
	result: unknown;
	revenue: number;
	expenses: number;
	companySize?: string;
	isAuthenticated: boolean;
	prefillEmail?: string;
};

export default function CompanyResultPanel({
	result,
	revenue,
	expenses,
	companySize,
	isAuthenticated,
	prefillEmail = "",
}: Props) {
	const navigate = useNavigate();

	const r = useMemo(() => (result ?? {}) as Record<string, unknown>, [result]);

	// Be defensive: accept multiple possible field names
	const taxDue = toFiniteNumber(
		r.taxAmount ?? r.totalTax ?? r.totalAnnualTax ?? r.tax ?? 0
	);

	const profit = toFiniteNumber(
		r.profit ??
			r.taxableProfit ??
			r.taxableIncome ??
			Math.max(0, revenue - expenses)
	);

	const profitAfterTax = toFiniteNumber(
		r.profitAfterTax ?? r.netProfit ?? Math.max(0, profit - taxDue)
	);

	const ratePct = useMemo(() => {
		// if backend returns rate as 0.2 etc
		const rate = r.rate ?? r.taxRate ?? r.citRate;
		if (typeof rate === "number" && Number.isFinite(rate)) {
			return `${Math.round(rate * 100)}%`;
		}
		// fallback by companySize (if you want the exact CIT mapping, set it here)
		if (companySize === "SMALL") return "0%";
		if (companySize === "MEDIUM") return "20%";
		if (companySize === "LARGE") return "30%";
		return "—";
	}, [r, companySize]);

	return (
		<div className="bg-white rounded-2xl border shadow-soft overflow-hidden">
			{/* Header */}
			<div className="p-6 text-center border-b">
				<div className="text-sm text-slate-600">Company Income Tax Result</div>
				<div className="mt-2 text-4xl font-extrabold text-brand-800">
					{formatNaira(taxDue)}
				</div>
				<div className="text-sm text-slate-600 mt-1">Total Tax Due</div>
			</div>

			<div className="p-6">
				{/* Summary cards (matches screenshot layout) */}
				<div className="grid grid-cols-2 gap-4">
					<div className="rounded-2xl bg-slate-50 border p-4">
						<div className="text-xs text-slate-600">Tax Amount</div>
						<div className="mt-1 font-semibold">{formatNaira(taxDue)}</div>
					</div>
					<div className="rounded-2xl bg-slate-50 border p-4">
						<div className="text-xs text-slate-600">Profit After Tax</div>
						<div className="mt-1 font-semibold">
							{formatNaira(profitAfterTax)}
						</div>
					</div>
				</div>

				{/* Single row line item (matches your screenshot) */}
				<div className="mt-5 rounded-2xl bg-slate-50 border px-4 py-4 flex items-center justify-between">
					<div className="text-sm font-semibold text-slate-800">
						Company Income Tax rate ({ratePct})
					</div>
					<div className="text-sm font-semibold text-slate-900">
						{formatNaira(taxDue)}
					</div>
				</div>

				<button
					onClick={() => navigate("/calculate")}
					className="mt-6 w-full rounded bg-brand-800 text-white py-2.5 text-sm font-semibold hover:bg-brand-900"
				>
					Calculate Another Tax
				</button>

				{/* Optional guest CTA (same behavior as PAYE/PIT panel) */}
				{!isAuthenticated && (
					<div className="mt-6 rounded-2xl border bg-slate-200/60 p-5">
						<div className="text-sm font-semibold text-slate-900">
							Save Your Calculations
						</div>
						<div className="text-xs text-slate-600 mt-1">
							Create a free account to save your calculations and track history.
						</div>

						<div className="mt-4 flex gap-3">
							<input
								defaultValue={prefillEmail}
								className="flex-1 w-full rounded border px-3 py-2 text-sm bg-white"
								placeholder="Enter your email"
								type="email"
							/>
							<Link
								to="/signup"
								className="px-6 rounded bg-brand-800 text-white text-sm font-semibold grid place-items-center hover:bg-brand-900"
							>
								Sign Up
							</Link>
						</div>

						<Link
							to="/calculate"
							className="inline-block mt-3 text-xs text-slate-700 hover:text-brand-800"
						>
							Continue as guest
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
