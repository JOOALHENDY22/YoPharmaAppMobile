import { History, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function SearchHistory() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setHistory(saved);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setHistory([]);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { hour: 'numeric', minute: 'numeric' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <History className="h-8 w-8 text-primary-500" />
          <h1 className="text-3xl font-bold">{t('history.title')}</h1>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory} 
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors flex items-center text-sm font-medium"
          >
            <Trash2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('history.btn_clear')}
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="glass-panel overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
          {history.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.query}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{formatTime(item.time)}</p>
              </div>
              <Link 
                to={`/drug/${encodeURIComponent(item.query)}`} 
                className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-2.5 rounded-full transition-colors"
              >
                <ArrowRight className="h-5 w-5 rtl:rotate-180" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-gray-500">
          {isAr ? 'لا يوجد سجل بحث حتى الآن.' : 'No search history yet.'}
        </div>
      )}
    </div>
  );
}
