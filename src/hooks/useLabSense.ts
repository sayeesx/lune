import { useState } from 'react';
import { interpretLabResults } from '../api/luneApi';

export default function useLabSense() {
  const [interpretation, setInterpretation] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const interpretLabs = async (labResults: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await interpretLabResults(labResults);
      if (res.success) {
        setInterpretation(res.data);
      } else {
        setError(res.error);
      }
      return res;
    } catch (e: any) {
      setError(e?.message || 'An unexpected error occurred');
      return { success: false, data: null, error: e?.message };
    } finally {
      setLoading(false);
    }
  };

  const clearInterpretation = () => {
    setInterpretation(null);
    setError(null);
  };

  return { interpretation, loading, error, interpretLabs, clearInterpretation } as const;
}
