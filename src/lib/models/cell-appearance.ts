import { z } from "zod";

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

export const BackgroundTypeSchema = z.enum(["solid", "gradient"]);
export type BackgroundType = z.infer<typeof BackgroundTypeSchema>;

export const GradientDirectionSchema = z.enum([
	"to-r", // right
	"to-l", // left
	"to-t", // top
	"to-b", // bottom
	"to-tr", // top-right
	"to-tl", // top-left
	"to-br", // bottom-right
	"to-bl", // bottom-left
]);
export type GradientDirection = z.infer<typeof GradientDirectionSchema>;

export const BackgroundAppearanceSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("solid"),
		color: z.string(),
	}),
	z.object({
		type: z.literal("gradient"),
		gradientColors: z.array(z.string()),
		gradientDirection: GradientDirectionSchema,
	}),
]);

export type BackgroundAppearance = z.infer<typeof BackgroundAppearanceSchema>;

export const CellAppearanceSchema = z.object({
	background: BackgroundAppearanceSchema,
	fgColor: z.string(),
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
