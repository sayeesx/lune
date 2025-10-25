import { useState } from 'react';
import { consultDoctor } from '../api/luneApi';

const makeMessage = (role, content) => ({
  id: `${Date.now()}`,
  role,
  content,
  timestamp: new Date().toISOString(),
});

export default function useDoctor() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (userMessage) => {
    setError(null);
    const userMsgObj = makeMessage('user', userMessage);
    setMessages((m) => [...m, userMsgObj]);
    setLoading(true);
    try {
      const conversationHistory = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await consultDoctor(userMessage, conversationHistory);
      if (res.success) {
        const aiText = res.data?.reply || res.data || 'No response';
        const aiMsgObj = makeMessage('doctor', aiText);
        setMessages((m) => [...m, aiMsgObj]);
      } else {
        const errMsg = res.error || 'Failed to get response from doctor';
        const errObj = makeMessage('error', errMsg);
        setMessages((m) => [...m, errObj]);
        setError(errMsg);
      }
    } catch (e) {
      const errMsg = e?.message || 'An unexpected error occurred';
      setError(errMsg);
      setMessages((m) => [...m, makeMessage('error', errMsg)]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
  };

  return { messages, loading, error, sendMessage, clearConversation };
}
