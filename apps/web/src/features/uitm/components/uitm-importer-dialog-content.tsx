import { pick } from "es-toolkit";
import { AnimatePresence, animate, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { CourseSlipImportStep } from "./importer/components/course-slip-import-step";
import { GroupSelectorStep } from "./importer/components/group-selector-step";
import { MyStudentImportStep } from "./importer/components/my-student-import-step";
import { SourceSelectionStep } from "./importer/components/source-selection-step";
import { useImporterSelectionStore } from "./importer/utils/shared";

function AnimatedStepContainer({
	stepKey,
	children,
}: {
	stepKey: string;
	children: React.ReactNode;
}) {
	const outerRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const outer = outerRef.current;
		const inner = innerRef.current;
		if (!outer || !inner) return;

		const isDesktop = window.innerWidth >= 768;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { height, width } = entry.contentRect;
				animate(
					outer,
					{
						height,
						width: isDesktop ? width : "auto",
					},
					{ type: "spring", bounce: 0, duration: 0.4 },
				);
			}
		});

		observer.observe(inner);

		// Set initial size
		outer.style.height = `${inner.scrollHeight}px`;
		outer.style.width = isDesktop ? `${inner.scrollWidth}px` : "auto";

		return () => observer.disconnect();
	}, []);

	return (
		// Outer shell: animated sizing with scrolling enabled
		<div
			ref={outerRef}
			className="w-full md:w-fit max-w-full overflow-y-auto md:overflow-hidden min-h-0 flex-1 md:flex-none"
		>
			{/* Inner div: naturally sized by content, measured by ResizeObserver */}
			<div ref={innerRef} className="w-full md:w-fit md:min-w-120">
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={stepKey}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.18, ease: "easeInOut" }}
						className="flex flex-col"
					>
						{children}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}

export default function UiTMImporterDialogContent() {
	const { currentStep } = useImporterSelectionStore(
		useShallow((state) => pick(state, ["currentStep"])),
	);

	const renderStep = () => {
		switch (currentStep) {
			case "source":
				return <SourceSelectionStep />;
			case "group-selector":
				return <GroupSelectorStep />;
			case "course-slip":
				return <CourseSlipImportStep />;
			case "my-student":
				return <MyStudentImportStep />;
			default:
				return null;
		}
	};

	return (
		<AnimatedStepContainer stepKey={currentStep}>
			{renderStep()}
		</AnimatedStepContainer>
	);
}
