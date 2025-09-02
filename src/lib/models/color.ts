import { z } from "zod";
import {
	type BackgroundAppearance,
	BackgroundAppearanceSchema,
} from "./cell-appearance";

export const ColorTypeSchema = z.enum(["solid", "gradient"]);
export type ColorType = z.infer<typeof ColorTypeSchema>;

export const ColorEntrySchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	background: BackgroundAppearanceSchema,
	isPredefined: z.boolean(),
	createdAt: z.date().optional(),
});

export namespace ColorEntry {
	export type Schema = z.infer<typeof ColorEntrySchema>;
}

export class ColorEntry {
	public static schema = ColorEntrySchema;

	public id: string;
	public name?: string;
	public background: BackgroundAppearance;
	public isPredefined: boolean;
	public createdAt?: Date;

	constructor(data: {
		id: string;
		name?: string;
		background: BackgroundAppearance;
		isPredefined: boolean;
		createdAt?: Date;
	}) {
		this.id = data.id;
		this.name = data.name;
		this.background = data.background;
		this.isPredefined = data.isPredefined;
		this.createdAt = data.createdAt;
	}

	public static createFromSchema(data: ColorEntry.Schema): ColorEntry {
		return new ColorEntry({
			id: data.id,
			name: data.name,
			background: data.background,
			isPredefined: data.isPredefined,
			createdAt: data.createdAt,
		});
	}

	public toSchema(): ColorEntry.Schema {
		return {
			id: this.id,
			name: this.name,
			background: this.background,
			isPredefined: this.isPredefined,
			createdAt: this.createdAt,
		};
	}
}
