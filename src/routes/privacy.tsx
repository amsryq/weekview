import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ENABLE_AUTH_PAYWALL } from "~/lib/config/feature-flags";

export const Route = createFileRoute("/privacy")({
	head: () => ({
		meta: [
			{ title: "Privacy Policy — Weekview" },
			{
				name: "description",
				content:
					"How Weekview collects, uses, and protects your information. Learn about data collection, cookies, payments via Stripe, and your rights.",
			},
		],
	}),
	beforeLoad: () => {
		if (!ENABLE_AUTH_PAYWALL) {
			throw redirect({ to: "/app" });
		}
	},
	component: PrivacyPage,
});

function PrivacyPage() {
	return (
		<div className="legal-content">
			<h1>Privacy Policy — Weekview</h1>
			<p>
				<strong>Effective date:</strong> September 30, 2025
			</p>

			<h2>1. Introduction</h2>
			<p>
				Welcome to <strong>Weekview</strong>. This Privacy Policy explains how
				we collect, use, disclose, and protect information when you use the
				Weekview application and related services (the "Service"). By using
				Weekview you agree to the collection and use of information in this
				policy.
			</p>
			<p>
				If you have questions or want to exercise your rights (data access,
				export, deletion), contact us at{" "}
				<a href="mailto:amsyarasyiq@gmail.com">amsyarasyiq@gmail.com</a>.
			</p>

			<h2>2. Information we collect</h2>
			<p>We collect information in order to provide and improve the Service:</p>

			<h3>a. Account information</h3>
			<ul>
				<li>
					If you sign up for an account (i.e. via Google or GitHub OAuth) we
					collect the information those providers share with us (typically name
					and email).
				</li>
				<li>
					We create and store a Weekview account ID for each registered user.
				</li>
				<li>
					When an account is created we also create a related Stripe customer
					record; we send your email and Weekview account ID to Stripe so Stripe
					can manage payments.
				</li>
			</ul>

			<h3>b. Payment &amp; billing information</h3>
			<ul>
				<li>
					We use Stripe as our payment processor. Weekview does{" "}
					<strong>not</strong> store full payment card details. Stripe handles
					card storage and PCI compliance.
				</li>
				<li>
					We store payment-related identifiers (for example, Stripe customer ID
					and transaction records) necessary to manage your subscription and
					billing history.
				</li>
			</ul>

			<h3>c. Timetable data and user content</h3>
			<ul>
				<li>
					Timetables, customizations and files you create or upload to Weekview
					are NOT stored on our servers.
				</li>
			</ul>

			<h3>d. Usage, diagnostics, and device information</h3>
			<ul>
				<li>
					We collect technical data (device type, browser, IP address, usage
					logs, crash reports, and analytics) to operate and improve the
					Service.
				</li>
			</ul>

			<h3>e. Support communications</h3>
			<ul>
				<li>
					If you contact support we retain the communication and any information
					you choose to give us to help resolve your issue.
				</li>
			</ul>

			<h3>f. Cookies and local storage</h3>
			<ul>
				<li>
					We use cookies and local storage for session management, preferences,
					and to enable basic functionality.
				</li>
			</ul>

			<h2>3. How we use your information</h2>
			<ul>
				<li>Provide and maintain the Service.</li>
				<li>Process payments and manage subscriptions.</li>
				<li>
					Communicate with you about your account, updates, and support
					requests.
				</li>
				<li>Improve, debug, and secure the Service.</li>
				<li>Comply with legal obligations.</li>
			</ul>

			<h2>4. Sharing and third parties</h2>
			<p>We share personal information only as described here:</p>
			<ul>
				<li>
					<strong>Payment processor:</strong> Stripe — to process and record
					payments (we send email and account ID to Stripe).
				</li>
				<li>
					<strong>OAuth providers:</strong> Google and GitHub — to authenticate
					you and obtain profile information you consent to share.
				</li>
				<li>
					<strong>Service providers:</strong> hosting, analytics, email, and
					other vendors who perform services on our behalf.
				</li>
				<li>
					<strong>Legal and safety:</strong> when required by law or to protect
					rights, property, safety of Weekview, users, or the public.
				</li>
			</ul>
			<p>
				We require service providers to process data only as instructed and to
				maintain confidentiality.
			</p>

			<h2>5. International transfers</h2>
			<p>
				Weekview and third-party providers may process and store data in
				jurisdictions outside your country. By using the Service you consent to
				transfers of your information to countries that may have different data
				protection laws.
			</p>

			<h2>6. Data retention</h2>
			<ul>
				<li>
					We retain account data and user content as long as your account
					exists.
				</li>
				<li>
					After you request deletion, we will begin deletion and remove your
					data from active systems, but complete deletion may not be immediate
					due to backups and technical constraints.
				</li>
				<li>
					We may retain some information for longer if required for legal
					compliance or to resolve disputes.
				</li>
			</ul>

			<h2>7. Data export and deletion</h2>
			<ul>
				<li>
					You may request an export of your data (export formats may vary).
				</li>
				<li>
					To request export or deletion, contact{" "}
					<a href="mailto:amsyarasyiq@gmail.com">amsyarasyiq@gmail.com</a> and
					provide sufficient details to verify your identity and account.
				</li>
				<li>
					We will verify requests before acting to prevent unauthorized access.
				</li>
			</ul>

			<h2>8. Security</h2>
			<p>
				We implement reasonable technical and organizational measures to protect
				personal data. However, no system is completely secure — we cannot
				guarantee absolute security.
			</p>

			<h2>9. Children</h2>
			<p>
				Weekview is not intended for children under 13. We do not knowingly
				collect personal information from children under 13. If we learn we have
				collected such data, we will take steps to remove it.
			</p>

			<h2>10. Your rights and choices</h2>
			<ul>
				<li>
					You can update or delete your account, revoke OAuth access from the
					provider, and opt out of marketing emails.
				</li>
				<li>
					You can manage cookies in your browser; disabling some cookies may
					limit functionality.
				</li>
			</ul>

			<h2>11. Changes to this policy</h2>
			<p>
				We may update this policy periodically. We will post the updated policy
				with a new effective date. Significant changes will be communicated
				where feasible.
			</p>

			<h2>12. Contact</h2>
			<p>
				For questions, data requests or complaints, contact:{" "}
				<a href="mailto:amsyarasyiq@gmail.com">amsyarasyiq@gmail.com</a>
			</p>

			<hr />
			<p>
				Looking for our Terms? See the{" "}
				<Link to="/terms" className="underline">
					Terms of Service
				</Link>
				.
			</p>
		</div>
	);
}
