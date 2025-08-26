import { z } from "zod";

export const CellElementsSchema = z.enum([
	"time",
	"location",
	"code",
	"name",
	"lecturer",
]);
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

export const CellAppearanceSchema = z
	.object({
		bgColor: z.string(),
		fgColor: z.string(),
		visibility: z.partialRecord(CellElementsSchema, z.boolean().optional()),
		fontSize: z.partialRecord(CellElementsSchema, z.number().optional()),
		weight: z.partialRecord(CellElementsSchema, FontWeightSchema.optional()),
		textAlign: TextAlignSchema,
		icon: IconAppearanceSchema.optional(),
	})
	.partial();

export type CellAppearance = z.infer<typeof CellAppearanceSchema>;
