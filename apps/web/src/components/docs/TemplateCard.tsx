import { memo } from "react";
import { CgChevronRight } from "react-icons/cg";
import type { Template } from "../../types/docs";
import { useUIStore } from "../../stores";
import { CodeBlock } from "./CodeBlock";

interface TemplateCardProps {
  template: Template;
}

const TemplateCardComponent = ({ template }: TemplateCardProps) => {
  const { isCardExpanded, toggleCardExpanded } = useUIStore();
  const cardId = `template-${template.id}`;
  const expanded = isCardExpanded(cardId);

  return (
    <div className={`border rounded-xl bg-surface overflow-hidden transition-colors ${template.recommended ? 'border-primary' : 'border-border hover:border-foreground/20'}`}>
      <div 
        className="p-6 border-b border-border bg-background cursor-pointer"
        onClick={() => toggleCardExpanded(cardId)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            {template.name}
            {template.recommended && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">
                Recommended
              </span>
            )}
          </h3>
          <CgChevronRight 
            className={`text-muted transition-transform ${expanded ? 'rotate-90' : ''}`} 
            size={20} 
          />
        </div>
        <p className="text-muted text-sm leading-relaxed mt-2">{template.description}</p>
      </div>

      {expanded && (
        <div className="p-6 space-y-6">
          {/* Purpose */}
          {template.purpose && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Purpose</h4>
              <p className="text-muted text-sm">{template.purpose}</p>
            </div>
          )}

          {/* Features */}
          {template.features && template.features.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Features</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {template.features.map((feature, idx) => (
                  <li key={idx} className="text-muted text-sm flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Command */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Create Project</h4>
            <CodeBlock command={template.command} />
          </div>

          {/* Structure */}
          {template.structure && template.structure.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Project Structure</h4>
              <ul className="space-y-1">
                {template.structure.map((item, idx) => (
                  <li key={idx} className="text-muted text-sm font-mono">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {template.nextSteps && template.nextSteps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Next Steps</h4>
              <ul className="space-y-1">
                {template.nextSteps.map((step, idx) => (
                  <li key={idx} className="text-muted text-sm flex items-start gap-2">
                    <span className="text-primary">{idx + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const TemplateCard = memo(TemplateCardComponent);
