'use client';
import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  source: string;
  imageUrl?: string;
}

export default function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/news');
      const json = await res.json();
      if (json.success) {
        setNews(json.data);
        setLastUpdated(new Date());
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // auto-refresh every 30 mins
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  return (
    <div className="fintrix-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8DFE5] dark:border-white/[0.07]">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#53259A] dark:text-[#a78bfa]" />
          <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">
            Financial News
          </h2>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-semibold">
            LIVE
          </span>
        </div>
        <button
          onClick={fetchNews}
          className="p-1.5 rounded-lg hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white transition-colors"
          title="Refresh news"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="divide-y divide-[#F4F7FA] dark:divide-white/[0.04] max-h-[360px] overflow-y-auto">
        <AnimatePresence>
          {isLoading && news.length === 0 ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse space-y-1.5">
                  <div className="h-3 bg-[#F4F7FA] dark:bg-white/5 rounded w-full" />
                  <div className="h-3 bg-[#F4F7FA] dark:bg-white/5 rounded w-3/4" />
                  <div className="h-2 bg-[#F4F7FA] dark:bg-white/5 rounded w-1/4 mt-1" />
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="p-6 text-center text-[#757575] text-[13px]">
              No news available. Add your NewsData API key.
            </div>
          ) : (
            news.map((item, idx) => (
              <motion.a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#F4F7FA]/60 dark:hover:bg-white/[0.02] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#53259A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Newspaper className="w-3.5 h-3.5 text-[#53259A] dark:text-[#a78bfa]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-medium text-[#0E1C29] dark:text-white leading-snug line-clamp-2 group-hover:text-[#53259A] dark:group-hover:text-[#a78bfa] transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10.5px] text-[#757575] font-medium capitalize">{item.source}</span>
                    <span className="text-[10px] text-[#D8DFE5] dark:text-white/20">•</span>
                    <span className="text-[10.5px] text-[#757575]">{timeAgo(item.pubDate)}</span>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-[#D8DFE5] dark:text-white/20 flex-shrink-0 mt-1 group-hover:text-[#53259A] dark:group-hover:text-[#a78bfa] transition-colors" />
              </motion.a>
            ))
          )}
        </AnimatePresence>
      </div>

      {lastUpdated && (
        <div className="px-5 py-2 border-t border-[#F4F7FA] dark:border-white/[0.04]">
          <p className="text-[10px] text-[#757575]">Updated {lastUpdated.toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
}
