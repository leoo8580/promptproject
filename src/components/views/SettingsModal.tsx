/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OllamaStatus } from '../../types';
import {
  X,
  Server,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ollamaStatus: OllamaStatus | null;
  onCheckStatus: (customUrl?: string) => Promise<void>;
  onSelectModel: (model: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  ollamaStatus,
  onCheckStatus,
  onSelectModel,
}) => {
  const [url, setUrl] = useState(ollamaStatus?.endpoint || 'http://localhost:11434');
  const [isChecking, setIsChecking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsChecking(true);
    try {
      await onCheckStatus(url);
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickCommands = [
    { label: '1. Install Ollama on Windows', cmd: 'winget install Ollama.Ollama' },
    { label: '2. Pull Default Model (Llama 3)', cmd: 'ollama pull llama3:latest' },
    { label: '3. Pull Alternative Model (CodeLlama)', cmd: 'ollama pull codellama:latest' },
    { label: '4. Verify Installed Models', cmd: 'ollama list' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border-2 border-violet-100 dark:border-violet-950 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-violet-100 dark:border-slate-800 bg-gradient-to-r from-violet-50/60 to-emerald-50/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Ollama Connection & Runtime Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Alert */}
          <div
            className={`p-4 rounded-2xl border-2 text-xs leading-relaxed ${
              ollamaStatus?.reachable
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
              {ollamaStatus?.reachable ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ollama Local Daemon Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Ollama Standby / Not Detected</span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-90">{ollamaStatus?.message}</p>
          </div>

          {/* Endpoint configuration */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Ollama Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="flex-1 text-xs font-mono px-3 py-2 bg-violet-50/30 dark:bg-slate-800 border-2 border-violet-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <button
                onClick={handleTestConnection}
                disabled={isChecking}
                className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-2xl shadow-xs transition-all whitespace-nowrap"
              >
                {isChecking ? 'Checking...' : 'Test Connection'}
              </button>
            </div>
          </div>

          {/* Installed models picker */}
          {ollamaStatus?.available_models && ollamaStatus.available_models.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800">
                Installed Models
              </label>
              <div className="flex flex-wrap gap-2">
                {ollamaStatus.available_models.map((model) => (
                  <button
                    key={model}
                    onClick={() => onSelectModel(model)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-xl border-2 transition-all ${
                      ollamaStatus.selected_model === model
                        ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                        : 'border-slate-300 hover:bg-slate-50 text-slate-800 font-medium'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PowerShell Setup Guide */}
          <div className="space-y-3 pt-2 border-t-2 border-violet-100">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-emerald-700" />
              <span>Windows PowerShell Commands</span>
            </div>

            <div className="space-y-2">
              {quickCommands.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono flex items-center justify-between gap-3 shadow-2xs border border-slate-800"
                >
                  <div className="truncate">
                    <span className="text-slate-400 text-[10px] block font-sans font-semibold">{item.label}</span>
                    <span className="text-emerald-400 font-bold select-all">{item.cmd}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.cmd, idx)}
                    className="p-1.5 hover:text-white transition-colors shrink-0 text-slate-400 hover:bg-slate-800 rounded-lg"
                    title="Copy command"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-emerald-400 font-bold" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-violet-100 flex justify-end bg-violet-50/20">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-black text-white bg-slate-800 rounded-xl hover:bg-slate-900 shadow-xs transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
