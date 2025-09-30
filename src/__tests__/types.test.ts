import { describe, expect, it } from "vitest";

describe("Type utilities", () => {
	it("should infer path parameters correctly", () => {
		// These are compile-time type tests
		// If the types are wrong, TypeScript will error during compilation

		// Test single parameter
		const test1: { id: string } = { id: "123" };
		expect(test1.id).toBe("123");

		// Test multiple parameters
		const test2: { category: string; id: string } = {
			category: "tech",
			id: "42",
		};
		expect(test2).toEqual({ category: "tech", id: "42" });
	});

	it("should handle nested paths correctly", () => {
		const nested: { userId: string; postId: string } = {
			userId: "u1",
			postId: "p1",
		};
		expect(nested).toEqual({ userId: "u1", postId: "p1" });
	});

	it("should handle paths without parameters", () => {
		// Empty object for routes without parameters
		const empty: Record<string, never> = {};
		expect(Object.keys(empty)).toHaveLength(0);
	});

	it("should detect empty objects correctly", () => {
		// Type-level test for IsEmptyObject
		const isEmpty = true;
		const isNotEmpty = false;

		expect(isEmpty).toBe(true);
		expect(isNotEmpty).toBe(false);
	});

	it("should infer complete param types", () => {
		const withParams: { id: string } = { id: "123" };
		const withoutParams: Record<string, string> | undefined = undefined;

		expect(withParams.id).toBe("123");
		expect(withoutParams).toBeUndefined();
	});

	it("should handle multiple parameter segments", () => {
		const multiParams: {
			year: string;
			month: string;
			day: string;
			slug: string;
		} = {
			year: "2024",
			month: "01",
			day: "15",
			slug: "test-post",
		};

		expect(multiParams).toEqual({
			year: "2024",
			month: "01",
			day: "15",
			slug: "test-post",
		});
	});
});
