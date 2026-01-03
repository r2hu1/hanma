import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDocsStore } from "@/stores/docsStore";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiCommand,
  FiFileText,
  FiBox,
  FiCpu,
  FiGrid,
  FiTool,
  FiHash,
} from "react-icons/fi";
import type { SearchItem } from "@/types/docs";
import clsx from "clsx";

export const SearchModal = () => {
  const { isSearchOpen, setSearchOpen, searchIndex, initializeSearchIndex } =
    useDocsStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Initialize index when mounted just in case, though store handles it too
  useEffect(() => {
    if (isSearchOpen) {
      if (searchIndex.length === 0) {
        initializeSearchIndex();
      }
      // Focus input logic could go here if not auto-focused
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isSearchOpen, initializeSearchIndex, searchIndex.length]);

  const filteredResults = useMemo(() => {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();

    // Simple scoring/filtering
    return searchIndex
      .filter((item) => {
        return (
          item.title.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery) ||
          item.category?.toLowerCase().includes(lowerQuery) ||
          item.framework?.toLowerCase().includes(lowerQuery)
        );
      })
      .slice(0, 50); // Limit results for performance
  }, [query, searchIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, filteredResults, selectedIndex, setSearchOpen]);

  const handleSelect = (item: SearchItem) => {
    if (item.path) {
      navigate(item.path);
      setSearchOpen(false);
    }
  };

  const getTypeIcon = (type: SearchItem["type"]) => {
    switch (type) {
      case "snippet":
        return <FiFileText className="w-4 h-4" />;
      case "template":
        return <FiBox className="w-4 h-4" />;
      case "module":
        return <FiGrid className="w-4 h-4" />;
      case "addon":
        return <FiCpu className="w-4 h-4" />;
      case "tooling":
        return <FiTool className="w-4 h-4" />;
      case "concept":
        return <FiHash className="w-4 h-4" />;
      default:
        return <FiFileText className="w-4 h-4" />;
    }
  };

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-2xl bg-[#09090b] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-4 border-b border-white/5 relative">
              <FiSearch className="text-white/40 w-5 h-5 mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search documentation..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-lg h-full"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white/50 opacity-100">
                  <span className="text-xs">ESC</span>
                </kbd>
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto flex-1 p-2">
              {query === "" && (
                <div className="py-12 text-center text-white/30">
                  <FiCommand className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>
                    Type to search across snippets, templates, and modules...
                  </p>
                </div>
              )}

              {query !== "" && filteredResults.length === 0 && (
                <div className="py-12 text-center text-white/30">
                  <p>No results found for "{query}"</p>
                </div>
              )}

              {filteredResults.length > 0 && (
                <div className="space-y-4">
                  {/* Group items */}
                  {(() => {
                    const groups: Record<string, SearchItem[]> = {};

                    filteredResults.forEach((item) => {
                      let groupName = "";
                      if (item.type === "snippet")
                        groupName = item.framework
                          ? `${item.framework} Snippets`
                          : "Snippets";
                      else if (item.type === "template")
                        groupName = "Templates";
                      else if (item.type === "module") groupName = "Modules";
                      else if (item.type === "addon") groupName = "Add-ons";
                      else if (item.type === "tooling") groupName = "Tooling";
                      else if (item.type === "concept") groupName = "Concepts";
                      else groupName = "Other";

                      // Capitalize first letter
                      groupName =
                        groupName.charAt(0).toUpperCase() + groupName.slice(1);

                      if (!groups[groupName]) groups[groupName] = [];
                      groups[groupName].push(item);
                    });

                    // Order of groups could be enforced here if needed

                    let globalIndex = 0;

                    return Object.entries(groups).map(([groupName, items]) => (
                      <div key={groupName}>
                        <div className="px-4 py-2 text-xs font-medium text-white/30 uppercase tracking-wider sticky top-0 bg-[#09090b]/90 backdrop-blur-sm z-10">
                          {groupName}
                        </div>
                        <div className="space-y-1">
                          {items.map((item) => {
                            const currentIndex = globalIndex++;
                            const isSelected = selectedIndex === currentIndex;

                            return (
                              <div
                                key={`${item.type}-${item.id}`}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() =>
                                  setSelectedIndex(currentIndex)
                                }
                                className={clsx(
                                  "px-4 py-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors mx-2",
                                  isSelected
                                    ? "bg-white/10"
                                    : "hover:bg-white/5",
                                )}
                              >
                                <div
                                  className={clsx(
                                    "p-2 rounded-md flex items-center justify-center",
                                    isSelected
                                      ? "bg-white/10 text-white"
                                      : "bg-white/5 text-white/50",
                                  )}
                                >
                                  {getTypeIcon(item.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3
                                      className={clsx(
                                        "font-medium truncate",
                                        isSelected
                                          ? "text-white"
                                          : "text-white/80",
                                      )}
                                    >
                                      {item.title}
                                    </h3>
                                    {item.category && (
                                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/5 truncate max-w-[100px]">
                                        {item.category}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-white/40 truncate mt-0.5">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs text-white/30">
              <div className="flex items-center gap-4">
                <span>
                  <span className="text-white/50">↵</span> to select
                </span>
                <span>
                  <span className="text-white/50">↑↓</span> to navigate
                </span>
              </div>
              <span>{filteredResults.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
