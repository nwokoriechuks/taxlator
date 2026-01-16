// src/App.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";

import Landing from "./pages/Landing";
import Calculate from "./pages/Calculate";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/verifyEmail";
import History from "./pages/History";

import PayePit from "./pages/tax/PayePit";
import Vat from "./pages/tax/Vat";
import Freelancer from "./pages/tax/FreeLancer";
import Company from "./pages/tax/Company";
import TaxGuides from "./pages/TaxGuides";
import About from "./pages/About";
import Faqs from "./pages/Faqs";
import Terms from "./pages/Term_Conditions";

export default function App() {
	return (
		<Shell>
			<Routes>
				<Route path="/" element={<Landing />} />
				<Route path="/calculate" element={<Calculate />} />
				<Route path="/history" element={<History />} />
				<Route path="/taxguide" element={<TaxGuides />} />
				<Route path="/about" element={<About />} />
				<Route path="/faqs" element={<Faqs />} />
				<Route path="/terms&conditions" element={<Terms />} />
				<Route path="/signin" element={<SignIn />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/verify-email" element={<VerifyEmail />} /> {/* ✅ ADD */}
				{/* Public tax pages */}
				<Route path="/tax/paye-pit" element={<PayePit />} />
				<Route path="/tax/vat" element={<Vat />} />
				<Route path="/tax/freelancer" element={<Freelancer />} />
				<Route path="/tax/company" element={<Company />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</Shell>
	);
}
