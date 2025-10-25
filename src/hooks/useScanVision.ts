import { useState } from 'react';
import { analyzeMedicalImage } from '../api/luneApi';

export default function useScanVision() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeMedicalImageLocal = async (imageUri: string | any, message = '') => {
    setLoading(true);
    setError(null);
    try {
      const payload = { imageUri, message };
      const res = await analyzeMedicalImage(payload);
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

  return { result, loading, error, analyzeMedicalImage: analyzeMedicalImageLocal, clearResult } as const;
}
