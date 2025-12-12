import { useState, useEffect } from 'react';

interface RegistryItem {
  name: string;
  description: string;
  version?: string;
  dependencies?: string[];
}

export function SnippetBrowser() {
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/registry/index.json')
      .then(res => res.json())
      .then(data => {
        setFrameworks(data);
        if (data.length > 0) {
            const defaultFramework = data.includes('express') ? 'express' : data[0];
            handleFrameworkSelect(defaultFramework);
        }
      })
      .catch(() => setError('Failed to load frameworks'));
  }, []);

  const handleFrameworkSelect = async (fw: string) => {
    setSelectedFramework(fw);
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/registry/${fw}.json`);
      if (!res.ok) throw new Error('Failed to load registry');
      const data = await res.json();
      setSnippets(data);
    } catch (err) {
      setError('Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  const copyCommand = (name: string) => {
    navigator.clipboard.writeText(`npx hanma add ${name}`);
  };

  return (
    <div id="snippets" className="container mx-auto px-4 py-24 border-t border-neutral-900">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 text-neutral-100">Browse Library</h2>
        <p className="text-neutral-400">Explore production-ready snippets for your favorite framework.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-2">
           <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-3">Frameworks</h3>
           {frameworks.map(fw => (
             <button
               key={fw}
               onClick={() => handleFrameworkSelect(fw)}
               className={`text-left px-4 py-3 rounded-lg capitalize font-medium transition-all ${
                 selectedFramework === fw 
                   ? 'bg-neutral-800 text-white shadow-lg shadow-neutral-900/50' 
                   : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
               }`}
             >
               {fw}
             </button>
           ))}
        </div>

        {/* Content */}
        <div className="flex-1">
           {loading ? (
             <div className="flex items-center justify-center h-64 text-neutral-500">Loading snippets...</div>
           ) : error ? (
             <div className="text-red-500">{error}</div>
           ) : (
             <div className="grid grid-cols-1 gap-4">
                {snippets.map((snippet) => (
                  <div key={snippet.name} className="group p-6 bg-neutral-900/20 border border-neutral-800 rounded-xl hover:border-orange-500/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-xl font-semibold text-neutral-200">{snippet.name}</h3>
                           {snippet.version && (
                             <span className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 rounded-full border border-neutral-700">
                               {snippet.version}
                             </span>
                           )}
                         </div>
                         <p className="text-neutral-400 text-sm">{snippet.description}</p>
                       </div>
                       <button 
                         onClick={() => copyCommand(snippet.name)}
                         className="p-2 text-neutral-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                         title="Copy command"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                       </button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500 font-mono">
                      <div className="flex gap-2">
                         {snippet.dependencies && snippet.dependencies.map(dep => (
                            <span key={dep}>#{dep}</span>
                         ))}
                      </div>
                      <code>npx hanma add {snippet.name}</code>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
