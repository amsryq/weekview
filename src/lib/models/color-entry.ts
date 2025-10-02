import { immerable } from "immer";
import { z } from "zod";
import { randomUUID } from "../utils/random";

const GradientDirectionMap: Record<GradientDirection, string> = {
	"to-r": "to right",
	"to-l": "to left",
	"to-t": "to top",
	"to-b": "to bottom",
	"to-tr": "to top right",
	"to-tl": "to top left",
	"to-br": "to bottom right",
	"to-bl": "to bottom left",
};

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

export const ColorDefSchema = z.discriminatedUnion("type", [
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

export type ColorDef = z.infer<typeof ColorDefSchema>;

export const ColorTypeSchema = z.enum(["solid", "gradient"]);
export type ColorType = z.infer<typeof ColorTypeSchema>;

export const ColorEntrySchema = z
	.object({
		predefined: z.boolean().optional(),
	})
	.and(ColorDefSchema);

export namespace ColorEntry {
	export type Schema = z.infer<typeof ColorEntrySchema>;
}

export class ColorEntry {
	[immerable] = true;
	public static schema = ColorEntrySchema;

	public id: string;
	public def: ColorDef;
	public predefined: boolean;
	public createdAt?: Date;

	constructor(data: {
		id: string;
		def: ColorDef;
		predefined: boolean;
		createdAt?: Date;
	}) {
		this.id = data.id;
		this.def = data.def;
		this.predefined = data.predefined;
		this.createdAt = data.createdAt;
	}

	public static createFromSchema(data: ColorEntry.Schema): ColorEntry {
		return new ColorEntry({
			id: randomUUID(),
			def:
				data.type === "solid"
					? {
							type: "solid",
							color: data.color,
						}
					: {
							type: "gradient",
							gradientColors: data.gradientColors!,
							gradientDirection: data.gradientDirection!,
						},
			predefined: data.predefined ?? false,
			createdAt: new Date(),
		});
	}

	/**
	 * Generates CSS background style from color entry
	 */
	public static getBackgroundStyle(
		color: ColorEntry | ColorEntry.Schema,
	): React.CSSProperties {
		const def = color instanceof ColorEntry ? color.def : color;

		if (def.type === "solid") {
			return {
				borderWidth: 1,
				borderStyle: "solid",
				borderColor: "rgba(255, 255, 255, 0.1)",
				backgroundColor: def.color,
			};
		}

		if (def.type === "gradient" && def.gradientColors?.length >= 2) {
			const direction = def.gradientDirection || "to-r";
			const colors = def.gradientColors.join(", ");
			return {
				background: `linear-gradient(${GradientDirectionMap[direction]}, ${colors})`,
			};
		}

		// Fallback to solid color if gradient is incomplete
		return { backgroundColor: def.gradientColors[0] || "#000000" };
	}

	public toSchema(): ColorEntry.Schema {
		return {
			...this.def,
			predefined: this.predefined,
		};
	}

	public getBackgroundStyle(): React.CSSProperties {
		return ColorEntry.getBackgroundStyle(this);
	}
}
