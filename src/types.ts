import type { RouterContext } from "rou3";
import type { StandardSchemaV1 } from "./standard-schema";

export type RouterConfig = {
	routerContext?: RouterContext;
};

export interface RouteOptions {
	query?: StandardSchemaV1;
}

export type Route<
	Path extends string = string,
	Options extends RouteOptions = RouteOptions,
	Handler extends (inputCtx: any) => any = (inputCtx: any) => any,
> = Handler & {
	options?: Options;
	path: Path;
};

export type InputContext<
	Path extends string,
	Options extends RouteOptions,
> = InferQueryInput<Options> &
	InferParamInput<Path> & {
		path?: string;
	};

export type InferQueryInput<
	Options extends RouteOptions,
	Query = Options["query"] extends StandardSchemaV1
		? StandardSchemaV1.InferInput<Options["query"]>
		: Record<string, any> | undefined,
> = undefined extends Query
	? {
			query?: Query;
		}
	: {
			query: Query;
		};

export type InferParamInput<Path extends string> = IsEmptyObject<
	InferParamPath<Path> & InferParamWildCard<Path>
> extends true
	? {
			params?: Record<string, any>;
		}
	: {
			params: Prettify<InferParamPath<Path> & InferParamWildCard<Path>>;
		};

//type utils

export type InferParam<Path extends string> = IsEmptyObject<
	InferParamPath<Path> & InferParamWildCard<Path>
> extends true
	? Record<string, any> | undefined
	: Prettify<InferParamPath<Path> & InferParamWildCard<Path>>;

export type InferParamPath<Path> =
	Path extends `${infer _Start}:${infer Param}/${infer Rest}`
		? { [K in Param | keyof InferParamPath<Rest>]: string }
		: Path extends `${infer _Start}:${infer Param}`
			? { [K in Param]: string }
			: Path extends `${infer _Start}/${infer Rest}`
				? InferParamPath<Rest>
				: {};

export type InferParamWildCard<Path> = Path extends
	| `${infer _Start}/*:${infer Param}/${infer Rest}`
	| `${infer _Start}/**:${infer Param}/${infer Rest}`
	? { [K in Param | keyof InferParamPath<Rest>]: string }
	: Path extends `${infer _Start}/*`
		? { [K in "_"]: string }
		: Path extends `${infer _Start}/${infer Rest}`
			? InferParamWildCard<Rest>
			: {};

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type IsEmptyObject<T> = keyof T extends never ? true : false;

export type RequiredKeysOf<BaseType extends object> = Exclude<
	{
		[Key in keyof BaseType]: BaseType extends Record<Key, BaseType[Key]>
			? Key
			: never;
	}[keyof BaseType],
	undefined
>;

export type InferQuery<Options extends RouteOptions> =
	Options["query"] extends StandardSchemaV1
		? StandardSchemaV1.InferOutput<Options["query"]>
		: Record<string, any> | undefined;

export type HasRequiredKeys<BaseType extends object> =
	RequiredKeysOf<BaseType> extends never ? false : true;
