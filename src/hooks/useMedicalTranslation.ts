import { useState } from 'react';
import { translateMedicalTerm } from '../api/luneApi';

export default function useMedicalTranslation() {
  const [translation, setTranslation] = useState<any | null>(null);
  const [translationHistory, setTranslationHistory] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const translateTerm = async (term: string, targetLanguage = 'en') => {
    setLoading(true);
    setError(null);
    try {
      const res = await translateMedicalTerm(term, targetLanguage);
      if (res.success) {
        setTranslation(res.data);
        setTranslationHistory((h) => [{ term, targetLanguage, timestamp: new Date().toISOString(), result: res.data }, ...h].slice(0, 50));
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

  const clearTranslation = () => {
    setTranslation(null);
    setError(null);
  };

  return { translation, translationHistory, loading, error, translateTerm, clearTranslation } as const;
}
