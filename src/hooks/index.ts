import { useEffect, useState } from 'react';
import { getAutomations } from '../api/workflowApi';
import type { AutomationAction } from '../types';

export function useAutomations() {
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAutomations().then(data => {
      setAutomations(data);
      setLoading(false);
    });
  }, []);

  return { automations, loading };
}

export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const combo = [
        e.metaKey || e.ctrlKey ? 'mod' : '',
        e.shiftKey ? 'shift' : '',
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      if (handlers[combo]) {
        e.preventDefault();
        handlers[combo]();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
