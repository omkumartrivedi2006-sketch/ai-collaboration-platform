import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAI } from '../context/AIContext';
import Card from '../components/Card';
import Button from '../components/Button';
import SummaryCard from '../components/SummaryCard';
import Loader from '../components/Loader';
import { ArrowLeft, Sparkles, FileText } from 'lucide-react';

export const DocumentSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { summarizeDocAI } = useAI();

  // Try loading from location state (redirect from Files Explorer)
  const initialContent = location.state?.fileContent || '';
  const initialFilename = location.state?.fileName || '';

  const [content, setContent] = useState(initialContent);
  const [filename, setFilename] = useState(initialFilename);
  const [summarizing, setSummarizing] = useState(false);
  const [report, setReport] = useState(null);

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!content.trim() || !filename.trim()) return;

    setSummarizing(true);
    try {
      const summaryReport = await summarizeDocAI(content, filename);
      setReport(summaryReport);
    } catch (e) {
      console.error(e);
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Back link */}
      <div>
        <button
          onClick={() => navigate('/files')}
          className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:text-indigo-650 cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to File Explorer</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">AI Document Summarizer</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
            Audit and extract key points, action recommendations, and risks from text documents
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: editor/input */}
        <div className="lg:col-span-1">
          <Card title="Document Source" subtitle="Audit text file content directly">
            <form onSubmit={handleSummarize} className="space-y-4">
              
              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Document Filename</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. quarterly_goals.md"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Document Raw Text</label>
                <textarea
                  required
                  rows={14}
                  placeholder="Paste document body text, markdown, or code here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={summarizing || !content.trim()}
                  loading={summarizing}
                  className="w-full cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Audit & Summarize Document</span>
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Right column: summary results */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-slate-805 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-indigo-500" />
            Analysis Summary Result
          </h3>

          {report ? (
            <SummaryCard report={report} />
          ) : (
            <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 font-bold text-slate-400 italic">
              Paste file contents on the left and click Summarize to begin AI auditing.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default DocumentSummary;
