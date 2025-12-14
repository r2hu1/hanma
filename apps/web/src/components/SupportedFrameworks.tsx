import {
  LuFlame,
  LuZap,
  LuServer,
  LuArrowRight,
  LuLayers,
} from "react-icons/lu";

const SupportedFrameworks = () => {
  return (
    <section className="py-24 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Built for your stack
          </h2>
          <p className="text-muted max-w-md">
            Native implementations for the modern TypeScript ecosystem. No
            wrappers, just idiomatic code.
          </p>
        </div>
        <button className="text-sm font-medium text-foreground hover:text-muted transition-colors flex items-center gap-2">
          View all integrations <LuArrowRight size={16} />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden">
        {/* Express Card */}
        <div className="bg-background p-8 group hover:bg-surface-hover transition-colors relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-gray-500/10"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center mb-6 text-foreground">
              <LuServer size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Express.js
            </h3>
            <p className="text-sm text-muted mb-8 min-h-[40px]">
              The battle-tested standard. Middleware and controllers compatible
              with Express 4 and 5.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted font-mono border-t border-border pt-4">
              <span className="text-foreground">$</span> npm install
              hanma-express
            </div>
          </div>
        </div>

        {/* Hono Card */}
        <div className="bg-background p-8 group hover:bg-surface-hover transition-colors relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-orange-500/10"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center mb-6 text-orange-500">
              <LuFlame size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Hono</h3>
            <p className="text-sm text-muted mb-8 min-h-[40px]">
              Ultrafast web framework for the Edge. Runs on Cloudflare Workers,
              Deno, and Bun.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted font-mono border-t border-border pt-4">
              <span className="text-orange-500">$</span> npm install hanma-hono
            </div>
          </div>
        </div>

        {/* Elysia Card */}
        <div className="bg-background p-8 group hover:bg-surface-hover transition-colors relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-pink-500/10"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center mb-6 text-pink-500">
              <LuZap size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Elysia</h3>
            <p className="text-sm text-muted mb-8 min-h-[40px]">
              Ergonomic framework for Bun. End-to-end type safety with TypeBox
              integration.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted font-mono border-t border-border pt-4">
              <span className="text-pink-500">$</span> bun add hanma-elysia
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-xs font-medium text-muted">
          <LuLayers size={14} />
          <span>NestJS support coming soon</span>
        </div>
      </div>
    </section>
  );
};

export default SupportedFrameworks;
