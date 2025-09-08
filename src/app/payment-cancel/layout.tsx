import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Payment Cancelled - Weekview",
	description: "Payment was cancelled",
};

export default function PaymentCancelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
