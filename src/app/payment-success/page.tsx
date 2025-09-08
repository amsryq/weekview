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

async function fetchSessionData(
	sessionId: string,
): Promise<PaymentSessionData> {
	const response = await fetch(`/api/stripe/session/${sessionId}`);
	if (!response.ok) {
		throw new Error("Failed to fetch session data");
	}
	return response.json();
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
		retry: 2,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const closeWindow = () => {
		window.close();
	};

	// Handle missing session ID
	if (!sessionId) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4">
							<XCircle className="h-16 w-16 text-destructive" />
						</div>
						<CardTitle className="text-destructive">Payment Failed</CardTitle>
						<CardDescription>No session ID provided</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<Button onClick={closeWindow} variant="outline" className="w-full">
							Close Window
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (loading) {
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

	if (error || !sessionData) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4">
							<XCircle className="h-16 w-16 text-destructive" />
						</div>
						<CardTitle className="text-destructive">Payment Failed</CardTitle>
						<CardDescription>
							{error instanceof Error
								? error.message
								: "Unable to verify payment status"}
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<Button onClick={closeWindow} variant="outline" className="w-full">
							Close Window
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const isPaymentSuccessful =
		sessionData.status === "complete" && sessionData.payment_status === "paid";
	const supporterExpirationDate = sessionData.supporter_expires_at
		? new Date(sessionData.supporter_expires_at * 1000)
		: null;
	const isSupporterExpired = sessionData.supporter_expires_at
		? Date.now() > sessionData.supporter_expires_at * 1000
		: false;
	const isSupporterPayment = supporterExpirationDate !== null;

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4">
						{isPaymentSuccessful ? (
							<CheckCircle className="h-16 w-16 text-green-500" />
						) : (
							<XCircle className="h-16 w-16 text-destructive" />
						)}
					</div>
					<CardTitle
						className={
							isPaymentSuccessful ? "text-green-600" : "text-destructive"
						}
					>
						{isPaymentSuccessful ? "Payment Successful!" : "Payment Failed"}
					</CardTitle>
					<CardDescription>
						{isPaymentSuccessful
							? isSupporterPayment
								? "Thank you for your support! Your supporter status has been activated and will be valid for one year."
								: "Thank you! Your payment has been processed successfully."
							: "There was an issue processing your payment."}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{isPaymentSuccessful && (
						<>
							<div className="text-center space-y-2">
								<p className="text-sm text-muted-foreground">
									Amount: {sessionData.currency.toUpperCase()}{" "}
									{(sessionData.amount_total / 100).toFixed(2)}
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
											{isSupporterExpired ? (
												<span className="text-destructive">
													Expired on:{" "}
													{supporterExpirationDate.toLocaleDateString()}
												</span>
											) : (
												<span>
													Valid until:{" "}
													{supporterExpirationDate.toLocaleDateString()} at{" "}
													{supporterExpirationDate.toLocaleTimeString()}
												</span>
											)}
										</div>
									</div>
								</div>
							)}
						</>
					)}

					<Button onClick={closeWindow} className="w-full">
						Close Window
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
