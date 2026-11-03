import React, { useState, useEffect } from 'react';
import {
  recordVisitorHit,
  getHitCounterData,
  sendVisitorLeave,
} from '../utils/hitCounter';

/**
 * HitCounterBanner:
 * Real-time visitor counter bar above footer displaying total visitors,
 * visits today, and live active users fetched from /api/visitors.
 */
export default function HitCounterBanner() {
  const [stats, setStats] = useState(() => getHitCounterData());
  const [loading, setLoading] = useState(() => {
    const cached = getHitCounterData();
    return !cached || !cached.totalVisitors;
  });

  useEffect(() => {
    let mounted = true;

    // Initial hit recording / fetch (once per mount/session)
    recordVisitorHit()
      .then((data) => {
        if (mounted && data) {
          setStats(data);
        }
      })
      .catch(() => {
        /* fallback to cached data */
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Tab close / navigation away: mark offline
    const handleLeave = () => {
      sendVisitorLeave();
    };

    window.addEventListener('pagehide', handleLeave);
    window.addEventListener('beforeunload', handleLeave);

    return () => {
      mounted = false;
      window.removeEventListener('pagehide', handleLeave);
      window.removeEventListener('beforeunload', handleLeave);
      sendVisitorLeave();
    };
  }, []);

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

  return (
    <div className="w-full bg-gradient-to-r from-[#d0e5f7] via-[#def0fc] to-[#d0e5f7] text-slate-700 border-t-2 border-b border-sky-300/80 py-2.5 px-4 text-xs select-none shadow-xs font-semibold">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Left Live Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="font-black text-slate-900 tracking-wide text-xs">
            OneVishwam Activity
          </span>
        </div>

        {/* Live Visitor Stats */}
        <div className="flex items-center gap-4 text-xs font-bold flex-wrap sm:flex-nowrap">
          {/* Total Visitors */}
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-users text-amber-600 text-xs" />
            <span className="text-slate-700 font-bold">Total Visitors:</span>
            {loading ? (
              <span className="inline-block w-12 h-3 bg-sky-200 animate-pulse rounded" />
            ) : (
              <strong className="text-slate-950 font-black">
                {formatNumber(stats.totalVisitors || stats.totalHits)}
              </strong>
            )}
          </div>

          {/* Visits Today */}
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-bolt text-amber-600 text-xs" />
            <span className="text-slate-700 font-bold">Visits Today:</span>
            {loading ? (
              <span className="inline-block w-8 h-3 bg-sky-200 animate-pulse rounded" />
            ) : (
              <strong className="text-slate-950 font-black">
                {formatNumber(stats.visitsToday)}
              </strong>
            )}
          </div>

          {/* Online Now */}
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-circle text-emerald-600 text-[8px]" />
            <span className="text-slate-700 font-bold">Online Now:</span>
            {loading ? (
              <span className="inline-block w-8 h-3 bg-sky-200 animate-pulse rounded" />
            ) : (
              <strong className="text-emerald-700 font-black">
                {formatNumber(stats.activeVisitors)}
              </strong>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
