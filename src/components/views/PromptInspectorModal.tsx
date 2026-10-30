/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

interface PromptInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: string;
  promptText: string;
  rawResponse: string;
}

export const PromptInspectorModal: React.FC<PromptInspectorModalProps> = ({
  isOpen,
  onClose,
  strategyId,
  promptText,
  rawResponse,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'prompt' | 'raw_response'>('prompt');
  const [copied, setCopied] = useState(false);

  const stratName =
    strategyId === 'strategy_a'
      ? 'Strategy A (Basic Prompting)'
      : strategyId === 'strategy_b'
      ? 'Strategy B (Structured Prompting)'
      : strategyId === 'strategy_c'
      ? 'Strategy C (Few-Shot Prompting)'
      : strategyId;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab === 'prompt' ? promptText : rawResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-2 border-violet-100 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-emerald-50/70">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔍</span>
            <h2 className="text-sm font-black text-slate-900">
              Prompt & Ollama Transmission Inspector — {stratName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-violet-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'prompt'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Exact Prompt Sent to Ollama
            </button>
            <button
              onClick={() => setActiveTab('raw_response')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'raw_response'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Raw Model Response JSON
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-violet-50 transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-violet-600" />
                <span>Copy Payload</span>
              </>
            )}
          </button>
        </div>

        {/* Content Viewport */}
        <div className="p-5 flex-1 overflow-y-auto max-h-[65vh] bg-slate-900 rounded-2xl m-4 border border-slate-800">
          {activeTab === 'prompt' ? (
            <pre className="text-xs font-mono text-slate-100 whitespace-pre-wrap leading-relaxed select-all">
              {promptText}
            </pre>
          ) : (
            <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed select-all">
              {rawResponse || '// No raw response recorded for this strategy'}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-violet-100 flex justify-between items-center text-xs font-medium text-slate-700 bg-violet-50/20">
          <span className="font-mono text-slate-600">Endpoint: http://localhost:11434/api/generate</span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition-colors shadow-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
