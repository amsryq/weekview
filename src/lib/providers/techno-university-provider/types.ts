import type { ComponentProps } from "react";
import type { Combobox } from "~/components/ui/shadcn-io/combobox";

export type ComboboxData = ComponentProps<typeof Combobox>["data"][number];

export type Campus = {
	id: string;
	name: string;
	requiresFaculty: boolean;
};

export type Faculty = {
	id: string;
	name: string;
};
