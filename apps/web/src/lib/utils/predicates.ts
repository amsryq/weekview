export type PropertyValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| bigint
	| symbol
	| PropertyValue[]
	| { [key: string]: PropertyValue };

export function isString(cause: unknown): cause is string {
	return Object.prototype.toString.call(cause) === "[object String]";
}

export function isNumber(cause: unknown): cause is number {
	return (
		Object.prototype.toString.call(cause) === "[object Number]" &&
		!Number.isNaN(cause)
	);
}

export function isBoolean(cause: unknown): cause is boolean {
	return Object.prototype.toString.call(cause) === "[object Boolean]";
}

export function isRecord(
	cause: unknown,
): cause is Record<string, PropertyValue> {
	return (
		cause !== null &&
		Object.prototype.toString.call(cause) === "[object Object]"
	);
}

export function isFunction(cause: unknown): cause is Function {
	return (
		Object.prototype.toString.call(cause) === "[object Function]" ||
		Object.prototype.toString.call(cause) === "[object AsyncFunction]"
	);
}
