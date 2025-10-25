import { useState } from 'react';
import { getMedicineInfo } from '../api/luneApi';

export default function useMedGuide() {
  const [medicineInfo, setMedicineInfo] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchMedicine = async (medicineName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMedicineInfo(medicineName);
      if (res.success) {
        setMedicineInfo(res.data);
        setSearchHistory((h) => [ { term: medicineName, timestamp: new Date().toISOString() }, ...h ].slice(0, 20));
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

  const clearMedicineInfo = () => {
    setMedicineInfo(null);
    setError(null);
  };

  return { medicineInfo, searchHistory, loading, error, searchMedicine, clearMedicineInfo };
}
