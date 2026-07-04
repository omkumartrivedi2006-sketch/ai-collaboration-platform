import React from 'react';
import Card from './Card';
import { MessageSquare, Upload, Video, Sparkles, AlertCircle } from 'lucide-react';

export const ProductivityCard = ({ employeeStats }) => {
  if (!employeeStats) return null;
  const { employee, metrics } = employeeStats;
  const score = metrics.productivityScore || 0;

  // Color logic based on score
  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';
  const scoreBg = score >= 80 ? 'bg-emerald-50 border-emerald-100' : score >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100';

  // Circular progress calculation
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="border border-slate-200 bg-white hover:border-slate-300 transition-colors p-5 font-sans text-xs">
      <div className="flex flex-col md:flex-row items-center gap-6">
        
        {/* Productivity Dial */}
        <div className="relative flex flex-col items-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="text-slate-100"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              className={score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute top-10 flex flex-col items-center">
            <span className="text-2xl font-black text-slate-800">{score}</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Productivity</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="flex-1 space-y-3 w-full">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{employee.name}</h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {employee.designation || 'Team Member'} • {employee.department || 'General'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-[8px] text-slate-400 font-bold uppercase">Messages</p>
                <p className="font-bold text-slate-700">{metrics.messagesSent}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
              <Upload className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-[8px] text-slate-400 font-bold uppercase">Files</p>
                <p className="font-bold text-slate-700">{metrics.filesUploaded}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
              <Video className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-[8px] text-slate-400 font-bold uppercase">Meetings</p>
                <p className="font-bold text-slate-700">{metrics.meetingsAttended}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <div>
                <p className="text-[8px] text-slate-400 font-bold uppercase">AI Queries</p>
                <p className="font-bold text-slate-700">{metrics.aiRequests}</p>
              </div>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border flex gap-2 items-start mt-2 ${scoreBg}`}>
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <p className="font-bold text-[10px]">Productivity Assessment</p>
              <p className="text-[9px] font-medium leading-relaxed">
                {score >= 80 
                  ? 'Exemplary output across tasks. Demonstrating high engagement levels and efficient velocity.'
                  : score >= 50
                  ? 'Steady performance. Progressing on core backlogs, maintaining standard engagement rates.'
                  : 'Productivity metrics indicate potential blockers. Schedule sync to clear tasks.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
};

export default ProductivityCard;
