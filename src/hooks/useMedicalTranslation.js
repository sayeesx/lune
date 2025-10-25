import { useState } from 'react';
import { translateMedicalTerm } from '../api/luneApi';

export default function useMedicalTranslation() {
  const [translation, setTranslation] = useState(null);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const translateTerm = async (term, targetLanguage = 'en') => {
    setLoading(true);
    setError(null);
    try {
      const res = await translateMedicalTerm(term, targetLanguage);
      if (res.success) {
        setTranslation(res.data);
        setTranslationHistory((h) => [ { term, targetLanguage, timestamp: new Date().toISOString(), result: res.data }, ...h ].slice(0, 50));
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

  const clearTranslation = () => {
    setTranslation(null);
    setError(null);
  };

  return { translation, translationHistory, loading, error, translateTerm, clearTranslation };
}
