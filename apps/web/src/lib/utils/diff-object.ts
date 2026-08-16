/**
 * Original source: https://github.com/adobe/spectrum-tokens/blob/22c2b593cc8295fdb63d91320c8fed1e83b3a8f1/tools/optimized-diff/src/engine.js
 *
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { isBoolean, isNumber, isString } from "./predicates";

export type DiffValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| bigint
	| symbol
	| DiffValue[]
	| { [key: string]: DiffValue };

export type DiffObject = Record<string, DiffValue>;

function isPlainObject(cause: unknown): cause is DiffObject {
	return Object.prototype.toString.call(cause) === "[object Object]";
}

/**
 * Represents the structure of a detailed diff result
 */
export interface DetailedDiffResult<T = DiffValue> {
	added: Partial<T> | DiffValue;
	deleted: Partial<T> | DiffValue;
	updated: Partial<T> | DiffValue;
}

/**
 * High-performance deep object diff algorithm
 *
 * This implementation provides significant performance improvements over generic
 * diff libraries by:
 *
 * 1. Using Set-based lookups for O(1) key comparisons
 * 2. Early reference checking before deep comparison
 * 3. Optimized deep comparison logic for nested structures
 * 4. Efficient handling of common JavaScript data types
 *
 * @param original - The original object
 * @param updated - The updated object
 * @returns Diff result with { added, deleted, updated } structure
 */
export function detailedDiff<T extends DiffObject>(
	original: T,
	updated: T,
): DetailedDiffResult<T> {
	const result: DetailedDiffResult<T> = {
		added: {},
		deleted: {},
		updated: {},
	};

	// Handle edge cases
	if (!isPlainObject(original) || !isPlainObject(updated)) {
		if (original !== updated) {
			result.updated = updated;
		}
		return result;
	}

	// Get all unique keys efficiently
	const originalKeys = new Set(Object.keys(original));
	const updatedKeys = new Set(Object.keys(updated));
	const allKeys = new Set([...originalKeys, ...updatedKeys]);

	for (const key of allKeys) {
		if (!originalKeys.has(key)) {
			// Completely new key - goes to added
			// SAFETY: Dynamic key indexing for diff record
			(result.added as DiffObject)[key] = updated[key];
		} else if (!updatedKeys.has(key)) {
			// Deleted key - goes to deleted
			// SAFETY: Dynamic key indexing for diff record
			(result.deleted as DiffObject)[key] = undefined;
		} else {
			// Key exists in both - check for differences
			const originalValue = original[key];
			const updatedValue = updated[key];

			if (originalValue !== updatedValue) {
				// Values are different - need to analyze the difference
				const diffResult = analyzeValueDifference(originalValue, updatedValue);

				if (
					diffResult.added &&
					isPlainObject(diffResult.added) &&
					Object.keys(diffResult.added).length > 0
				) {
					// SAFETY: Dynamic key indexing for diff record
					(result.added as DiffObject)[key] = diffResult.added;
				}

				if (
					diffResult.updated &&
					isPlainObject(diffResult.updated) &&
					Object.keys(diffResult.updated).length > 0
				) {
					// SAFETY: Dynamic key indexing for diff record
					(result.updated as DiffObject)[key] = diffResult.updated;
				}

				if (
					diffResult.deleted &&
					isPlainObject(diffResult.deleted) &&
					Object.keys(diffResult.deleted).length > 0
				) {
					// SAFETY: Dynamic key indexing for diff record
					(result.deleted as DiffObject)[key] = diffResult.deleted;
				}
			}
		}
	}

	return result;
}

/**
 * Analyze the difference between two values and categorize changes
 * @param original - Original value
 * @param updated - Updated value
 * @returns Object with added, updated, deleted categorizations
 */
