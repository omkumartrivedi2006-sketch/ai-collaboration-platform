import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAI } from '../context/AIContext';
import meetingService from '../services/meetingService';
import SummaryCard from '../components/SummaryCard';
import TaskSuggestionCard from '../components/TaskSuggestionCard';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';

export const MeetingSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { summarizeMeetingAI, generateTasksFromAI } = useAI();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [report, setReport] = useState(null);
  const [suggestedTasks, setSuggestedTasks] = useState([]);

  useEffect(() => {
    meetingService.getMeeting(id)
      .then(res => {
        setMeeting(res.meeting);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const summaryReport = await summarizeMeetingAI(id);
      setReport(summaryReport);
    } catch (e) {
      console.error(e);
    } finally {
      setSummarizing(false);
    }
  };

  const handleGenerateTasks = async (summaryText) => {
    setGeneratingTasks(true);
    try {
      const tasks = await generateTasksFromAI(summaryText);
      setSuggestedTasks(tasks);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingTasks(false);
    }
  };

  if (loading) {
    return <Loader size="lg" message="Loading meeting context..." fullPage />;
  }

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3 font-sans text-xs">
        <AlertTriangle className="h-10 w-10 text-rose-500" />
        <h3 className="text-sm font-bold text-slate-800">Meeting Not Found</h3>
        <button onClick={() => navigate('/meetings')} className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-lg cursor-pointer">
          Return to Planner
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Back navigation */}
      <div>
        <button
          onClick={() => navigate(`/meetings/${meeting.id}`)}
          className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:text-indigo-650 cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to Meeting Details</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-850 tracking-tight">AI Meeting Summarizer</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
            Auto-generate minutes, decisions, and track tasks for: {meeting.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Drive Area: Meeting notes summary trigger */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Trigger Panel */}
          {!report && (
            <Card title="Meeting Sync Context" subtitle="Generate high-fidelity summary metrics">
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2">
                  <h4 className="font-bold text-slate-700">Minutes Context:</h4>
                  <p className="text-slate-550 font-medium italic">
                    {meeting.notes ? meeting.notes.substring(0, 300) + '...' : 'No manual notes recorded.'}
                  </p>
                  <h4 className="font-bold text-slate-700 mt-2">Chat Context:</h4>
                  <p className="text-slate-550 font-medium italic">
                    {meeting.chatMessages?.length || 0} chat messages logged inside database.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled={summarizing}
                    onClick={handleSummarize}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{summarizing ? 'Analyzing Minutes...' : 'Generate AI Summary'}</span>
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Render Summary Markdown */}
          {report && (
            <SummaryCard
              report={report}
              onGenerateTasks={handleGenerateTasks}
              loadingTasks={generatingTasks}
            />
          )}

        </div>

        {/* Right column: suggested tasks lists */}
        <div className="space-y-6">
          {suggestedTasks.length > 0 && (
            <TaskSuggestionCard
              tasks={suggestedTasks}
              onComplete={() => setSuggestedTasks([])}
            />
          )}
        </div>

      </div>

    </div>
  );
};

export default MeetingSummary;
