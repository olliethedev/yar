// biome-ignore-all lint/suspicious/noExplicitAny: complex types
import type { StandardSchemaV1 } from "../standard-schema";

/**
 * Creates a mock Standard Schema for testing purposes
 */
export function createMockSchema<Input, Output = Input>(
	validateFn: (
		value: unknown,
	) =>
		| StandardSchemaV1.Result<Output>
		| Promise<StandardSchemaV1.Result<Output>>,
): StandardSchemaV1<Input, Output> {
	return {
		"~standard": {
			version: 1,
			vendor: "mock",
			validate: validateFn,
			types: undefined as any,
		},
	};
}

/**
 * Creates a simple validation schema that always succeeds
 */
export function createPassingSchema<T>(): StandardSchemaV1<T, T> {
	return createMockSchema<T, T>((value) => ({
		value: value as T,
		issues: undefined,
	}));
}

/**
 * Creates a simple validation schema that always fails
 */
export function createFailingSchema(
	message = "Validation failed",
): StandardSchemaV1<unknown, unknown> {
	return createMockSchema((_value) => ({
		issues: [{ message }],
	}));
}

/**
 * Creates a schema that validates an object with specific fields
 */
export function createObjectSchema<T extends Record<string, unknown>>(
	fields: Record<keyof T, (value: unknown) => boolean>,
): StandardSchemaV1<T, T> {
	return createMockSchema<T, T>((value) => {
		if (typeof value !== "object" || value === null) {
			return {
				issues: [{ message: "Expected an object" }],
			};
		}

		const issues: StandardSchemaV1.Issue[] = [];
		const result: Record<string, unknown> = {};

		for (const [key, validator] of Object.entries(fields)) {
			const fieldValue = (value as Record<string, unknown>)[key];
			if (!validator(fieldValue)) {
				issues.push({ message: `Invalid value for field ${key}` });
			} else {
				result[key] = fieldValue;
			}
		}

		if (issues.length > 0) {
			return { issues };
		}

		return { value: result as T, issues: undefined };
	});
}