function analyzeValueDifference(
	original: DiffValue,
	updated: DiffValue,
): DetailedDiffResult<DiffValue> {
	const result: DetailedDiffResult<DiffValue> = {
		added: {},
		updated: {},
		deleted: {},
	};

	// Handle primitive values first (strings, numbers, booleans)
	if (
		(isString(original) && isString(updated)) ||
		(isNumber(original) && isNumber(updated)) ||
		(isBoolean(original) && isBoolean(updated))
	) {
		if (original !== updated) {
			return {
				added: {},
				updated,
				deleted: {},
			};
		}
		return result; // No difference
	}

	// Handle arrays (but not strings, which are array-like)
	if (Array.isArray(original) && Array.isArray(updated)) {
		return analyzeArrayDifference(original, updated);
	}

	// Handle objects (but not arrays or strings)
	if (isPlainObject(original) && isPlainObject(updated)) {
		const originalObj = original;
		const updatedObj = updated;
		const originalKeys = new Set(Object.keys(originalObj));
		const updatedKeys = new Set(Object.keys(updatedObj));
		const allKeys = new Set([...originalKeys, ...updatedKeys]);

		for (const key of allKeys) {
			if (!originalKeys.has(key)) {
				// New property - goes to added
				// SAFETY: Dynamic property assignment
				(result.added as DiffObject)[key] = updatedObj[key];
			} else if (!updatedKeys.has(key)) {
				// Deleted property
				// SAFETY: Dynamic property assignment
				(result.deleted as DiffObject)[key] = undefined;
			} else {
				// Property exists in both
				const originalProp = originalObj[key];
				const updatedProp = updatedObj[key];

				if (originalProp !== updatedProp) {
					const propDiff = analyzeValueDifference(originalProp, updatedProp);

					if (
						propDiff.added &&
						isPlainObject(propDiff.added) &&
						Object.keys(propDiff.added).length > 0
					) {
						if (!isPlainObject(result.added)) result.added = {};
						Object.assign(result.added, propDiff.added);
					}

					if (
						propDiff.updated &&
						(isPlainObject(propDiff.updated)
							? Object.keys(propDiff.updated).length > 0
							: propDiff.updated !== undefined)
					) {
						if (isPlainObject(propDiff.updated)) {
							if (!isPlainObject(result.updated)) result.updated = {};
							Object.assign(result.updated, propDiff.updated);
						} else {
							// SAFETY: Property indexing
							(result.updated as DiffObject)[key] = propDiff.updated;
						}
					}

					if (
						propDiff.deleted &&
						isPlainObject(propDiff.deleted) &&
						Object.keys(propDiff.deleted).length > 0
					) {
						if (!isPlainObject(result.deleted)) result.deleted = {};
						Object.assign(result.deleted, propDiff.deleted);
					}

					if (
						(!propDiff.added ||
							(isPlainObject(propDiff.added) &&
								Object.keys(propDiff.added).length === 0)) &&
						(!propDiff.deleted ||
							(isPlainObject(propDiff.deleted) &&
								Object.keys(propDiff.deleted).length === 0)) &&
						(!propDiff.updated ||
							(isPlainObject(propDiff.updated) &&
								Object.keys(propDiff.updated).length === 0))
					) {
						if (JSON.stringify(originalProp) !== JSON.stringify(updatedProp)) {
							// SAFETY: Property indexing
							(result.updated as DiffObject)[key] = updatedProp;
						}
					}
				}
			}
		}

		return result;
	}

	// For different types or other values that are different
	return {
		added: {},
		updated,
		deleted: {},
	};
}

/**
 * Analyze array differences
 * @param original - Original array
 * @param updated - Updated array
 * @returns Categorized differences
 */
