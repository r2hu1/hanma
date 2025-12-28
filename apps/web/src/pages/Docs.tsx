import { memo, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDocsStore } from "@/stores/docsStore";
import {
  DocsSidebar,
  SnippetsView,
  TemplatesView,
  ModulesView,
} from "@/components/docs";
import type { FrameworkType, TabType } from "@/types/docs";
import ContentLoader from "@/components/loaders/ContentLoader";
import { parseDocsPath, buildDocsPath } from "@/utils/docsUrl";

// Memoized sidebar to prevent re-renders when only content changes
const MemoizedSidebar = memo(DocsSidebar);


const Docs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL to get current state
  const urlState = useMemo(() => parseDocsPath(location.pathname), [location.pathname]);

  const {
    snippetsData,
    templatesData,
    addonsData,
    modulesData,
    loading,
    setActiveCategory,
    setActiveFramework,
    fetchSnippetsData,
    fetchTemplatesData,
    fetchAddonsData,
    fetchModulesData,
  } = useDocsStore();

  // Sync URL state to Zustand store
  useEffect(() => {
    setActiveFramework(urlState.framework);
    if (urlState.category) {
      setActiveCategory(urlState.category);
    }
  }, [urlState.framework, urlState.category, setActiveFramework, setActiveCategory]);

  // Fetch data based on URL state
  useEffect(() => {
    if (urlState.tab === "snippets") {
      fetchSnippetsData(urlState.framework);
    }

    if (urlState.tab === "templates") {
      fetchTemplatesData(urlState.framework);
    }

    if (urlState.tab === "addons") {
      fetchAddonsData();
    }

    if (urlState.tab === "modules") {
      fetchModulesData();
    }
  }, [urlState.tab, urlState.framework, fetchSnippetsData, fetchTemplatesData, fetchAddonsData, fetchModulesData]);

  // Set first category as default when data loads and no category in URL
  useEffect(() => {
    if (!urlState.category) {
      if (urlState.tab === "snippets" && snippetsData?.categories?.[0]) {
        const firstCategory = snippetsData.categories[0].id;
        navigate(buildDocsPath(urlState.tab, urlState.framework, firstCategory), { replace: true });
      } else if (urlState.tab === "templates" && templatesData?.categories?.[0]) {
        const firstCategory = templatesData.categories[0].id;
        navigate(buildDocsPath(urlState.tab, urlState.framework, firstCategory), { replace: true });
      }
    }
  }, [urlState, snippetsData, templatesData, navigate]);

  const handleTabChange = useCallback(
    (tab: TabType) => {
      // Navigate to new tab, keeping framework if applicable
      if (tab === "modules") {
        navigate("/docs/modules");
      } else if (tab === "addons") {
        navigate("/docs/addons");
      } else {
        navigate(buildDocsPath(tab, urlState.framework, ""));
      }
    },
    [navigate, urlState.framework]
  );

  const handleFrameworkChange = useCallback(
    (framework: FrameworkType) => {
      navigate(buildDocsPath(urlState.tab, framework, ""));
    },
    [navigate, urlState.tab]
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      navigate(buildDocsPath(urlState.tab, urlState.framework, category));
    },
    [navigate, urlState.tab, urlState.framework]
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <MemoizedSidebar
        activeTab={urlState.tab}
        activeCategory={urlState.category}
        activeFramework={urlState.framework}
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
            <ContentLoader />
          ) : (
            <>
              {urlState.tab === "snippets" && snippetsData && (
                <SnippetsView
                  data={snippetsData}
                  activeCategory={urlState.category}
                  activeFramework={urlState.framework}
                />
              )}

              {urlState.tab === "templates" && templatesData && (
                <TemplatesView
                  data={templatesData}
                  activeCategory={urlState.category}
                />
              )}

              {urlState.tab === "addons" && addonsData && (
                <TemplatesView
                  data={addonsData}
                  activeCategory={urlState.category}
                />
              )}

              {urlState.tab === "modules" && modulesData && (
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

