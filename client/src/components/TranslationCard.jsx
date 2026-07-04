import React, { useState } from 'react';
import { useAI } from '../context/AIContext';
import { Globe } from 'lucide-react';

export const TranslationCard = ({ originalText }) => {
  const { translateText } = useAI();
  const [lang, setLang] = useState('Spanish');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const result = await translateText(originalText, lang);
      setTranslated(result);
    } catch (e) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 font-sans text-xs space-y-2 mt-2">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 font-bold text-slate-500 uppercase tracking-wider text-[9px]">
          <Globe className="h-3.5 w-3.5 text-indigo-500" /> Translate Message
        </span>
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold text-[10px] focus:outline-none"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Hindi">Hindi</option>
          </select>
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="px-2.5 py-0.5 bg-indigo-650 hover:bg-indigo-750 text-white disabled:bg-slate-200 disabled:text-slate-400 font-bold rounded cursor-pointer transition-colors text-[10px]"
          >
            {loading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </div>
      {translated && (
        <div className="bg-white p-2 border border-slate-150 rounded text-slate-700 italic font-semibold whitespace-pre-wrap leading-relaxed mt-1">
          {translated}
        </div>
      )}
    </div>
  );
};

export default TranslationCard;
