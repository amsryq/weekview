import { z } from "zod";
import { ColorEntry } from "./color-entry";

export const CellMaterialSchema = z.enum(["basic", "glass"]);
export type CellMaterial = z.infer<typeof CellMaterialSchema>;

export const CellElementsSchema = z.enum(["time", "location", "code", "name"]);
export type CellElements = z.infer<typeof CellElementsSchema>;

export const TextAlignSchema = z.enum(["left", "center", "right"]);
export type TextAlign = z.infer<typeof TextAlignSchema>;

export const FontWeightSchema = z.enum(["light", "normal", "bold"]);
export type FontWeight = z.infer<typeof FontWeightSchema>;

export const IconTypeSchema = z.enum(["emoji", "svg"]);
export type IconType = z.infer<typeof IconTypeSchema>;

export const IconAppearanceSchema = z.object({
	type: IconTypeSchema,
	emoji: z.string().optional(),
	svg: z.string().optional(),
	opacity: z.number().min(0).max(1),
	rotation: z.number().min(-180).max(180),
	offsetX: z.number().min(0).max(50),
	offsetY: z.number().min(0).max(50),
	size: z.number().min(1).max(5),
});

export type IconAppearance = z.infer<typeof IconAppearanceSchema>;

export const CellAppearanceSchema = z.object({
	background: ColorEntry.schema.optional(),
	fgColor: z.string().optional(),
	fontFamily: z.string().optional(),
	material: CellMaterialSchema.optional(),
	borderRadius: z.number().optional(),
	autoSizeFont: z.boolean().optional(),
	visibility: z
		.partialRecord(CellElementsSchema, z.boolean().optional())
		.optional(),
	fontSize: z
		.partialRecord(CellElementsSchema, z.number().optional())
		.optional(),
	weight: z
		.partialRecord(CellElementsSchema, FontWeightSchema.optional())
		.optional(),
	textAlign: TextAlignSchema.optional(),
	icon: IconAppearanceSchema.optional(),
});

export type CellAppearance = z.infer<typeof CellAppearanceSchema>;
