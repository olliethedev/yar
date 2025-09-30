// biome-ignore-all lint/suspicious/noExplicitAny: complex types
import type { ComponentType } from "react";
import { addRoute, createRouter as createRou3Router, findRoute } from "rou3";
import type { StandardSchemaV1 } from "./standard-schema";
import type {
	HasRequiredKeys,
	InferParam,
	InferQuery,
	InputContext,
	Route,
	RouteOptions,
	RouterConfig,
} from "./types";

type HandlerReturn<ComponentProps, LoaderData> = {
	Component: ComponentType<ComponentProps>;
	loader?: () => LoaderData | Promise<LoaderData>;
	meta?: (
		data?: LoaderData,
	) => Array<React.JSX.IntrinsicElements["meta"] | undefined>;
};

/**
 * Creates a route definition with type-safe path parameters and query validation.
 *
 * @template Path - The route path string, which may include dynamic segments (e.g., "/users/:id")
 * @template Options - Route options including query parameter validation schema
 * @template LoaderData - The type of data returned by the optional loader function
 * @template ComponentProps - The props type for the React component
 *
 * @param {Path} path - The route path pattern with optional dynamic segments
 * @param {Function} handler - Handler function that receives route context (params, query) and returns component, loader, and meta configuration
 * @param {Options} [options] - Optional configuration including query parameter validation schema
 *
 * @returns {Function} A route handler function with path and options attached
 *
 * @example
 * ```ts
 * const userRoute = createRoute(
 *   "/user/:id",
 *   ({ params, query }) => ({
 *     Component: UserPage,
 *     loader: () => fetchUser(params.id),
 *     meta: (data) => [{ name: "title", content: `User ${data.name}` }]
 *   }),
 *   { query: z.object({ tab: z.string().optional() }) }
 * );
 * ```
 */
export function createRoute<
	Path extends string,
	Options extends RouteOptions,
	LoaderData,
	ComponentProps,
>(
	path: Path,
	handler: (context: {
		params: InferParam<Path>;
		query: InferQuery<Options> | undefined;
	}) => HandlerReturn<ComponentProps, LoaderData>,
	options?: Options,
) {
	type Context = InputContext<Path, Options>;
	const internalHandler = async (
		...inputCtx: HasRequiredKeys<Context> extends true ? [Context] : [Context?]
	) => {
		const context = (inputCtx[0] || {}) as InputContext<any, any>;
		const internalContext = await createInternalContext(context, {
			options,
			path,
		});
		const response = await handler(internalContext as any);

		return response;
	};
	internalHandler.options = options;
	internalHandler.path = path;
	return internalHandler;
}

/**
 * Creates a router instance from a collection of routes.
 *
 * @template E - A record type mapping route names to route handlers
 * @template Config - Router configuration type that may include a router context
 *
 * @param {E} routes - An object mapping route names to route handlers created with `createRoute`
 * @param {Config} [config] - Optional router configuration including shared context accessible to all routes
 *
 * @returns {Object} Router object with the following properties:
 *   - `routes`: The original routes object passed in
 *   - `getRoute`: Async function to match a path and return the corresponding route with component, params, loader, and meta
 *
 * @example
 * ```ts
 * const router = createRouter({
 *   home: createRoute("/", () => ({ Component: HomePage })),
 *   user: createRoute("/user/:id", ({ params }) => ({
 *     Component: UserPage,
 *     loader: () => fetchUser(params.id)
 *   }))
 * });
 *
 * // Later, match a route:
 * const route = await router.getRoute("/user/123");
 * if (route) {
 *   const data = await route.loader?.();
 *   // render route.Component with data
 * }
 * ```
 */
export const createRouter = <
	E extends Record<string, Route>,
	Config extends RouterConfig,
>(
	routes: E,
	config?: Config,
) => {
	const internalRouter = createRou3Router<Route>();

	for (const endpoint of Object.values(routes)) {
		addRoute(internalRouter, "GET", endpoint.path, endpoint);
	}

	return {
		routes: routes,

		getRoute: async (
			path: string,
			queryParams: Record<string, string | string[]> = {},
		) => {
			const route = findRoute(internalRouter, "GET", path);
			if (!route?.data) {
				return null;
			}
			const handler = route.data;
			const params = (route.params ?? {}) as Record<string, string>;
			const context = {
				path,
				method: "GET",
				params,
				query: queryParams,
				context: config?.routerContext || {},
			};
			const responseObj = await handler(context);
			const { Component, loader, meta } = responseObj;

			return {
				Component,
				params,
				loader,
				meta,
			};
		},
	};
};

const createInternalContext = async (
	context: InputContext<any, any>,
	{
		options,
		path,
	}: {
		options: RouteOptions | undefined;
		path: string;
	},
) => {
	let data: {
		query: any;
	} | null = null;

	let error: {
		message: string;
	} | null = null;

	if (options) {
		const { data: validationData, error: validationError } =
			await runValidation(options, context);
		data = validationData;
		error = validationError;
	}

	const internalContext = {
		...context,
		query: data?.query ?? undefined,
		queryError: error,
		path: context.path || path,
		context: "context" in context && context.context ? context.context : {},
		params: "params" in context ? context.params : undefined,
		method: "GET",
	};

	return internalContext;
};

type ValidationResponse =
	| {
			data: {
				query: any;
			};
			error: null;
	  }
	| {
			data: null;
			error: {
				message: string;
			};
	  };

async function runValidation(
	options: RouteOptions,
	context: InputContext<any, any> = {},
): Promise<ValidationResponse> {
	const request = {
		query: context.query,
	} as {
		query: any;
	};

	if (options.query) {
		const result = await options.query["~standard"].validate(context.query);
		if (result.issues) {
			return {
				data: null,
				error: fromError(result.issues, "query"),
			};
		}
		request.query = result.value;
	}

	return {
		data: request,
		error: null,
	};
}

function fromError(
	error: readonly StandardSchemaV1.Issue[],
	validating: string,
) {
	const errorMessages: string[] = [];

	for (const issue of error) {
		const message = issue.message;
		errorMessages.push(message);
	}
	return {
		message: `Invalid ${validating} parameters`,
	};
}
