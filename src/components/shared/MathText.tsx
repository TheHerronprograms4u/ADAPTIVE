import React from 'react';
import katex from 'katex';

interface MathTextProps {
  content: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content by block math ($$...$$) and inline math ($...$)
  const renderMathSegments = (text: string) => {
    // First, split block math
    const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

    return blockParts.map((bPart, bIdx) => {
      if (bPart.startsWith('$$') && bPart.endsWith('$$')) {
        const mathExpr = bPart.slice(2, -2).trim();
        try {
          const html = katex.renderToString(mathExpr, { displayMode: true, throwOnError: false });
          return (
            <div
              key={`b-${bIdx}`}
              className="my-3 overflow-x-auto py-1 text-center font-serif text-indigo-200"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <pre key={`b-${bIdx}`} className="text-red-400">{mathExpr}</pre>;
        }
      }

      // Inside non-block parts, split inline math ($...$)
      const inlineParts = bPart.split(/(\$[^\$]+?\$)/g);
      return (
        <span key={`nb-${bIdx}`}>
          {inlineParts.map((iPart, iIdx) => {
            if (iPart.startsWith('$') && iPart.endsWith('$') && iPart.length > 2) {
              const mathExpr = iPart.slice(1, -1).trim();
              try {
                const html = katex.renderToString(mathExpr, { displayMode: false, throwOnError: false });
                return (
                  <span
                    key={`i-${iIdx}`}
                    className="inline-block px-1 font-serif text-indigo-300 font-medium"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              } catch (e) {
                return <span key={`i-${iIdx}`} className="text-red-400">{mathExpr}</span>;
              }
            }

            // Normal text with bold/italic or linebreaks
            return <span key={`i-${iIdx}`}>{iPart}</span>;
          })}
        </span>
      );
    });
  };

  return <div className={`leading-relaxed ${className}`}>{renderMathSegments(content)}</div>;
};
