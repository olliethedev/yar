# @olliethedev/yar (Yet Another Router)

A simple, type-safe router for React that works with any framework.

## Why use this?

- ✨ **Super Simple** - Only 2 functions: `createRoute` and `createRouter`
- 🔒 **Type Safe** - TypeScript knows your route params automatically
- 🎯 **Flexible** - Works with any React framework
- ✅ **Validated** - Built-in query parameter validation

## Installation

```bash
npm install @olliethedev/yar
# or
pnpm add @olliethedev/yar
```

## Quick Start

Here's one complete example showing all features:

```tsx
import { createRoute, createRouter } from "@olliethedev/yar";
import { z } from "zod"; // or any Standard Schema library
import HomePage from "./pages/home";
import BlogPostPage from "./pages/blog-post";

// 1️⃣ Simple route - just a page
const homeRoute = createRoute(
  "/",
  () => ({
    PageComponent: HomePage,
    meta: () => [{ name: "title", content: "Home" }],
  }),
  undefined,
  { isStatic: true } // 🏷️ Optional: tag routes for filtering for SSG environments
);

// 2️⃣ Dynamic route - with params, validation, and data loading
const blogRoute = createRoute(
  "/blog/:slug", // :slug becomes available as params.slug
  ({ params, query }) => ({
    PageComponent: BlogPostPage,
    
    // 📦 Load data (can use AbortSignal, options, etc.)
    loader: async (signal?: AbortSignal) => {
      const res = await fetch(`/api/posts/${params.slug}`, { signal });
      return res.json();
    },
    
    // 📄 Generate meta tags (can use loader data)
    meta: (post) => [
      { name: "title", content: post.title },
      { name: "description", content: post.excerpt },
    ],
    
    // 🎨 Extra data for anything (breadcrumbs, layout, etc.)
    extra: () => ({
      breadcrumbs: ["Home", "Blog", params.slug],
      layout: "blog",
    }),
  }),
  {
    // ✅ Validate query parameters
    query: z.object({
      preview: z.boolean().optional(),
    }),
  },
  { isStatic: false, requiresAuth: false } // 🏷️ Route tags
);

// 3️⃣ Create router
const router = createRouter({
  home: homeRoute,
  blog: blogRoute,
});

// 4️⃣ Use the router in your app
async function handleRequest(url: string) {
  const route = router.getRoute(url);
  
  if (!route) {
    return <NotFoundPage />;
  }

  // Everything is typed! TypeScript knows the types of all params
  const data = route.loader ? await route.loader() : null;
  const metaTags = route.meta ? route.meta(data) : [];
  const extras = route.extra ? route.extra() : null;

  return (
    <route.PageComponent 
      params={route.params} 
      data={data} 
    />
  );
}

// 5️⃣ Filter routes without running handlers (great for SSG!)
const staticRoutes = Object.values(router.routes)
  .filter(route => route.meta?.isStatic);
```

## What You Need to Know

### `createRoute(path, handler, options?, routeMeta?)`

Creates a route. The handler returns:
- **`PageComponent`** - Your React component
- **`loader()`** - Load data (can accept any params like `AbortSignal`)
- **`meta()`** - Generate SEO tags (can accept any params)
- **`extra()`** - Any extra data you need (can accept any params)

The 4th parameter `routeMeta` lets you tag routes for filtering (e.g., `{ isStatic: true }`).

### `createRouter(routes)`

Combines your routes. Returns:
- **`routes`** - All your routes
- **`getRoute(path, query?)`** - Match a URL and get the route

### Key Features

**🎯 Path Parameters**
```tsx
"/blog/:slug" → params.slug is automatically typed
```

**✅ Query Validation**
```tsx
query: z.object({ sort: z.string() })
```

**🏷️ Route Tags**
```tsx
{ isStatic: true, requiresAuth: false }
// Filter without running handlers - perfect for finding static routes in SSG environments, or for filtering routes that require authentication.
```

**🎨 Flexible Functions**
```tsx
loader: (signal) => fetch(url, { signal })
meta: (data) => [{ name: "title", content: data.title }]
extra: (userId) => ({ breadcrumbs: [...], userId })
```
Perfect for prefetching data and generating meta tags in SSR environments, or for adding extra data to your routes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT