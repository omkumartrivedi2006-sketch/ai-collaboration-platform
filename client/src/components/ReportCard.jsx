import React, { useState } from 'react';
import Card from './Card';
import MarkdownRenderer from './MarkdownRenderer';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const ReportCard = ({ report }) => {
  const [expanded, setExpanded] = useState(false);

  const typeColors = {
    PROJECT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    MEETING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    TASK: 'bg-blue-50 text-blue-700 border-blue-200',
    SPRINT: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <Card className="border border-slate-200 bg-white hover:border-slate-350 transition-colors">
      <div className="flex items-start justify-between gap-4 font-sans text-xs">
        <div className="space-y-1.5 flex-1 min-w-0" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${typeColors[report.type]}`}>
              {report.type}
            </span>
            {report.project && (
              <span className="bg-slate-100 text-slate-605 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-slate-200">
                {report.project.code}
              </span>
            )}
          </div>
          <h4 className="font-bold text-slate-800 text-xs truncate cursor-pointer hover:text-indigo-650 transition-colors">{report.title}</h4>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Generated on {new Date(report.createdAt).toLocaleString()} {report.creator && `by ${report.creator.name}`}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 text-slate-505 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <MarkdownRenderer content={report.content} />
        </div>
      )}
    </Card>
  );
};

export default ReportCard;
