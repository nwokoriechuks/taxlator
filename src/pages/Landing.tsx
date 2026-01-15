import React from "react";
import { Link } from "react-router-dom";

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      {subtitle ? <div className="text-xs text-slate-600 mt-1">{subtitle}</div> : null}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="bg-brand-900">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.06)] border border-white/10">
          <div className="p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-white text-2xl md:text-3xl font-semibold leading-tight">
                Welcome to Taxlator
              </div>
              <p className="text-white/80 mt-3 text-sm leading-relaxed max-w-lg">
                Calculate your taxes easily and accurately. Our tools help you understand what you owe
                and how it is calculated.
              </p>

              <div className="mt-6 flex gap-3">
                <Link
                  to="/calculate"
                  className="px-4 py-2 rounded bg-white text-brand-900 text-sm font-semibold hover:bg-white/90"
                >
                  Calculate Tax
                </Link>
                <a
                  href="#guides"
                  className="px-4 py-2 rounded border border-white/30 text-white text-sm hover:bg-white/10"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="h-44 md:h-56 rounded-xl bg-white/10 border border-white/10 grid place-items-center text-white/70 text-sm">
              Add hero image here
            </div>
          </div>

          <div className="bg-white p-4">
            <button className="w-full rounded bg-brand-800 text-white py-3 text-sm font-semibold">
              CALCULATE TAX
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle title="How It Works?" subtitle="Just three steps to calculate your tax" />
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              ["Choose Your Tax Type", "Select PAYE/PIT, VAT, Freelancer, or Company tax."],
              ["Enter Your Income & Deductions", "Provide your details to generate accurate results."],
              ["See Your Tax Breakdown Instantly", "Get total tax and a quick breakdown."]
            ].map(([t, d], i) => (
              <div key={t} className="rounded-2xl bg-white border p-5">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-800 grid place-items-center font-bold">
                  {i + 1}
                </div>
                <div className="mt-3 font-semibold text-sm">{t}</div>
                <div className="text-xs text-slate-600 mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="guides" className="bg-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle title="Latest Tax Tips & Updates" subtitle="Stay informed with helpful tax guides and insights" />
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              ["Understanding PAYE Tax bands in Nigeria", "A quick overview of PAYE/PIT basics."],
              ["Tax Tips for Freelancers and Self-Employed", "Practical tips for self-employed taxpayers."],
              ["What is Company Income Tax?", "Learn how corporate taxes are handled."]
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white border overflow-hidden">
                <div className="h-28 bg-slate-200" />
                <div className="p-4">
                  <div className="font-semibold text-sm">{t}</div>
                  <div className="text-xs text-slate-600 mt-1">{d}</div>
                  <button className="mt-3 text-xs font-semibold text-brand-800 hover:text-brand-900">
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="about" className="bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle title="About" subtitle="Essential facts every Nigerian taxpayer should know about us" />
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {[
              ["Accurate Calculations", "Built to help you understand tax outcomes clearly."],
              ["Instant Breakdown", "Get totals and breakdowns quickly."],
              ["Perfect for Workers, Students & Businesses", "Flexible tools for different taxpayers."],
              ["Simple, Beautiful & Easy to Use", "Clean interface with reusable components."]
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white border p-5">
                <div className="font-semibold text-sm">{t}</div>
                <div className="text-xs text-slate-600 mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-brand-900 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl bg-white p-8 text-center border">
            <div className="text-xl font-semibold text-slate-900">Ready to Get Started?</div>
            <div className="text-sm text-slate-600 mt-2">
              Start calculating your taxes now. Creating an account enables tracking (optional).
            </div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                to="/calculate"
                className="px-4 py-2 rounded bg-brand-800 text-white text-sm font-semibold hover:bg-brand-900"
              >
                Calculate Now
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded border text-sm font-semibold hover:bg-slate-50"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div id="faqs" className="sr-only">
        FAQs placeholder
      </div>
    </div>
  );
}
