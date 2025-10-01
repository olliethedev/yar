# @olliethedev/yar (Yet Another Router)

## About

`@olliethedev/yar` is a simple and pluggable router for modern react frameworks. It is designed to be used as a part of any modern react framework.


## Why another router?

- **Composable**: Routes can be exported from npm packages and combined
- **Framework Flexibility**: Not tied to any specific React framework
- **Simple API**: Just two functions to learn: `createRoute` and `createRouter`
- **Type Safety First**: Unlike many routers, `@olliethedev/yar` provides complete type inference for path parameters and validated query parameters
- **Validation Built-in**: No need to manually validate query parameters - use your favorite schema library

## Installation

```bash
pnpm add @olliethedev/yar
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
- `getRoute(path, queryParams?)`: Function to match and execute a route


## Usage

```tsx
import { createRoute, createRouter } from "@olliethedev/yar";
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

## Complete Example: Handling Routes

Here's a framework-agnostic example showing how to use the router to handle incoming requests:

```tsx
import { AppRouter } from "./router";

async function handleRequest(pathname: string, queryParams: Record<string, string | string[]>) {
  const route = AppRouter().getRoute(pathname, queryParams);
  
  if (!route) {
    return { status: 404, html: "<h1>404 - Page Not Found</h1>" };
  }

  const { Component, params, loader, meta } = route;
  const data = loader ? await loader() : undefined;
  const metaTags = meta ? meta(data) : [];

  return {
    status: 200,
    metaTags,
    element: <Component params={params} data={data} />,
  };
}

handleRequest("/page-a", {});
handleRequest("/page-b/123", { test: "hello" });
```

### Extracting Metadata

```tsx
async function extractMetadata(pathname: string, queryParams: Record<string, string | string[]>) {
  const route = AppRouter().getRoute(pathname, queryParams);
  
  if (!route || !route.meta) {
    return { title: "My Site", description: "" };
  }

  const data = route.loader ? await route.loader() : undefined;
  const metaTags = route.meta(data);

  const findBy = (predicate: (m: React.JSX.IntrinsicElements["meta"]) => boolean) =>
    metaTags.find((tag) => tag && predicate(tag));

  const getContent = (m?: React.JSX.IntrinsicElements["meta"]) =>
    (m && "content" in m ? m.content : undefined) as string | undefined;

  const titleFromName = getContent(findBy((m) => m.name === "title"));
  const titleFromOg = getContent(findBy((m) => m.property === "og:title"));
  const descriptionFromName = getContent(findBy((m) => m.name === "description"));
  const descriptionFromOg = getContent(findBy((m) => m.property === "og:description"));

  return {
    title: titleFromName ?? titleFromOg ?? "My Site",
    description: descriptionFromName ?? descriptionFromOg ?? "",
    openGraph: {
      title: titleFromOg ?? titleFromName,
      description: descriptionFromOg ?? descriptionFromName,
    },
  };
}
```


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [olliethedev](https://github.com/olliethedev)