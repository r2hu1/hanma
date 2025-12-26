import type { TerminalDockProps } from "@/types/builder";
import { generateCommand } from "@/utils/builder";
import { useState } from "react";
import { LuTerminal, LuCopy, LuCheck } from "react-icons/lu";

export default function TerminalDock(props: TerminalDockProps) {
  const [copied, setCopied] = useState(false);

  const command = generateCommand(props);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50">
      <div className="bg-black/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground px-1">
          <LuTerminal className="w-3 h-3" />
          <span>terminal</span>
        </div>

        {/* Command */}
        <div className="relative group">
          {/* Copy button */}
          <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={copyToClipboard}
              className="bg-surface hover:bg-surface-hover text-foreground text-xs px-3 py-1.5 rounded-md border border-border flex items-center gap-1.5 shadow-sm"
            >
              {copied ? (
                <LuCheck className="w-3 h-3 text-green-500" />
              ) : (
                <LuCopy className="w-3 h-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Terminal line */}
          <div className="font-mono text-sm overflow-x-auto scrollbar-hide py-2 px-1">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-orange-400 select-none">$</span>
              <span className="text-foreground/90">
                <span className="text-muted-foreground">npx</span>{" "}
                <span className="text-orange-400 font-bold">hanma</span>{" "}
                init {props.projectName}

                {props.selectedBase && (
                  <span className="text-green-400">
                    {" "}
                    --server {props.selectedBase}
                  </span>
                )}

                {props.selectedDatabase && (
                  <span className="text-yellow-200">
                    {" "}
                    --db {props.selectedDatabase}
                  </span>
                )}

                {props.selectedAuth && (
                  <span className="text-pink-400">
                    {" "}
                    --auth {props.selectedAuth}
                  </span>
                )}

                {props.selectedPreset && (
                  <span className="text-blue-400">
                    {" "}
                    --security {props.selectedPreset}
                  </span>
                )}

                {props.selectedMailer && (
                  <span className="text-purple-300">
                    {" "}
                    --mailer {props.selectedMailer}
                  </span>
                )}

                {props.selectedUpload && (
                  <span className="text-cyan-300">
                    {" "}
                    --upload {props.selectedUpload}
                  </span>
                )}

                {props.selectedTooling && (
                  <span className="text-gray-400">
                    {" "}
                    --tooling {props.selectedTooling}
                  </span>
                )}

                {props.selectedOtherFeatures.length > 0 && (
                  <span className="text-red-300">
                    {" "}
                    --features {props.selectedOtherFeatures.join(",")}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
