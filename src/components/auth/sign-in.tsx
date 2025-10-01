"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils/styles";
import { signIn } from "../../lib/auth/auth-client";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
export default function SignIn({ children }: { children: React.ReactNode }) {
	const [loading, setLoading] = useState(false);

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-lg md:text-xl">Sign In</DialogTitle>
					<DialogDescription className="text-xs md:text-sm">
						Choose a provider to sign in with.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4">
					<div className="w-full gap-2 flex flex-col-reverse items-center justify-between">
						<Button
							variant="outline"
							className={cn("w-full gap-2")}
							disabled={loading}
							onClick={async () => {
								await signIn.social(
									{
										provider: "github",
										callbackURL:
											process.env.NEXT_PUBLIC_APP_URL || window.location.origin,
									},
									{
										onRequest: () => setLoading(true),
										onResponse: () => setLoading(false),
									},
								);
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
								></path>
							</svg>
							Sign in with Github
						</Button>
						<Button
							variant="outline"
							className={cn("w-full gap-2")}
							onClick={async () => {
								await signIn.social(
									{
										provider: "google",
										callbackURL:
											process.env.NEXT_PUBLIC_APP_URL || window.location.origin,
									},
									{
										onRequest: () => setLoading(true),
										onResponse: () => setLoading(false),
									},
								);
							}}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
								<path
									fill="#EA4335"
									d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
								></path>
								<path
									fill="#4285F4"
									d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
								></path>
								<path
									fill="#FBBC05"
									d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
								></path>
								<path
									fill="#34A853"
									d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
								></path>
								<path fill="none" d="M0 0h48v48H0z"></path>
							</svg>
							Sign in with Google
						</Button>
					</div>
					<p className="text-xs text-muted-foreground">
						By signing in, you agree to our{" "}
						<Link href="/terms" className="underline">
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link href="/privacy" className="underline">
							Privacy Policy
						</Link>
						.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
