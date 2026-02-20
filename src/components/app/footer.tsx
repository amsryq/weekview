import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "~/components/ui/hover-card";

export function Footer() {
	const [openCard, setOpenCard] = useState(false);

	return (
		<footer className="flex font-mono justify-center gap-4 p-4 text-sm text-center">
			<p>
				© {import.meta.env.COPYRIGHT_YEAR}
				<HoverCard openDelay={50} open={openCard} onOpenChange={setOpenCard}>
					<HoverCardTrigger
						onClick={() => setOpenCard(true)}
						className="underline inline-block ml-2"
					>
						amsryq
					</HoverCardTrigger>
					<HoverCardContent className="w-80">
						<div className="flex justify-between gap-4">
							<Avatar>
								<AvatarImage src="https://avatars.githubusercontent.com/u/82711525?v=4" />
								<AvatarFallback>AR</AvatarFallback>
							</Avatar>
							<div className="space-y-1">
								<h4 className="text-sm font-semibold">amsryq</h4>
								<p className="text-sm">
									Hi! I'm the developer behind Weekview, and I'm currently
									pursuing a Diploma in Computer Science at UiTM Jasin.
								</p>
								<div className="flex pt-2 gap-3 text-xs font-semibold text-muted-foreground">
									<a href="https://github.com/amsryq">GitHub</a>
									<a href="https://x.com/amsryq">X</a>
								</div>
							</div>
						</div>
					</HoverCardContent>
				</HoverCard>
			</p>
			<span className="hidden md:inline">|</span>
			<nav className="flex gap-4">
				<Link to="/privacy" className="underline">
					Privacy Policy
				</Link>
				<span className="hidden md:inline">-</span>
				<Link to="/terms" className="underline">
					Terms of Service
				</Link>
			</nav>
		</footer>
	);
}
