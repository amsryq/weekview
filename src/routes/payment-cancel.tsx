import { createFileRoute } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const Route = createFileRoute("/payment-cancel")({
  head: () => ({
    meta: [{ title: "Payment Cancelled — Weekview" }],
  }),
  component: PaymentCancelPage,
});

function PaymentCancelPage() {
  const closeWindow = () => {
    window.close();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-orange-600">Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was cancelled. No charges have been made to your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={closeWindow} variant="outline" className="w-full">
            Close Window
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
