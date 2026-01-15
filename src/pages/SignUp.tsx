import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function SignUp() {
  const { signup, sendVerificationCode } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // Optional: if your API uses it.
      await sendVerificationCode({ email }).catch(() => {});

      await signup({ firstName, lastName, email, password });
      navigate("/signin");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-slate-200 min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-soft overflow-hidden">
        <div className="p-6 border-b text-center">
          <div className="w-12 h-12 mx-auto rounded bg-brand-700 text-white grid place-items-center font-bold">T</div>
          <div className="mt-3 text-lg font-semibold">Sign Up</div>
          <div className="text-xs text-slate-600">Create your free Taxlator account</div>
        </div>

        <form className="p-6" onSubmit={onSubmit}>
          {error ? (
            <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          ) : null}

          <label className="text-xs font-semibold text-slate-700">First Name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
          <label className="text-xs font-semibold text-slate-700">Last Name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your full name"
            required
          />

          {/* <label className="text-xs font-semibold text-slate-700 mt-4 block">Phone Number</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
          /> */}

          <label className="text-xs font-semibold text-slate-700 mt-4 block">Email Address</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label className="text-xs font-semibold text-slate-700 mt-4 block">Password</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <button
            disabled={busy}
            className="mt-5 w-full rounded bg-brand-800 text-white py-2.5 text-sm font-semibold hover:bg-brand-900 disabled:opacity-60"
          >
            {busy ? "Creating..." : "Sign Up"}
          </button>

          <div className="mt-4 text-xs text-slate-600 text-center">
            Already have an account?{" "}
            <Link className="text-brand-800 font-semibold hover:text-brand-900" to="/signin">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
