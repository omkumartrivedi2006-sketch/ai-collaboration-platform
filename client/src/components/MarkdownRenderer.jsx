import React from 'react';
import { Copy, Check } from 'lucide-react';

export const MarkdownRenderer = ({ content = '' }) => {
  const [copiedIndex, setCopiedIndex] = React.useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content) return null;

  // Simple and highly effective regex-based markdown parser
  const renderTokens = () => {
    const lines = content.split('\n');
    const elements = [];
    let key = 0;
    
    let inCodeBlock = false;
    let codeBlockLines = [];
    let codeBlockLang = '';

    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];

    const flushCodeBlock = () => {
      if (codeBlockLines.length > 0) {
        const codeText = codeBlockLines.join('\n');
        const currentIndex = key++;
        elements.push(
          <div key={currentIndex} className="relative my-3 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 text-slate-100 font-mono text-[10px]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 text-slate-400 font-sans font-bold text-[9px] uppercase tracking-wider border-b border-slate-850">
              <span>{codeBlockLang || 'code'}</span>
              <button
                onClick={() => copyToClipboard(codeText, currentIndex)}
                className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBlockLines = [];
        codeBlockLang = '';
        inCodeBlock = false;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0 || tableHeaders.length > 0) {
        elements.push(
          <div key={key++} className="overflow-x-auto my-3 border border-slate-150 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  {tableHeaders.map((th, i) => (
                    <th key={i} className="px-3 py-2 text-left">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-150 font-medium text-slate-650">
                {tableRows.map((tr, i) => (
                  <tr key={i}>
                    {tr.map((td, j) => (
                      <td key={j} className="px-3 py-2">{td}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code Block Toggles
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          inCodeBlock = true;
          codeBlockLang = line.replace('```', '').trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        continue;
      }

      // Tables parsing
      if (line.trim().startsWith('|')) {
        const cells = line
          .split('|')
          .map(c => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

        if (cells.every(c => c.startsWith('---') || c.startsWith(':---'))) {
          // delimiter line, skip
          continue;
        }

        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        continue;
      } else {
        if (inTable) {
          flushTable();
        }
      }

      // Headers parsing
      if (line.startsWith('# ')) {
        elements.push(<h1 key={key++} className="text-sm font-black text-slate-900 mt-4 mb-2 tracking-tight">{parseInline(line.substring(2))}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={key++} className="text-xs font-black text-slate-800 mt-3.5 mb-1.5 tracking-tight uppercase">{parseInline(line.substring(3))}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={key++} className="text-[10px] font-black text-slate-750 mt-3 mb-1 uppercase tracking-wider">{parseInline(line.substring(4))}</h3>);
      }
      // Bullet list items
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <li key={key++} className="ml-4 list-disc py-0.5 text-slate-650 font-medium">
            {parseInline(line.trim().substring(2))}
          </li>
        );
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push(<div key={key++} className="h-1.5" />);
      }
      // Normal Paragraphs
      else {
        elements.push(<p key={key++} className="py-1 text-slate-650 leading-relaxed font-medium">{parseInline(line)}</p>);
      }
    }

    if (inCodeBlock) flushCodeBlock();
    if (inTable) flushTable();

    return elements;
  };

  // Parses inline elements: Bold **text**, italic *text*, `code` snippets
  const parseInline = (text) => {
    let parts = [text];

    // Bold parser
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const regex = /\*\*(.*?)\*\*/g;
      const subParts = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          subParts.push(part.substring(lastIndex, match.index));
        }
        subParts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.length) {
        subParts.push(part.substring(lastIndex));
      }
      return subParts;
    });

    // Code snippet parser
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const regex = /`(.*?)`/g;
      const subParts = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          subParts.push(part.substring(lastIndex, match.index));
        }
        subParts.push(
          <code key={match.index} className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-[10px] font-mono text-indigo-600">
            {match[1]}
          </code>
        );
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.length) {
        subParts.push(part.substring(lastIndex));
      }
      return subParts;
    });

    return parts;
  };

  return <div className="space-y-1 font-sans text-xs">{renderTokens()}</div>;
};

export default MarkdownRenderer;
