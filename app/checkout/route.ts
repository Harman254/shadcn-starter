import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
	accessToken: process.env.POLAR_ACCESS_TOKEN,
	// server: "sandbox", // Use sandbox for testing purposes - otherwise use 'production' or omit this line
	successUrl: `http://localhost:3000/checkout/success`,
})
