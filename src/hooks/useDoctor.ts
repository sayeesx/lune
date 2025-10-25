import { useState } from 'react';
import { consultDoctor } from '../api/luneApi';

export type Message = {
  id: string;
  role: 'user' | 'doctor' | 'error';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

const makeMessage = (role: Message['role'], content: string): Message => ({
  id: `${Date.now()}`,
  role,
  content,
  timestamp: new Date().toISOString(),
});

/**
 * useDoctor
 * Lightweight hook that calls the consultDoctor API and exposes loading/error state.
 * It no longer mutates a messages array — the component should manage the message list
 * so the UI can implement animations and typing effects.
 */
export default function useDoctor() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (userMessage: string, conversationHistory: Array<{ role: string; content: string }> = []) => {
    setError(null);
    setLoading(true);
    try {
      const res = await consultDoctor(userMessage, conversationHistory);
      if (!res.success) {
        setError(res.error || 'Failed to get response from doctor');
      }
      return res;
    } catch (e: any) {
      const errMsg = e?.message || 'An unexpected error occurred';
      setError(errMsg);
      return { success: false, data: null, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    // no-op here; the component manages messages
    setError(null);
  };

  return { loading, error, sendMessage, clearConversation } as const;
}
