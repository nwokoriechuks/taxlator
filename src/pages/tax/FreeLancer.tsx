import React from "react";
import TaxPageLayout from "./TaxPageLayout";

export default function Freelancer() {
  return (
    <TaxPageLayout
      title="Freelancer / Self-Employed"
      subtitle="Boilerplate page. Add inputs + wire to /api/tax/calculate."
    >
      <div className="text-sm text-slate-700">
        Placeholder: Add freelancer inputs and calculation logic here.
      </div>
    </TaxPageLayout>
  );
}
