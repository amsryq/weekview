"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

interface PaymentSessionData {
	status: string;
	customer_email: string;
	amount_total: number;
	currency: string;
	supporter_expires_at: number | null;
	payment_status: string;
}

const PAYMENT_STATUS = {
	COMPLETE: "complete",
	PAID: "paid",
} as const;

const QUERY_CONFIG = {
	RETRY_ATTEMPTS: 2,
	STALE_TIME: 5 * 60 * 1000, // 5 minutes
} as const;

// API Functions
async function fetchSessionData(
	sessionId: string,
): Promise<PaymentSessionData> {
	const response = await fetch(`/api/stripe/session/${sessionId}`);
	if (!response.ok) {
		throw new Error("Failed to fetch session data");
	}
	return response.json();
}

const formatCurrency = (amount: number, currency: string): string =>
	`${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`;

const formatSupporterExpiration = (timestamp: number): string => {
	const date = new Date(timestamp * 1000);
	return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
};

const isPaymentSuccessful = (data: PaymentSessionData): boolean =>
	data.status === PAYMENT_STATUS.COMPLETE &&
	data.payment_status === PAYMENT_STATUS.PAID;

const isSupporterPayment = (data: PaymentSessionData): boolean =>
	data.supporter_expires_at !== null;

interface StatusCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	children?: React.ReactNode;
	titleClassName?: string;
}

function StatusCard({
	icon,
	title,
	description,
	children,
	titleClassName,
}: StatusCardProps) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4">{icon}</div>
					<CardTitle className={titleClassName}>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{children}
					<Button onClick={() => window.close()} className="w-full">
						Close Window
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

function LoadingCard() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<Card className="w-full max-w-md">
				<CardContent className="flex items-center justify-center p-6">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</CardContent>
			</Card>
		</div>
	);
}

function ErrorCard({ message }: { message: string }) {
	return (
		<StatusCard
			icon={<XCircle className="h-16 w-16 text-destructive" />}
			title="Payment Failed"
			description={message}
			titleClassName="text-destructive"
		/>
	);
}

interface PaymentDetailsProps {
	sessionData: PaymentSessionData;
}

function PaymentDetails({ sessionData }: PaymentDetailsProps) {
	const supporterExpirationDate = sessionData.supporter_expires_at;

	return (
		<>
			<div className="text-center space-y-2">
				<p className="text-sm text-muted-foreground">
					Amount:{" "}
					{formatCurrency(sessionData.amount_total, sessionData.currency)}
				</p>
				{sessionData.customer_email && (
					<p className="text-sm text-muted-foreground">
						Email: {sessionData.customer_email}
					</p>
				)}
			</div>

			{supporterExpirationDate && (
				<div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
							<Clock className="h-4 w-4" />
							Supporter Status Active
						</div>
						<div className="text-sm text-green-600 dark:text-green-300">
							Valid until: {formatSupporterExpiration(supporterExpirationDate)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default function PaymentSuccessPage() {
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session_id");

	const {
		data: sessionData,
		isLoading: loading,
		error,
	} = useQuery({
		queryKey: ["stripe-session", sessionId],
		queryFn: () => fetchSessionData(sessionId!),
		enabled: !!sessionId,
		retry: QUERY_CONFIG.RETRY_ATTEMPTS,
		staleTime: QUERY_CONFIG.STALE_TIME,
	});

	// Handle missing session ID
	if (!sessionId) {
		return <ErrorCard message="No session ID provided" />;
	}

	// Handle loading state
	if (loading) {
		return <LoadingCard />;
	}

	// Handle error state
	if (error || !sessionData) {
		const errorMessage =
			error instanceof Error
				? error.message
				: "Unable to verify payment status";
		return <ErrorCard message={errorMessage} />;
	}

	// Handle success/failure state
	const paymentSuccessful = isPaymentSuccessful(sessionData);
	const supporterPayment = isSupporterPayment(sessionData);

	const successMessage = supporterPayment
		? "Thank you for your support! Your supporter status has been activated and will be valid for one month."
		: "Thank you! Your payment has been processed successfully.";

	const failureMessage = "There was an issue processing your payment.";

	return (
		<StatusCard
			icon={
				paymentSuccessful ? (
					<CheckCircle className="h-16 w-16 text-green-500" />
				) : (
					<XCircle className="h-16 w-16 text-destructive" />
				)
			}
			title={paymentSuccessful ? "Payment Successful!" : "Payment Failed"}
			description={paymentSuccessful ? successMessage : failureMessage}
			titleClassName={paymentSuccessful ? "text-green-600" : "text-destructive"}
		>
			{paymentSuccessful && <PaymentDetails sessionData={sessionData} />}
		</StatusCard>
	);
}
