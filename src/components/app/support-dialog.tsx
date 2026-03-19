import { LoaderCircle } from "lucide-react";
import { lazy, Suspense } from "react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { useSupportDialog } from "~/lib/contexts/support-dialog";

const SupportDialogContentLazy = lazy(() => import("./support-dialog-content"));

export function SupportDialog() {
	const { isOpen, config, closeSupportDialog } = useSupportDialog();

	return (
		<Dialog open={isOpen} onOpenChange={closeSupportDialog}>
			<DialogContent className="sm:max-w-2xl max-h-[80dvh]">
				<Suspense
					fallback={
						<div className="flex-1 flex items-center justify-center min-h-0 py-12">
							<LoaderCircle className="size-6 animate-spin text-muted-foreground" />
						</div>
					}
				>
					<SupportDialogContentLazy config={config} />
				</Suspense>
			</DialogContent>
		</Dialog>
	);
}
