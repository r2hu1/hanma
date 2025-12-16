import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type {
  TabType,
  SnippetFramework,
  TemplatesData,
  TemplateCategory,
  ModulesData,
  SnippetCategory,
} from "../types/docs";

interface UseDocsDataReturn {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  snippetsData: SnippetFramework | null;
  templatesData: TemplatesData | null;
  modulesData: ModulesData | null;
  loading: boolean;
  handleTabChange: (tab: TabType) => void;
}

export function useDocsData(): UseDocsDataReturn {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("snippets");
  const [snippetsData, setSnippetsData] = useState<SnippetFramework | null>(
    null,
  );
  const [templatesData, setTemplatesData] = useState<TemplatesData | null>(
    null,
  );
  const [modulesData, setModulesData] = useState<ModulesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");

  // Determine active tab from URL
  useEffect(() => {
    const path = location.pathname.replace("/docs", "").replace(/^\//, "");
    if (path.startsWith("templates")) {
      setActiveTab("templates");
    } else if (path.startsWith("modules")) {
      setActiveTab("modules");
    } else {
      setActiveTab("snippets");
    }
  }, [location.pathname]);

  // Fetch data based on active tab
  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        if (activeTab === "snippets" && !snippetsData) {
          const indexRes = await fetch("/docs/snippets/express/index.json");
          const indexData = await indexRes.json();
          const categoryPromises = indexData.categoryFiles.map(
            async (catFile: { id: string; file: string }) => {
              const res = await fetch(`/docs/snippets/express/${catFile.file}`);
              return res.json();
            },
          );
          const categories: SnippetCategory[] =
            await Promise.all(categoryPromises);

          // Merge into SnippetFramework structure
          const mergedData: SnippetFramework = {
            framework: indexData.framework,
            version: indexData.version,
            title: indexData.title,
            description: indexData.description,
            installNote: indexData.installNote,
            concept: indexData.concept,
            examples: indexData.examples,
            categories,
          };

          setSnippetsData(mergedData);
          if (categories.length > 0) {
            setActiveCategory(categories[0].id);
          }
        } else if (activeTab === "templates" && !templatesData) {
          // Fetch from framework-specific directory (express for now)
          const indexRes = await fetch("/docs/templates/express/index.json");
          const indexData = await indexRes.json();

          // Fetch all category files in parallel
          const categoryPromises = indexData.categoryFiles.map(
            async (catFile: {
              id: string;
              file: string;
              title: string;
              description: string;
            }) => {
              const res = await fetch(
                `/docs/templates/express/${catFile.file}`,
              );
              return res.json();
            },
          );
          const categories: TemplateCategory[] =
            await Promise.all(categoryPromises);

          // Merge into TemplatesData structure
          const mergedData: TemplatesData = {
            title: indexData.title,
            description: indexData.description,
            categories,
            examples: indexData.examples,
          };

          setTemplatesData(mergedData);
          if (categories.length > 0) {
            setActiveCategory(categories[0].id);
          }
        } else if (activeTab === "modules" && !modulesData) {
          const res = await fetch("/docs/modules/index.json");
          const data = await res.json();
          setModulesData(data);
        }
      } catch (err) {
        console.error("Failed to fetch docs:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [activeTab, snippetsData, templatesData, modulesData]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    navigate(`/docs/${tab === "snippets" ? "" : tab}`);
  };

  return {
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    snippetsData,
    templatesData,
    modulesData,
    loading,
    handleTabChange,
  };
}
