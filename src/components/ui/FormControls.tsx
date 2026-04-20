import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { KeyValuePair } from '../../types';

// ─── Field Label ──────────────────────────────────────────────────────────────

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-ink-600 mb-1 uppercase tracking-wide">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

// ─── Text Input ───────────────────────────────────────────────────────────────

interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

export function TextInput({ value, onChange, placeholder, type = 'text' }: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg
        bg-canvas-50 text-ink-900 placeholder-ink-300
        focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
        transition-all"
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextAreaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextArea({ value, onChange, placeholder, rows = 3 }: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg
        bg-canvas-50 text-ink-900 placeholder-ink-300 resize-none
        focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
        transition-all"
    />
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ value, onChange, options, placeholder }: SelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg
        bg-canvas-50 text-ink-900
        focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
        transition-all appearance-none cursor-pointer"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

// ─── Number Input ─────────────────────────────────────────────────────────────

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function NumberInput({ value, onChange, min = 0, max = 100, step = 1, suffix }: NumberInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="flex-1 px-3 py-2 text-sm border border-ink-200 rounded-lg
          bg-canvas-50 text-ink-900
          focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
          transition-all"
      />
      {suffix && <span className="text-xs text-ink-400">{suffix}</span>}
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

export function Toggle({ value, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 w-full group"
    >
      <div className={`
        relative w-10 h-5 rounded-full transition-colors duration-200
        ${value ? 'bg-accent' : 'bg-ink-200'}
      `}>
        <div className={`
          absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${value ? 'translate-x-5' : 'translate-x-0'}
        `} />
      </div>
      <span className="text-sm text-ink-700">{label}</span>
    </button>
  );
}

// ─── Key-Value Editor ─────────────────────────────────────────────────────────

interface KeyValueEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({ pairs, onChange, keyPlaceholder = 'Key', valuePlaceholder = 'Value' }: KeyValueEditorProps) {
  const addPair = () => {
    onChange([...pairs, { id: nanoid(6), key: '', value: '' }]);
  };

  const removePair = (id: string) => {
    onChange(pairs.filter(p => p.id !== id));
  };

  const updatePair = (id: string, field: 'key' | 'value', value: string) => {
    onChange(pairs.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="space-y-2">
      {pairs.map(pair => (
        <div key={pair.id} className="flex items-center gap-1.5">
          <input
            value={pair.key}
            onChange={e => updatePair(pair.id, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            className="flex-1 px-2.5 py-1.5 text-xs border border-ink-200 rounded-lg
              bg-canvas-50 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent"
          />
          <span className="text-ink-300 text-xs">:</span>
          <input
            value={pair.value}
            onChange={e => updatePair(pair.id, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 px-2.5 py-1.5 text-xs border border-ink-200 rounded-lg
              bg-canvas-50 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent"
          />
          <button
            onClick={() => removePair(pair.id)}
            className="w-6 h-6 rounded-md text-ink-400 hover:text-red-500 hover:bg-red-50
              flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}
      <button
        onClick={addPair}
        className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover
          font-medium transition-colors py-1"
      >
        <Plus size={13} />
        Add field
      </button>
    </div>
  );
}

// ─── Form Section ─────────────────────────────────────────────────────────────

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink-400 border-b border-ink-100 pb-1.5">
        {title}
      </h4>
      {children}
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────

export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  );
}
