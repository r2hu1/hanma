import {
  LuZap,
  LuLayers,
  LuGitBranch,
  LuCode,
  LuShieldCheck,
  LuDatabase,
} from "react-icons/lu";

export const features = [
  {
    id: "security-first",
    icon: LuShieldCheck,
    title: "Security First",
    description:
      "Every snippet is audited for common vulnerabilities (OWASP Top 10) before being published.",
  },
  {
    id: "zero-dependencies",
    icon: LuZap,
    title: "Zero Dependencies",
    description:
      "Code that relies on standard libraries whenever possible to keep your bundle size small.",
  },
  {
    id: "type-safe",
    icon: LuCode,
    title: "Type Safe",
    description:
      "Written in TypeScript, Go, and Python with full type definitions included out of the box.",
  },
  {
    id: "database-agnostic",
    icon: LuDatabase,
    title: "Database Agnostic",
    description:
      "Adapters for PostgreSQL, MySQL, and MongoDB. Switch databases without rewriting logic.",
  },
  {
    id: "modular-design",
    icon: LuLayers,
    title: "Modular Design",
    description:
      "Composable functions that can be used independently or chained together.",
  },
  {
    id: "version-controlled",
    icon: LuGitBranch,
    title: "Version Controlled",
    description:
      "Track changes to Snippets in your own git history. No black-box npm updates.",
  },
];
