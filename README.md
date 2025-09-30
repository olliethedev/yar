# yar (Yet Another Router)

## About

`yar` is a simple and pluggable router for modern react frameworks. It is designed to be used as a part of any modern react framework.

The router allows page routes to be loaded from npm packages, allowing for easy distribution of routes between projects.

## Installation

```bash
pnpm add yar
```

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