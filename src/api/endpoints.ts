// taxlator/src/api/endpoints.ts
export const API_BASE = "https://gov-taxlator-api.onrender.com";

export const ENDPOINTS = {
	// AUTH
	signup: "api/auth/signup",
	signin: "api/auth/signin",
	verifyEmail: "api/auth/verifyEmail",
	sendVerificationCode: "api/auth/sendVerificationCode",
	signout: "api/auth/signout",
	// CALCULATIONS
	taxCalculate: "api/tax/calculate",
	vatCalculate: "api/vat/calculate",
};