function analyzeArrayDifference(
	original: DiffValue[],
	updated: DiffValue[],
): DetailedDiffResult<DiffValue> {
	const result: DetailedDiffResult<DiffValue> = {
		added: {},
		updated: {},
		deleted: {},
	};

	const maxLength = Math.max(original.length, updated.length);

	for (let i = 0; i < maxLength; i++) {
		const key = String(i);
		if (i >= original.length) {
			// New element
			// SAFETY: Dynamic key assignment
			(result.added as DiffObject)[key] = updated[i];
		} else if (i >= updated.length) {
			// Deleted element
			// SAFETY: Dynamic key assignment
			(result.deleted as DiffObject)[key] = undefined;
		} else if (original[i] !== updated[i]) {
			// Changed element
			const origElem = original[i];
			const updElem = updated[i];
			if (isPlainObject(origElem) && isPlainObject(updElem)) {
				const elemDiff = analyzeValueDifference(origElem, updElem);

				if (
					elemDiff.added &&
					isPlainObject(elemDiff.added) &&
					Object.keys(elemDiff.added).length > 0
				) {
					// SAFETY: Dynamic key assignment
					(result.added as DiffObject)[key] = elemDiff.added;
				}

				if (
					elemDiff.updated &&
					isPlainObject(elemDiff.updated) &&
					Object.keys(elemDiff.updated).length > 0
				) {
					// SAFETY: Dynamic key assignment
					(result.updated as DiffObject)[key] = elemDiff.updated;
				}

				if (
					elemDiff.deleted &&
					isPlainObject(elemDiff.deleted) &&
					Object.keys(elemDiff.deleted).length > 0
				) {
					// SAFETY: Dynamic key assignment
					(result.deleted as DiffObject)[key] = elemDiff.deleted;
				}
			} else {
				// Simple value change in array
				// SAFETY: Dynamic key assignment
				(result.updated as DiffObject)[key] = updElem;
			}
		}
	}

	if (
		isPlainObject(result.updated) &&
		Object.keys(result.updated).length === 0 &&
		isPlainObject(result.deleted) &&
		Object.keys(result.deleted).length === 0 &&
		isPlainObject(result.added)
	) {
		return { added: { ...result.added }, updated: {}, deleted: {} };
	}

	return result;
}

/**
 * Optimized implementation of individual diff functions
 * These maintain compatibility with deep-object-diff API
 */

export function diff<T extends DiffObject>(
	original: T,
	updated: T,
): Partial<T> {
	const detailed = detailedDiff(original, updated);

	const result: Partial<T> = {};

	function deepMerge<U extends DiffObject>(
		target: Partial<U>,
		source: Partial<U> | DiffValue,
	): Partial<U> {
		if (!isPlainObject(source)) return target;
		for (const [key, value] of Object.entries(source)) {
			// SAFETY: Index access for dynamic target
			const targetVal = (target as DiffObject)[key];
			if (isPlainObject(value) && isPlainObject(targetVal)) {
				// SAFETY: Nested merge of plain objects
				(target as DiffObject)[key] = deepMerge(targetVal, value);
			} else {
				// SAFETY: Dynamic property assignment
				(target as DiffObject)[key] = value;
			}
		}
		return target;
	}

	deepMerge(result, detailed.added);
	deepMerge(result, detailed.updated);
	deepMerge(result, detailed.deleted);

	return result;
}

export function addedDiff<T extends DiffObject>(
	original: T,
	updated: T,
): Partial<T> {
	const detailed = detailedDiff(original, updated);
	// SAFETY: DiffResult added mapping matches Partial<T>
	return detailed.added as Partial<T>;
}

export function deletedDiff<T extends DiffObject>(
	original: T,
	updated: T,
): Partial<T> {
	const detailed = detailedDiff(original, updated);
	// SAFETY: DiffResult deleted mapping matches Partial<T>
	return detailed.deleted as Partial<T>;
}

export function updatedDiff<T extends DiffObject>(
	original: T,
	updated: T,
): Partial<T> {
	const detailed = detailedDiff(original, updated);
	// SAFETY: DiffResult updated mapping matches Partial<T>
	return detailed.updated as Partial<T>;
}
