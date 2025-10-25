import { useState } from 'react';
import { analyzePrescription } from '../api/luneApi';

export default function useRxScan() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async (text) => {
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
    } catch (e) {
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

  return { result, loading, error, analyzePrescription: analyze, clearResult };
}
