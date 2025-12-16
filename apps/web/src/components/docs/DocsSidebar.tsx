import { LuSun, LuMoon, LuBookOpen, LuLayers, LuBox } from "react-icons/lu";
import { BiCodeAlt } from "react-icons/bi";
import { CgChevronRight } from "react-icons/cg";
import { useTheme } from "../ThemeContext";
import type { TabType, SnippetFramework, TemplatesData } from "../../types/docs";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 hover:text-foreground text-muted transition-colors rounded-md hover:bg-surface-hover"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <LuSun size={18} /> : <LuMoon size={18} />}
    </button>
  );
};

interface DocsSidebarProps {
  activeTab: TabType;
  activeCategory: string;
  onTabChange: (tab: TabType) => void;
  onCategoryChange: (category: string) => void;
  snippetsData: SnippetFramework | null;
  templatesData: TemplatesData | null;
}

const tabs = [
  { id: "snippets" as TabType, label: "Snippets", icon: <BiCodeAlt size={18} /> },
  { id: "templates" as TabType, label: "Templates", icon: <LuLayers size={18} /> },
  { id: "modules" as TabType, label: "Modules", icon: <LuBox size={18} /> },
];

export const DocsSidebar = ({
  activeTab,
  activeCategory,
  onTabChange,
  onCategoryChange,
  snippetsData,
  templatesData,
}: DocsSidebarProps) => {
  return (
    <aside className="w-full md:w-72 border-r border-border bg-surface sticky top-0 h-screen overflow-y-auto hidden md:flex flex-col">
      <div className="p-6 flex-1">
        <h2 className="font-bold text-foreground mb-6 px-2 flex items-center gap-2">
          <LuBookOpen size={20} />
          Documentation
        </h2>

        {/* Tabs */}
        <div className="space-y-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Snippets Category Navigation */}
        {activeTab === "snippets" && snippetsData && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-2">
              Categories
            </div>
            {snippetsData.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === cat.id
                    ? "bg-secondary text-black font-medium"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        )}

        {/* Templates Category Navigation */}
        {activeTab === "templates" && templatesData && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-2">
              Categories
            </div>
            {templatesData.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === cat.id
                    ? "bg-secondary text-black font-medium"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-border bg-surface/50">
        <div className="flex items-center justify-between">
          <a
            href="/"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors flex items-center gap-2"
          >
            <CgChevronRight className="rotate-180" />
            Back to Home
          </a>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};
