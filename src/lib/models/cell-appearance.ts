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

export const CellAppearanceSchema = z
	.object({
		bgColor: z.string(),
		fgColor: z.string(),
		visibility: z.partialRecord(CellElementsSchema, z.boolean().optional()),
		fontSize: z.partialRecord(CellElementsSchema, z.number().optional()),
		weight: z.partialRecord(CellElementsSchema, FontWeightSchema.optional()),
		textAlign: TextAlignSchema,
	})
	.partial();

export type CellAppearance = z.infer<typeof CellAppearanceSchema>;
