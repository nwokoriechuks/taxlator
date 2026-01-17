// taxlator/src/pages/tax/FreelancerResultPanel.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function formatNaira(value: unknown) {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return "₦0.00";
	return `₦${n.toLocaleString("en-NG", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

type Props = {
	result: unknown;
	grossIncome: number;
	isAuthenticated: boolean;
	prefillEmail?: string;
};

export default function FreelancerResultPanel({
	result,
	grossIncome,
	isAuthenticated,
	prefillEmail = "",
}: Props) {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState(prefillEmail);

	// Be defensive: backend result shape may vary.
	const r = useMemo(() => (result ?? {}) as Record<string, unknown>, [result]);

	// Your freelancer service returns:
	// totalAnnualTax, monthlyTax, taxableIncome, annualGrossIncome, pension, expenses, breakdown[]
	const totalAnnualTax =
		r.totalAnnualTax ?? r.totalTax ?? r.taxAmount ?? r.annualTax ?? r.tax ?? 0;

	const annualGross = r.annualGrossIncome ?? r.grossIncome ?? grossIncome;

	const taxableIncome = r.taxableIncome ?? 0;

	const pension = r.pension ?? 0;
	const expenses = r.expenses ?? 0;

	const netIncome = useMemo(() => {
		const tax =
			typeof totalAnnualTax === "number"
				? totalAnnualTax
				: Number(totalAnnualTax);
		const gross =
			typeof annualGross === "number" ? annualGross : Number(annualGross);
		if (!Number.isFinite(tax) || !Number.isFinite(gross)) return grossIncome;
		return Math.max(0, gross - tax);
	}, [totalAnnualTax, annualGross, grossIncome]);

	const breakdown = useMemo(() => {
		const b = r.breakdown;
		return Array.isArray(b) ? (b as Array<Record<string, unknown>>) : [];
	}, [r]);

	return (
		<div className="bg-white rounded-2xl border shadow-soft overflow-hidden">
			{/* Header */}
			<div className="p-6 text-center border-b">
				<div className="text-sm text-slate-600">
					Freelancer / Self-Employed Result
				</div>
				<div className="mt-2 text-3xl font-extrabold text-brand-800">
					{formatNaira(totalAnnualTax)}
				</div>
				<div className="text-sm text-slate-600 mt-1">Total Tax Due</div>
			</div>

			<div className="p-6">
				{/* Summary cards */}
				<div className="grid grid-cols-2 gap-4">
					<div className="rounded-2xl bg-slate-50 border p-4">
						<div className="text-xs text-slate-600">Gross Income</div>
						<div className="mt-1 font-semibold">{formatNaira(annualGross)}</div>
					</div>
					<div className="rounded-2xl bg-slate-50 border p-4">
						<div className="text-xs text-slate-600">Net Income</div>
						<div className="mt-1 font-semibold">{formatNaira(netIncome)}</div>
					</div>
				</div>

				{/* Accordion trigger */}
				<button
					type="button"
					onClick={() => setOpen((s) => !s)}
					className="mt-5 w-full flex items-center justify-between rounded-2xl bg-slate-50 border px-4 py-3 text-sm font-semibold"
				>
					<span>View Tax Breakdown</span>
					<span className="text-slate-500">{open ? "▴" : "▾"}</span>
				</button>

				{/* Breakdown */}
				{open && (
					<div className="mt-4 rounded-2xl border bg-slate-50 p-4">
						<div className="text-brand-800 font-semibold">
							Tax Calculation Breakdown
						</div>

						<div className="mt-3 space-y-1 text-xs text-slate-700">
							<div className="flex justify-between gap-3">
								<div className="truncate">Pension Contributions</div>
								<div className="font-medium">{formatNaira(pension)}</div>
							</div>
							<div className="flex justify-between gap-3">
								<div className="truncate">Business Expenses</div>
								<div className="font-medium">{formatNaira(expenses)}</div>
							</div>
							<div className="flex justify-between gap-3">
								<div className="truncate">Annual Taxable Income</div>
								<div className="font-medium">{formatNaira(taxableIncome)}</div>
							</div>
						</div>

						{breakdown.length > 0 && (
							<>
								<hr className="my-4" />
								<div className="text-xs font-semibold text-slate-700">
									Break Down Your Tax
								</div>

								<div className="mt-2 space-y-2 text-xs text-slate-700">
									{breakdown.map((b, idx) => {
										const rate = b.rate ?? "";
										const taxableAmount = b.taxableAmount ?? 0;
										const tax = b.tax ?? 0;

										const rateLabel =
											typeof rate === "number"
												? `${Math.round(rate * 100)}%`
												: String(rate);

										return (
											<div
												key={idx}
												className="rounded-xl bg-white/60 border px-3 py-2"
											>
												<div className="flex justify-between gap-3">
													<div className="truncate">
														Tax Band {idx + 1} ({rateLabel})
													</div>
													<div className="font-semibold">
														{formatNaira(tax)}
													</div>
												</div>
												<div className="mt-1 flex justify-between gap-3 text-slate-600">
													<div className="truncate">Taxable Amount</div>
													<div className="font-medium">
														{formatNaira(taxableAmount)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</>
						)}

						<hr className="my-4" />

						<div className="flex justify-between text-xs text-slate-700">
							<div>Total Annual Tax</div>
							<div className="font-semibold">{formatNaira(totalAnnualTax)}</div>
						</div>

						<div className="flex justify-between text-xs text-slate-700 mt-1">
							<div>Monthly Tax</div>
							<div className="font-semibold">
								{formatNaira(
									typeof r.monthlyTax === "number"
										? r.monthlyTax
										: Number(r.monthlyTax ?? Number(totalAnnualTax) / 12)
								)}
							</div>
						</div>
					</div>
				)}

				{/* Actions */}
				<button
					onClick={() => navigate("/calculate")}
					className="mt-6 w-full rounded bg-brand-800 text-white py-2.5 text-sm font-semibold hover:bg-brand-900"
				>
					Calculate Another Tax
				</button>

				{/* Guest-only CTA */}
				{!isAuthenticated && (
					<div className="mt-6 rounded-2xl border bg-slate-200/60 p-5">
						<div className="text-sm font-semibold text-slate-900">
							Save Your Calculations
						</div>
						<div className="text-xs text-slate-600 mt-1">
							Create a free account to save your tax calculations, track
							history, and get reminders.
						</div>

						<div className="mt-4 flex gap-3">
							<div className="flex-1">
								<input
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full rounded border px-3 py-2 text-sm bg-white"
									placeholder="Enter your email"
									type="email"
								/>
							</div>
							<Link
								to="/signup"
								state={{ email }}
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
