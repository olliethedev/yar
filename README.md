# yar (Yet Another Router)

## About

`yar` is a simple and pluggable router for modern react frameworks. It is designed to be used as a part of any modern react framework.


## Why yar?

- **Type Safety First**: Unlike many routers, yar provides complete type inference for path parameters and validated query parameters
- **Validation Built-in**: No need to manually validate query parameters - use your favorite schema library
- **Composable**: Routes can be exported from npm packages and combined
- **Simple API**: Just two functions to learn: `createRoute` and `createRouter`
- **Framework Flexibility**: Not tied to any specific React framework


## Installation

```bash
pnpm add yar
```

## API Reference

### `createRoute(path, handler, options?)`

Creates a type-safe route definition.

**Parameters:**
- `path` (string): Route pattern with optional parameters (e.g., `/user/:id`)
- `handler` (function): Function receiving `{ params, query }` and returning:
  - `Component`: React component to render
  - `loader?`: Optional async function to load data
  - `meta?`: Optional function to generate meta tags (receives loader data)
- `options?` (object): Optional configuration
  - `query`: Standard Schema for query parameter validation

**Returns:** Route handler function with `path` and `options` properties

### `createRouter(routes, config?)`

Creates a router instance from route definitions.

**Parameters:**
- `routes` (object): Map of route names to route handlers
- `config?` (object): Optional router configuration
  - `routerContext?`: Shared context accessible to all routes

**Returns:** Router object with:
- `routes`: Original routes object
- `getRoute(path, queryParams?)`: Async function to match and execute a route


## Usage

```tsx
import { createRoute, createRouter } from "yar";
import PageA from "@/components/page-a";
import PageB from "@/components/page-b";
import { z } from "zod";

const pageARoute = createRoute(
    "/page-a",
    () => ({
        Component: PageA,
        meta: () => [
            { name: "title", content: "Page A!" },
            { name: "description", content: "Page A Description" },
        ],
    })
);

const pageBRoute = createRoute(
    "/page-b/:id",
    (context) => {
        const loader = () => dataForPageB(context.params, context.query?.test || "NONE");
        return {
            Component: PageB,
            loader,
            meta: (data?: string) => [
                { name: "title", content: "Page B" },
                { name: "description", content: "Page B Description:" + data },
                { property: "og:title", content: "Page B" },
                { property: "og:description", content: "Page B Description" },
            ],
        };
    },
    {
        query: z.object({
            test: z.string(),
        }),
    }
);

const routes = {
    pageA: pageARoute,
    pageB: pageBRoute,
} as const;

export const AppRouter = () => createRouter(routes);

const dataForPageB = async (params: Record<string, string>, test: string): Promise<string> => {
    return "Computed data: " + params.id + " Test:" + test;
};

```


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [olliethedev](https://github.com/olliethedev)