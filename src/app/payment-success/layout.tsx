import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Payment Success - Weekview",
	description: "Payment completed successfully",
};

export default function PaymentSuccessLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
