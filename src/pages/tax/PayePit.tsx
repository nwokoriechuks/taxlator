// taxlator/src/pages/tax/PayePit.tsx
import { useMemo, useState } from "react";
import TaxPageLayout from "./TaxPageLayout";
import { api } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoints";
import { addHistory } from "../../state/history";
import type { PayePitCalculatePayload } from "../../api/types";
import { useAuth } from "../../state/useAuth";
import PayePitResultPanel from "./PayePitResultPanel";

type ApiSuccess<T> = { success: true; data: T; message?: string };
type ApiFail = { success?: false; message?: string; error?: string };

export default function PayePit() {
	const { authenticated } = useAuth();

	const [grossAnnualIncome, setGrossAnnualIncome] = useState("");
	const [rentRelief, setRentRelief] = useState("");
	const [otherDeductions, setOtherDeductions] = useState("");

	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [result, setResult] = useState<unknown>(null);

	const grossIncomeNumber = useMemo(
		() => Number(grossAnnualIncome || 0),
		[grossAnnualIncome]
	);

	async function calculate() {
		setError("");
		setBusy(true);

		try {
			const payload: PayePitCalculatePayload = {
				taxType: "PAYE/PIT",
				grossIncome: grossIncomeNumber,
				// frequency?: "annual" | "monthly" (optional; backend defaults to annual)
				rentRelief: Number(rentRelief || 0),
				otherDeductions: Number(otherDeductions || 0),
			};

			const { data } = await api.post<ApiSuccess<unknown> | ApiFail>(
				ENDPOINTS.taxCalculate,
				payload
			);

			if (!("success" in data) || data.success !== true) {
				const msg =
					(data as ApiFail).message ||
					(data as ApiFail).error ||
					"PAYE/PIT calculation failed";
				setError(msg);
				return;
			}

			setResult(data.data);

			addHistory({
				type: "PAYE_PIT",
				input: payload,
				result: data.data,
			});
		} catch (err: unknown) {
			const e = err as {
				response?: { data?: { message?: string; error?: string } };
				message?: string;
			};
			setError(
				e.response?.data?.message ||
					e.response?.data?.error ||
					e.message ||
					"PAYE/PIT calculation failed"
			);
		} finally {
			setBusy(false);
		}
	}

	return (
		<TaxPageLayout
			title="PAYE/ PIT Calculator"
			subtitle="Calculate your personal income tax base on Nigerian Tax Law (PITA)"
			rightPanel={
				result ? (
					<PayePitResultPanel
						result={result}
						grossIncome={grossIncomeNumber}
						isAuthenticated={authenticated}
					/>
				) : null
			}
		>
			{error ? (
				<div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
					{error}
				</div>
			) : null}

			<label className="text-xs font-semibold text-slate-700">
				Gross Annual Income
			</label>
			<input
				className="mt-1 w-full rounded border px-3 py-2 text-sm"
				value={grossAnnualIncome}
				onChange={(e) => setGrossAnnualIncome(e.target.value)}
				placeholder="₦ 0"
				inputMode="numeric"
			/>

			<label className="text-xs font-semibold text-slate-700 mt-4 block">
				Rent Relief
			</label>
			<input
				className="mt-1 w-full rounded border px-3 py-2 text-sm"
				value={rentRelief}
				onChange={(e) => setRentRelief(e.target.value)}
				placeholder="₦ 0"
				inputMode="numeric"
			/>

			<label className="text-xs font-semibold text-slate-700 mt-4 block">
				Other Deductions
			</label>
			<input
				className="mt-1 w-full rounded border px-3 py-2 text-sm"
				value={otherDeductions}
				onChange={(e) => setOtherDeductions(e.target.value)}
				placeholder="₦ 0"
				inputMode="numeric"
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
