import  { useState } from 'react';
import { BiFolder, BiServer } from 'react-icons/bi';
import { BsFileCode } from 'react-icons/bs';
import { CgCheck, CgChevronRight, CgCopy } from 'react-icons/cg';


const docsData = [
  {
    title: "Express",
    icon: <BiServer size={18} />,
    sections: [
      {
        id: "express-servers",
        title: "Servers",
        description: "Pre-configured Express server boilerplates.",
        items: [
          {
            name: "Basic Server",
            id: "express-basic",
            desc: "A minimal Express v5 setup with JSON parsing, CORS, and basic error handling.",
            cmd: "npx hanma add express-basic-server src/server.ts"
          },
          {
            name: "Production Ready",
            id: "express-prod",
            desc: "Complete setup with Helmet, Compression, Rate Limiting, and Graceful Shutdown.",
            cmd: "npx hanma add express-production-server src/server.ts"
          }
        ]
      },
      {
        id: "express-db",
        title: "Database",
        description: "Database connection logic and ORM setups.",
        items: [
          {
            name: "Prisma Client",
            id: "express-prisma",
            desc: "Singleton Prisma client instance with connection resilience.",
            cmd: "npx hanma add express-prisma src/lib/db.ts"
          },
          {
            name: "Mongoose Connection",
            id: "express-mongoose",
            desc: "Robust MongoDB connection handler with retry logic and event logging.",
            cmd: "npx hanma add express-mongoose src/lib/db.ts"
          }
        ]
      }
    ]
  },
  {
    title: "Utils",
    icon: <BsFileCode size={18} />,
    sections: [
      {
        id: "utils-auth",
        title: "Auth",
        description: "Authentication helpers and middleware.",
        items: [
          {
            name: "JWT Wrapper",
            id: "auth-jwt",
            desc: "Typed utility for signing and verifying JWTs with auto-expiration.",
            cmd: "npx hanma add jwt-utils src/utils/jwt.ts"
          },
          {
            name: "Password Hashing",
            id: "auth-password",
            desc: "Argon2 or Bcrypt wrapper for secure password hashing and verification.",
            cmd: "npx hanma add password-hashing src/utils/password.ts"
          }
        ]
      },
      {
        id: "utils-validation",
        title: "Validation",
        description: "Schema validation and environment checks.",
        items: [
          {
            name: "Env Validation",
            id: "val-env",
            desc: "Zod-based environment variable validation on startup.",
            cmd: "npx hanma add env-validation src/config/env.ts"
          }
        ]
      }
    ]
  }
];

const Docs = () => {
  const [activeSection, setActiveSection] = useState("express-servers");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-surface sticky top-16 h-auto md:h-[calc(100vh-4rem)] overflow-y-auto hidden md:block">
        <div className="p-6">
          <h2 className="font-bold text-foreground mb-6 px-2">Documentation</h2>
          <div className="space-y-6">
            {docsData.map((group, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 text-muted px-2 mb-2 text-sm font-semibold uppercase tracking-wider">
                  {group.icon}
                  {group.title}
                </div>
                <ul className="space-y-1">
                  {group.sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                          activeSection === section.id
                            ? 'bg-secondary text-black font-medium'
                            : 'text-muted hover:text-foreground hover:bg-surface-hover'
                        }`}
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-16">
          {docsData.map((group) => (
            <div key={group.title}>
              {group.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24 mb-16">
                   <div className="flex items-center gap-2 text-muted text-sm mb-2">
                      <BiFolder size={14} />
                      <span>{group.title}</span>
                      <CgChevronRight size={14} />
                      <span className="text-foreground font-medium">{section.title}</span>
                   </div>
                   <h2 className="text-3xl font-bold text-foreground mb-4">{section.title}</h2>
                   <p className="text-muted text-lg mb-8">{section.description}</p>
                   
                   <div className="grid gap-8">
                      {section.items.map((item) => (
                        <Card key={item.id} item={item} />
                      ))}
                   </div>
                </section>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const Card = ({ item }: { item: any }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-xl bg-surface overflow-hidden">
        <div className="p-6 border-b border-border bg-background">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                {item.name}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
                {item.desc}
            </p>
        </div>
        <div className="p-4 bg-[#0c0c0e]">
             <div className="flex items-center justify-between gap-4">
                 <div className="font-mono text-sm text-zinc-300 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <span className="text-green-500 mr-2">$</span>
                    {item.cmd}
                 </div>
                 <button 
                    onClick={handleCopy}
                    className="text-zinc-500 hover:text-white transition-colors"
                    title="Copy to clipboard"
                 >
                    {copied ? <CgCheck size={16} className="text-green-500" /> : <CgCopy size={16} />}
                 </button>
             </div>
        </div>
    </div>
  );
};

export default Docs;