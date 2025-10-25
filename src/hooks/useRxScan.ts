import { useState } from 'react';
import { analyzePrescription } from '../api/luneApi';

export default function useRxScan() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzePrescription(text);
      if (res.success) {
        setResult(res.data);
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

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return { result, loading, error, analyzePrescription: analyze, clearResult } as const;
}
