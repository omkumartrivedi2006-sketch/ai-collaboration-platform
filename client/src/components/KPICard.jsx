import React from 'react';
import Card from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const KPICard = ({ title, value, icon: Icon, description, trend, trendType }) => {
  return (
    <Card className="border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all p-5 font-sans text-xs">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</p>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className="p-2.5 bg-indigo-50/60 border border-indigo-100/60 rounded-xl text-indigo-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        {trend && (
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${
            trendType === 'up' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
              : 'bg-rose-50 text-rose-700 border-rose-150'
          }`}>
            {trendType === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
        <span className="text-[10px] text-slate-400 font-semibold">{description || 'Since last period'}</span>
      </div>
    </Card>
  );
};

export default KPICard;
