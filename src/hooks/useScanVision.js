import { useState } from 'react';
import { analyzeMedicalImage } from '../api/luneApi';

export default function useScanVision() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeMedicalImageLocal = async (imageUri, message = '') => {
    setLoading(true);
    setError(null);
    try {
      // Placeholder: convert imageUri to expected payload if needed
      const payload = { imageUri, message };
      const res = await analyzeMedicalImage(payload);
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

  return { result, loading, error, analyzeMedicalImage: analyzeMedicalImageLocal, clearResult };
}
