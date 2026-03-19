import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Suspense } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { ENABLE_AUTH_PAYWALL } from "~/lib/config/feature-flags";
import { seo } from "~/lib/utils/seo";
import { getStripeSession } from "~/server/functions/stripe";

interface PaymentSessionData {
	status: string | null;
	customer_email: string | null;
	amount_total: number | null;
	currency: string | null;
	supporter_expires_at: number | null;
	payment_status: string;
}

const PAYMENT_STATUS = {
	COMPLETE: "complete",
	PAID: "paid",
} as const;

async function fetchSessionData(
	sessionId: string,
): Promise<PaymentSessionData> {
	const response = await getStripeSession({ data: sessionId });
	return response;
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
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
					{sessionData.amount_total && sessionData.currency
						? formatCurrency(sessionData.amount_total, sessionData.currency)
						: "N/A"}
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

type PaymentSuccessSearch = {
	session_id?: string;
};

export const Route = createFileRoute("/payment-success")({
	validateSearch: (search: Record<string, unknown>): PaymentSuccessSearch => ({
		session_id: search.session_id as string | undefined,
	}),
	head: () => ({
		meta: seo({ title: "Payment Success | Weekview" }),
	}),
	component: PaymentSuccessPage,
});

function PaymentSuccessPageContent() {
	const { session_id: sessionId } = useSearch({
		from: "/payment-success",
	});

	const {
		data: sessionData,
		isLoading: loading,
		error,
	} = useQuery({
		queryKey: ["stripe-session", sessionId],
		queryFn: () => fetchSessionData(sessionId!),
		enabled: ENABLE_AUTH_PAYWALL && !!sessionId,
	});

	if (!ENABLE_AUTH_PAYWALL) {
		return (
			<StatusCard
				icon={<XCircle className="h-16 w-16 text-muted-foreground" />}
				title="Payments Disabled"
				description="In-app payment is currently disabled for this build."
			>
				<Button asChild variant="outline" className="w-full">
					<a
						href="https://github.com/sponsors/amsryq"
						target="_blank"
						rel="noopener noreferrer"
					>
						Sponsor on GitHub
					</a>
				</Button>
			</StatusCard>
		);
	}

	if (!sessionId) {
		return <ErrorCard message="No session ID provided" />;
	}

	if (loading) {
		return <LoadingCard />;
	}

	if (error || !sessionData) {
		const errorMessage =
			error instanceof Error
				? error.message
				: "Unable to verify payment status";
		return <ErrorCard message={errorMessage} />;
	}

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

function PaymentSuccessPage() {
	return (
		<Suspense fallback={<LoadingCard />}>
			<PaymentSuccessPageContent />
		</Suspense>
	);
}
