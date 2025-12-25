import { memo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDocsStore } from "@/stores/docsStore";
import {
  DocsSidebar,
  SnippetsView,
  TemplatesView,
  ModulesView,
} from "@/components/docs";

// Memoized sidebar to prevent re-renders when only content changes
const MemoizedSidebar = memo(DocsSidebar);

// Loading spinner for content area only
const ContentLoading = () => (
  <div className="flex items-center justify-center py-20">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted">Loading...</p>
    </div>
  </div>
);

// Derive tab purely from URL (single source of truth)
const getTabFromPath = (pathname: string) => {
  if (pathname.startsWith("/docs/templates")) return "templates";
  if (pathname.startsWith("/docs/modules")) return "modules";
  return "snippets";
};

const Docs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = getTabFromPath(location.pathname);

  const {
    activeCategory,
    activeFramework,
    snippetsData,
    templatesData,
    modulesData,
    loading,
    setActiveCategory,
    setActiveFramework,
    fetchSnippetsData,
    fetchTemplatesData,
    fetchModulesData,
  } = useDocsStore();

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === "snippets") {
      fetchSnippetsData(activeFramework);
    }

    if (activeTab === "templates") {
      fetchTemplatesData();
    }

    if (activeTab === "modules") {
      fetchModulesData();
    }
  }, [
    activeTab,
    activeFramework,
    fetchSnippetsData,
    fetchTemplatesData,
    fetchModulesData,
  ]);


  useEffect(() => {
    setActiveCategory("");
  }, [activeTab, setActiveCategory]);

  const handleTabChange = useCallback(
    (tab: "snippets" | "templates" | "modules") => {
      navigate(tab === "snippets" ? "/docs" : `/docs/${tab}`);
    },
    [navigate]
  );

  const handleFrameworkChange = useCallback(
    (framework: "express" | "hono" | "elysia" | "shared") => {
      setActiveFramework(framework);
    },
    [setActiveFramework]
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      setActiveCategory(category);
    },
    [setActiveCategory]
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <MemoizedSidebar
        activeTab={activeTab}
        activeCategory={activeCategory}
        activeFramework={activeFramework}
        onTabChange={handleTabChange}
        onCategoryChange={handleCategoryChange}
        onFrameworkChange={handleFrameworkChange}
        snippetsData={snippetsData}
        templatesData={templatesData}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <ContentLoading />
          ) : (
            <>
              {activeTab === "snippets" && snippetsData && (
                <SnippetsView
                  data={snippetsData}
                  activeCategory={activeCategory}
                  activeFramework={activeFramework}
                />
              )}

              {activeTab === "templates" && templatesData && (
                <TemplatesView
                  data={templatesData}
                  activeCategory={activeCategory}
                />
              )}

              {activeTab === "modules" && modulesData && (
                <ModulesView data={modulesData} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Docs;
