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

import { UnknownRecord } from "type-fest";

function isObject(value: unknown): value is UnknownRecord {
	return (
		Boolean(value) && typeof value === "object" && value!.constructor === Object
	);
}

/**
 * Represents the structure of a detailed diff result
 */
export interface DetailedDiffResult<T = Record<string, unknown>> {
	added: Partial<T>;
	deleted: Partial<T>;
	updated: Partial<T>;
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
export function detailedDiff<T extends UnknownRecord>(
	original: T,
	updated: T,
): DetailedDiffResult<T> {
	const result: DetailedDiffResult<T> = {
		added: {} as Partial<T>,
		deleted: {} as Partial<T>,
		updated: {} as Partial<T>,
	};

	// Handle edge cases
	if (!isObject(original) || !isObject(updated)) {
		if (original !== updated) {
			result.updated = updated as Partial<T>;
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
			(result.added as UnknownRecord)[key] = (updated as UnknownRecord)[key];
		} else if (!updatedKeys.has(key)) {
			// Deleted key - goes to deleted
			(result.deleted as UnknownRecord)[key] = undefined;
		} else {
			// Key exists in both - check for differences
			const originalValue = (original as UnknownRecord)[key];
			const updatedValue = (updated as UnknownRecord)[key];

			if (originalValue !== updatedValue) {
				// Values are different - need to analyze the difference
				const diffResult = analyzeValueDifference(originalValue, updatedValue);

				if (diffResult.added && Object.keys(diffResult.added).length > 0) {
					(result.added as UnknownRecord)[key] = diffResult.added;
				}

				if (diffResult.updated && Object.keys(diffResult.updated).length > 0) {
					(result.updated as UnknownRecord)[key] = diffResult.updated;
				}

				if (diffResult.deleted && Object.keys(diffResult.deleted).length > 0) {
					(result.deleted as UnknownRecord)[key] = diffResult.deleted;
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
	original: unknown,
	updated: unknown,
): DetailedDiffResult<UnknownRecord> {
	const result: DetailedDiffResult<UnknownRecord> = {
		added: {},
		updated: {},
		deleted: {},
	};

	// If types are different, it's an update
	if (typeof original !== typeof updated) {
		return { added: {}, updated: updated as UnknownRecord, deleted: {} };
	}

	// Handle primitive values first (strings, numbers, booleans)
	if (
		typeof original === "string" ||
		typeof original === "number" ||
		typeof original === "boolean"
	) {
		if (original !== updated) {
			return { added: {}, updated: updated as UnknownRecord, deleted: {} };
		}
		return result; // No difference
	}

	// Handle arrays (but not strings, which are array-like)
	if (Array.isArray(original) && Array.isArray(updated)) {
		const arrayDiff = analyzeArrayDifference(original, updated);
		return arrayDiff;
	}

	// Handle objects (but not arrays or strings)
	if (
		isObject(original) &&
		isObject(updated) &&
		!Array.isArray(original) &&
		!Array.isArray(updated) &&
		typeof original !== "string" &&
		typeof updated !== "string"
	) {
		const originalObj = original as UnknownRecord;
		const updatedObj = updated as UnknownRecord;
		const originalKeys = new Set(Object.keys(originalObj));
		const updatedKeys = new Set(Object.keys(updatedObj));
		const allKeys = new Set([...originalKeys, ...updatedKeys]);

		for (const key of allKeys) {
			if (!originalKeys.has(key)) {
				// New property - goes to added
				result.added[key] = updatedObj[key];
			} else if (!updatedKeys.has(key)) {
				// Deleted property
				result.deleted[key] = undefined;
			} else {
				// Property exists in both
				const originalProp = originalObj[key];
				const updatedProp = updatedObj[key];

				if (originalProp !== updatedProp) {
					const propDiff = analyzeValueDifference(originalProp, updatedProp);

					if (propDiff.added && Object.keys(propDiff.added).length > 0) {
						if (!result.added[key]) result.added[key] = {};
						Object.assign(result.added[key] as UnknownRecord, propDiff.added);
					}

					if (
						propDiff.updated &&
						(typeof propDiff.updated === "object"
							? Object.keys(propDiff.updated).length > 0
							: propDiff.updated !== undefined)
					) {
						if (
							typeof propDiff.updated === "object" &&
							propDiff.updated !== null
						) {
							if (!result.updated[key]) result.updated[key] = {};
							Object.assign(
								result.updated[key] as UnknownRecord,
								propDiff.updated,
							);
						} else {
							// Handle primitive values directly
							result.updated[key] = propDiff.updated;
						}
					}

					if (propDiff.deleted && Object.keys(propDiff.deleted).length > 0) {
						if (!result.deleted[key]) result.deleted[key] = {};
						Object.assign(
							result.deleted[key] as UnknownRecord,
							propDiff.deleted,
						);
					}

					// If it's a simple value change (or all diff categories are empty), put it in updated
					// BUT only if there are actual differences (not just reference differences)
					if (
						(!propDiff.added || Object.keys(propDiff.added).length === 0) &&
						(!propDiff.deleted || Object.keys(propDiff.deleted).length === 0) &&
						(!propDiff.updated || Object.keys(propDiff.updated).length === 0)
					) {
						// Only add to updated if the values are actually different (deep comparison)
						if (JSON.stringify(originalProp) !== JSON.stringify(updatedProp)) {
							result.updated[key] = updatedProp;
						}
					}
				}
			}
		}

		return result;
	}

	// For primitive values (including strings) that are different
	return { added: {}, updated: updated as UnknownRecord, deleted: {} };
}

/**
 * Analyze array differences
 * @param original - Original array
 * @param updated - Updated array
 * @returns Categorized differences
 */
function analyzeArrayDifference(
	original: unknown[],
	updated: unknown[],
): DetailedDiffResult<UnknownRecord> {
	const result: DetailedDiffResult<UnknownRecord> = {
		added: {},
		updated: {},
		deleted: {},
	};

	const maxLength = Math.max(original.length, updated.length);

	for (let i = 0; i < maxLength; i++) {
		if (i >= original.length) {
			// New element
			result.added[i] = updated[i];
		} else if (i >= updated.length) {
			// Deleted element
			result.deleted[i] = undefined;
		} else if (original[i] !== updated[i]) {
			// Changed element
			if (
				isObject(original[i]) &&
				isObject(updated[i]) &&
				!Array.isArray(original[i]) &&
				!Array.isArray(updated[i]) &&
				typeof original[i] !== "string" &&
				typeof updated[i] !== "string"
			) {
				const elemDiff = analyzeValueDifference(original[i], updated[i]);

				if (elemDiff.added && Object.keys(elemDiff.added).length > 0) {
					result.added[i] = elemDiff.added;
				}

				if (elemDiff.updated && Object.keys(elemDiff.updated).length > 0) {
					result.updated[i] = elemDiff.updated;
				}

				if (elemDiff.deleted && Object.keys(elemDiff.deleted).length > 0) {
					result.deleted[i] = elemDiff.deleted;
				}
			} else {
				// Simple value change in array (including strings, numbers, etc.)
				result.updated[i] = updated[i];
			}
		}
	}

	// If only additions/updates, return as added (to match deep-object-diff behavior)
	if (
		Object.keys(result.updated).length === 0 &&
		Object.keys(result.deleted).length === 0
	) {
		return { added: { ...result.added }, updated: {}, deleted: {} };
	}

	return result;
}

/**
 * Optimized implementation of individual diff functions
 * These maintain compatibility with deep-object-diff API
 */

export function diff<T extends UnknownRecord>(
	original: T,
	updated: T,
): Partial<T> {
	const detailed = detailedDiff(original, updated);

	// Deep merge all changes into a single object
	const result: Partial<T> = {};

	// Helper function to deep merge objects
	function deepMerge<U extends UnknownRecord>(
		target: Partial<U>,
		source: Partial<U>,
	): Partial<U> {
		for (const [key, value] of Object.entries(source)) {
			if (isObject(value) && isObject((target as UnknownRecord)[key])) {
				// Both are objects, merge recursively
				(target as UnknownRecord)[key] = deepMerge(
					(target as UnknownRecord)[key] as UnknownRecord,
					value as UnknownRecord,
				);
			} else {
				// Either not both objects, or target doesn't have this key
				(target as UnknownRecord)[key] = value;
			}
		}
		return target;
	}

	// Deep merge added, updated, and deleted properties
	deepMerge(result, detailed.added);
	deepMerge(result, detailed.updated);
	deepMerge(result, detailed.deleted);

	return result;
}

export function addedDiff<T extends UnknownRecord>(
	original: T,
	updated: T,
): Partial<T> {
	const detailed = detailedDiff(original, updated);
	return detailed.added;
}

export function deletedDiff<T extends UnknownRecord>(
	original: T,
	updated: T,
): Partial<T> {
	const detailed = detailedDiff(original, updated);
	return detailed.deleted;
}

export function updatedDiff<T extends UnknownRecord>(
	original: T,
	updated: T,
): Partial<T> {
	const detailed = detailedDiff(original, updated);
	return detailed.updated;
}
