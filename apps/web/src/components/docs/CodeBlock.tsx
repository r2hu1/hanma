import { useState } from "react";
import { CgCheck, CgCopy } from "react-icons/cg";

interface CopyButtonProps {
  text: string;
}

export const CopyButton = ({ text }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
      title="Copy to clipboard"
    >
      {copied ? (
        <CgCheck size={16} className="text-green-500" />
      ) : (
        <CgCopy size={16} />
      )}
    </button>
  );
};

interface CodeBlockProps {
  code?: string;
  command?: string;
}

export const CodeBlock = ({ code, command }: CodeBlockProps) => (
  <div className="bg-[#0c0c0e] rounded-lg overflow-hidden">
    <div className="p-4 flex items-center justify-between gap-4">
      <div className="font-mono text-sm text-zinc-300 overflow-x-auto whitespace-pre-wrap">
        {command && <span className="text-green-500 mr-2">$</span>}
        {command || code}
      </div>
      <CopyButton text={command || code || ""} />
    </div>
  </div>
);
