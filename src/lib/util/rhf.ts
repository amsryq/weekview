import { FieldValues } from "react-hook-form";
import { PartialObjectDeep } from "type-fest/source/partial-deep";

export type DirtyFieldsType =
	| boolean
	| null
	| {
			[key: string]: DirtyFieldsType;
	  }
	| DirtyFieldsType[];

export function getDirtyValues<T extends FieldValues>(
	dirtyFields: Partial<Record<keyof T, DirtyFieldsType>>,
	values: T,
): PartialObjectDeep<
	T,
	{ recurseIntoArrays: false; allowUndefinedInNonTupleArrays: true }
> {
	const dirtyValues = Object.keys(dirtyFields).reduce(
		(prev, key) => {
			const value = dirtyFields[key];
			if (!value) {
				return prev;
			}
			const isObject = typeof value === "object";
			const isArray = Array.isArray(value);
			const nestedValue =
				isObject && !isArray
					? getDirtyValues(value as FieldValues, values[key])
					: values[key];
			return { ...prev, [key]: isArray ? values[key] : nestedValue };
		},
		{} as PartialObjectDeep<
			T,
			{ recurseIntoArrays: false; allowUndefinedInNonTupleArrays: true }
		>,
	);

	return dirtyValues;
}
