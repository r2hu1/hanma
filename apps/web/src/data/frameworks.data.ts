// supported-frameworks.data.ts
import { LuServer, LuFlame, LuZap } from "react-icons/lu";

export const frameworks = [
  {
    id: "express",
    name: "Express.js",
    description:
      "The battle-tested standard. Middleware and controllers compatible with Express 4 and 5.",
    icon: LuServer,
    accent: "gray",
    iconColor: "text-foreground",
    command: {
      prefixColor: "text-foreground",
      text: "npm install hanma-express",
    },
  },
  {
    id: "hono",
    name: "Hono",
    description:
      "Ultrafast web framework for the Edge. Runs on Cloudflare Workers, Deno, and Bun.",
    icon: LuFlame,
    accent: "orange",
    iconColor: "text-orange-500",
    command: {
      prefixColor: "text-orange-500",
      text: "npm install hanma-hono",
    },
  },
  {
    id: "elysia",
    name: "Elysia",
    description:
      "Ergonomic framework for Bun. End-to-end type safety with TypeBox integration.",
    icon: LuZap,
    accent: "pink",
    iconColor: "text-pink-500",
    command: {
      prefixColor: "text-pink-500",
      text: "bun add hanma-elysia",
    },
  },
];
