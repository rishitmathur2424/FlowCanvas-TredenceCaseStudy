import React from 'react';
import { useAutomations } from '../../hooks';
import { nanoid } from 'nanoid';
import { Plus, Trash2 } from 'lucide-react';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
  KeyValuePair,
} from '../../types';

// ─── Shared field wrappers ────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10.5px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest pb-1.5" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-soft)' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="fc-input"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="fc-input"
      style={{ resize: 'none' }}
    />
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="fc-input fc-select">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function NumberInput({ value, onChange, min = 0, max = 100, suffix }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="fc-input"
        style={{ flex: 1 }}
      />
      {suffix && <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{suffix}</span>}
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 0',
        textAlign: 'left',
      }}
    >
      {/* Track */}
      <div style={{
        position: 'relative',
        width: 36,
        height: 20,
        borderRadius: 99,
        background: value ? 'var(--accent)' : 'var(--border-mid)',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}>
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: 2,
          left: 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          transform: value ? 'translateX(16px)' : 'translateX(0)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.4, 0.64, 1)',
        }} />
      </div>
      {/* Label */}
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', userSelect: 'none' }}>
        {label}
      </span>
      {/* State indicator */}
      <span style={{
        marginLeft: 'auto',
        fontSize: 11,
        fontWeight: 500,
        color: value ? 'var(--accent)' : 'var(--text-muted)',
      }}>
        {value ? 'On' : 'Off'}
      </span>
    </button>
  );
}

function KVEditor({ pairs, onChange }: { pairs: KeyValuePair[]; onChange: (p: KeyValuePair[]) => void }) {
  const add = () => onChange([...pairs, { id: nanoid(6), key: '', value: '' }]);
  const remove = (id: string) => onChange(pairs.filter(p => p.id !== id));
  const update = (id: string, field: 'key' | 'value', val: string) =>
    onChange(pairs.map(p => p.id === id ? { ...p, [field]: val } : p));

  return (
    <div className="space-y-1.5">
      {pairs.map(pair => (
        <div key={pair.id} className="flex items-center gap-1">
          <input
            value={pair.key}
            onChange={e => update(pair.id, 'key', e.target.value)}
            placeholder="Key"
            className="fc-input"
            style={{ flex: 1, fontSize: 11, padding: '5px 7px' }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>:</span>
          <input
            value={pair.value}
            onChange={e => update(pair.id, 'value', e.target.value)}
            placeholder="Value"
            className="fc-input"
            style={{ flex: 1, fontSize: 11, padding: '5px 7px' }}
          />
          <button
            onClick={() => remove(pair.id)}
            className="fc-btn-ghost"
            style={{ padding: '4px', color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}
      <button onClick={add} className="fc-btn-ghost" style={{ padding: '3px 0', fontSize: 11 }}>
        <Plus size={11} />
        Add field
      </button>
    </div>
  );
}

// ─── Node Forms ───────────────────────────────────────────────────────────────

export function StartNodeForm({ data, onChange }: { data: StartNodeData; onChange: (d: Partial<StartNodeData>) => void }) {
  return (
    <div className="space-y-5">
      <Section title="Basic">
        <Field label="Title">
          <Input value={data.title} onChange={v => onChange({ title: v })} placeholder="Workflow start" />
        </Field>
      </Section>
      <Section title="Metadata">
        <KVEditor pairs={data.metadata} onChange={metadata => onChange({ metadata })} />
      </Section>
    </div>
  );
}

export function TaskNodeForm({ data, onChange }: { data: TaskNodeData; onChange: (d: Partial<TaskNodeData>) => void }) {
  return (
    <div className="space-y-5">
      <Section title="Basic">
        <Field label="Title" required>
          <Input value={data.title} onChange={v => onChange({ title: v })} placeholder="Task title" />
        </Field>
        <Field label="Description">
          <Textarea value={data.description} onChange={v => onChange({ description: v })} placeholder="What needs to be done..." rows={2} />
        </Field>
      </Section>
      <Section title="Assignment">
        <Field label="Assignee">
          <Input value={data.assignee} onChange={v => onChange({ assignee: v })} placeholder="Team or person" />
        </Field>
        <Field label="Due Date">
          <Input type="date" value={data.dueDate} onChange={v => onChange({ dueDate: v })} />
        </Field>
      </Section>
      <Section title="Custom Fields">
        <KVEditor pairs={data.customFields} onChange={customFields => onChange({ customFields })} />
      </Section>
    </div>
  );
}

const ROLES = ['Manager', 'HR', 'Director', 'CEO', 'Team Lead'] as const;

export function ApprovalNodeForm({ data, onChange }: { data: ApprovalNodeData; onChange: (d: Partial<ApprovalNodeData>) => void }) {
  return (
    <div className="space-y-5">
      <Section title="Basic">
        <Field label="Title">
          <Input value={data.title} onChange={v => onChange({ title: v })} placeholder="Approval title" />
        </Field>
      </Section>
      <Section title="Settings">
        <Field label="Approver Role">
          <Select
            value={data.approverRole}
            onChange={v => onChange({ approverRole: v as ApprovalNodeData['approverRole'] })}
            options={ROLES.map(r => ({ value: r, label: r }))}
          />
        </Field>
        <Field label="Auto-approve Threshold">
          <NumberInput
            value={data.autoApproveThreshold}
            onChange={v => onChange({ autoApproveThreshold: v })}
            suffix="%"
          />
          <p className="text-[10.5px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Set to 0 to disable. Above 0%, auto-approves based on confidence score.
          </p>
        </Field>
      </Section>
    </div>
  );
}

export function AutomatedNodeForm({ data, onChange }: { data: AutomatedNodeData; onChange: (d: Partial<AutomatedNodeData>) => void }) {
  const { automations, loading } = useAutomations();
  const selected = automations.find(a => a.id === data.actionId);

  const handleAction = (actionId: string) => {
    const action = automations.find(a => a.id === actionId);
    const params: Record<string, string> = {};
    action?.params.forEach(p => { params[p] = data.params?.[p] ?? ''; });
    onChange({ actionId, params });
  };

  return (
    <div className="space-y-5">
      <Section title="Basic">
        <Field label="Title">
          <Input value={data.title} onChange={v => onChange({ title: v })} placeholder="Step title" />
        </Field>
      </Section>
      <Section title="Action">
        <Field label="Select Action">
          {loading
            ? <p className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>Loading…</p>
            : (
              <Select
                value={data.actionId}
                onChange={handleAction}
                placeholder="— Choose an action —"
                options={automations.map(a => ({ value: a.id, label: a.label }))}
              />
            )
          }
        </Field>
      </Section>
      {selected && selected.params.length > 0 && (
        <Section title="Parameters">
          {selected.params.map(param => (
            <Field key={param} label={param}>
              <Input
                value={data.params?.[param] ?? ''}
                onChange={v => onChange({ params: { ...data.params, [param]: v } })}
                placeholder={`Value for ${param}`}
              />
            </Field>
          ))}
        </Section>
      )}
    </div>
  );
}

export function EndNodeForm({ data, onChange }: { data: EndNodeData; onChange: (d: Partial<EndNodeData>) => void }) {
  return (
    <div className="space-y-5">
      <Section title="Completion">
        <Field label="End Message">
          <Textarea
            value={data.endMessage}
            onChange={v => onChange({ endMessage: v })}
            placeholder="Message shown when workflow completes…"
          />
        </Field>
        <Toggle
          value={data.showSummary}
          onChange={v => onChange({ showSummary: v })}
          label="Show workflow summary"
        />
      </Section>
    </div>
  );
}
