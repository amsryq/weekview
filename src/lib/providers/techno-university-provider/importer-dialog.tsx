import type { JSX } from "react";
import { Button } from "~/components/ui/button";
import {
	DialogStack,
	DialogStackBody,
	DialogStackContent,
	DialogStackDescription,
	DialogStackFooter,
	DialogStackHeader,
	DialogStackNext,
	DialogStackOverlay,
	DialogStackPrevious,
	DialogStackTitle,
	DialogStackTrigger,
} from "~/components/ui/shadcn-io/dialog-stack";

export default function TechnoUniversityImporterDialog({
	children,
}: {
	children: JSX.Element;
}) {
	return (
		<DialogStack>
			<DialogStackTrigger asChild>{children}</DialogStackTrigger>
			<DialogStackOverlay />
			<DialogStackBody>
				<DialogStackContent>
					<DialogStackHeader>
						<DialogStackTitle>I'm the first dialog</DialogStackTitle>
						<DialogStackDescription>
							With a fancy description
						</DialogStackDescription>
					</DialogStackHeader>
					<DialogStackFooter className="justify-end">
						<DialogStackNext asChild>
							<Button variant="outline">Next</Button>
						</DialogStackNext>
					</DialogStackFooter>
				</DialogStackContent>
				<DialogStackContent>
					<DialogStackHeader>
						<DialogStackTitle>I'm the second dialog</DialogStackTitle>
						<DialogStackDescription>
							With a fancy description
						</DialogStackDescription>
					</DialogStackHeader>
					<DialogStackFooter className="justify-between">
						<DialogStackPrevious asChild>
							<Button variant="outline">Previous</Button>
						</DialogStackPrevious>
						<DialogStackNext asChild>
							<Button variant="outline">Next</Button>
						</DialogStackNext>
					</DialogStackFooter>
				</DialogStackContent>
				<DialogStackContent>
					<DialogStackHeader>
						<DialogStackTitle>I'm the third dialog</DialogStackTitle>
						<DialogStackDescription>
							With a fancy description
						</DialogStackDescription>
					</DialogStackHeader>
					<DialogStackFooter className="justify-between">
						<DialogStackPrevious asChild>
							<Button variant="outline">Previous</Button>
						</DialogStackPrevious>
					</DialogStackFooter>
				</DialogStackContent>
			</DialogStackBody>
		</DialogStack>
	);
}
