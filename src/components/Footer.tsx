import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="text-xs text-slate-600">
          © {new Date().getFullYear()} Taxlator. For informational purposes only.
        </div>
        <div className="flex gap-4 text-xs text-slate-600">
          <a className="hover:text-brand-700" href="/#about">
            About
          </a>
          <a className="hover:text-brand-700" href="/#privacy">
            Privacy Policy
          </a>
          <a className="hover:text-brand-700" href="/#contact">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
