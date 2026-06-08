import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ENABLE_AUTH_PAYWALL } from "~/lib/config/feature-flags";
import { seo } from "~/lib/utils/seo";

export const Route = createFileRoute("/terms")({
	beforeLoad: () => {
		if (!ENABLE_AUTH_PAYWALL) {
			throw redirect({ to: "/app" });
		}
	},
	head: () => ({
		meta: seo({
			title: "Terms of Service | Weekview",
			description:
				"The legal terms governing use of Weekview, including accounts, subscriptions, refunds, and limitations of liability.",
		}),
	}),
	component: TermsPage,
});

function TermsPage() {
	return (
		<div className="legal-content">
			<h1>Terms of Service — Weekview</h1>
			<p>
				<strong>Effective date:</strong> September 30, 2025
			</p>

			<h2>1. Agreement to terms</h2>
			<p>
				These Terms of Service ("Terms") govern your use of Weekview (the
				"Service"). By accessing or using Weekview, you agree to these Terms and
				to the Weekview Privacy Policy. If you do not agree, do not use the
				Service.
			</p>

			<h2>2. Eligibility</h2>
			<p>
				You must be at least 13 years old to use Weekview. By using the Service
				you represent that you meet the age requirement and have the right to
				enter these Terms. If you are under the age of majority in your
				jurisdiction, you represent that a parent or guardian has agreed to
				these Terms on your behalf.
			</p>

			<h2>3. Accounts and authentication</h2>
			<ul>
				<li>
					Accounts are optional for using core features. Some features—such as
					the <strong>Supporter</strong> paid tier—require account registration.
				</li>
				<li>
					You may register using Google or GitHub OAuth. By registering you
					consent to Weekview creating a Weekview account and a corresponding
					Stripe customer record and to sharing your email and Weekview account
					ID with Stripe to manage payments.
				</li>
				<li>
					You are responsible for maintaining the confidentiality of any account
					credentials and for activity that occurs under your account.
				</li>
			</ul>

			<h2>4. Paid features, billing, and refunds</h2>
			<ul>
				<li>
					Weekview offers free core features. Additional features are available
					through paid <strong>Supporter</strong> subscriptions.
				</li>
				<li>
					Payments and subscription billing are handled by Stripe. When you
					subscribe, you authorize us to charge your payment method for
					subscription fees and applicable taxes.
				</li>
				{/* <li>
					Subscriptions automatically renew until cancelled. To avoid renewal,
					cancel before the next billing date. Cancellation takes effect at the
					end of the current billing period; you will retain access until then.
				</li> */}
				<li>
					<strong>Refunds:</strong> Refunds are granted only at Weekview's
					discretion or where required by law. If you believe you are entitled
					to a refund, contact support with your account and transaction
					details.
				</li>
				<li>
					If a payment fails, we may suspend access to paid features until
					payment is resolved.
				</li>
			</ul>

			<h2>5. License and restrictions</h2>
			<ul>
				<li>
					Subject to these Terms and payment of applicable fees, Weekview grants
					you a limited, non-exclusive, non-transferable license to use the
					Service.
				</li>
				<li>
					You agree not to:
					<ul>
						<li>Use the Service for illegal activities or to violate laws.</li>
						<li>
							Attempt to reverse engineer, decompile, disassemble, or create
							derivative works of our Service, or redistribute results of
							reverse engineering. Where local law permits reverse engineering
							for interoperability, you may exercise such rights to the extent
							allowed by law, but you may not redistribute or commercialize the
							results.
						</li>
						<li>Interfere with or bypass security or any usage limits.</li>
						<li>Use the Service to store or transmit malicious content.</li>
					</ul>
				</li>
			</ul>

			<h2>6. User data and generated content</h2>
			<ul>
				<li>
					<strong>Your content:</strong> Timetables and customizations you
					create are your content. You retain ownership of that content.
				</li>
				<li>
					Weekview is not a social platform: there are no public feeds or
					community posting features. You are responsible for maintaining copies
					of important content.
				</li>
			</ul>

			<h2>7. Intellectual property</h2>
			<ul>
				<li>
					All software, designs, trademarks and content of Weekview are owned by
					Weekview or its licensors. Except for the license granted above,
					Weekview retains all rights.
				</li>
				<li>You must not remove or alter proprietary notices.</li>
			</ul>

			<h2>8. Third-party services</h2>
			<ul>
				<li>
					Weekview uses third-party services (e.g., Google, GitHub, Stripe).
					Your use of those services is subject to their terms and policies.
				</li>
				<li>
					Stripe's processing of payments and storage of payment information is
					governed by Stripe's policies. Weekview is not responsible for
					third-party practices.
				</li>
			</ul>

			<h2>9. Privacy</h2>
			<p>
				Use of personal data is described in the Weekview Privacy Policy, which
				is incorporated here by reference.
			</p>

			<h2>10. Disclaimers</h2>
			<ul>
				<li>
					The Service is provided "as is" and "as available." Weekview makes no
					warranties, express or implied, including merchantability, fitness for
					a particular purpose, or non-infringement.
				</li>
				<li>
					Weekview does not guarantee uninterrupted availability or that the
					Service will be error-free or secure.
				</li>
			</ul>

			<h2>11. Limitation of liability</h2>
			<ul>
				<li>
					To the fullest extent permitted by law, Weekview and its affiliates
					will not be liable for indirect, incidental, special, consequential,
					or exemplary damages arising from your use of the Service.
				</li>
			</ul>

			<h2>12. Indemnification</h2>
			<p>
				You agree to indemnify, defend, and hold harmless Weekview and its
				officers, employees and agents from claims, liabilities, damages,
				losses, and expenses arising from your breach of these Terms or your use
				of the Service.
			</p>

			<h2>13. Suspension and termination</h2>
			<ul>
				<li>
					We may suspend or terminate your access for violations of these Terms
					or for abuse.
				</li>
				<li>
					Upon termination we may delete your account and content, subject to
					our deletion policy. Termination will not relieve you of unpaid fees.
				</li>
			</ul>

			<h2>14. Changes to the Service and Terms</h2>
			<ul>
				<li>
					We may modify the Service or these Terms at any time. We will post
					changes and update the effective date. Continued use of the Service
					after changes indicates acceptance.
				</li>
				<li>
					If we make material changes to payment or cancellation terms, we will
					provide notice and, where required, an opportunity to cancel.
				</li>
			</ul>

			<h2>15. Governing law and disputes</h2>
			<ul>
				<li>
					These Terms are governed by the laws of <strong>Malaysia</strong>{" "}
					without regard to conflict-of-law principles.
				</li>
				<li>
					For disputes, please contact us first at{" "}
					<a href="mailto:amsyarasyiq@gmail.com">amsyarasyiq@gmail.com</a>; we
					will try to resolve issues cooperatively. If unresolved, disputes will
					be brought in the courts of Malaysia (unless otherwise required by
					applicable law).
				</li>
			</ul>

			<h2>16. Miscellaneous</h2>
			<ul>
				<li>
					<strong>Severability:</strong> If a court finds a provision invalid,
					the remaining provisions remain effective.
				</li>
				<li>
					<strong>Entire agreement:</strong> These Terms and the Privacy Policy
					constitute the entire agreement between you and Weekview regarding the
					Service.
				</li>
				<li>
					<strong>No waiver:</strong> Failure to enforce a provision is not a
					waiver of that provision.
				</li>
			</ul>

			<h2>17. Contact</h2>
			<p>
				For support, billing, privacy requests, or legal notices:{" "}
				<a href="mailto:amsyarasyiq@gmail.com">amsyarasyiq@gmail.com</a>
			</p>

			<hr />
			<p>
				Our Privacy Policy is available{" "}
				<Link to="/privacy" className="underline">
					here
				</Link>
				.
			</p>
		</div>
	);
}
