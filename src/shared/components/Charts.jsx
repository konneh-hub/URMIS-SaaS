import React from 'react';

export default function Charts({ title = 'Analytics Overview', series = ['Active', 'Pending', 'Approved'] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className="text-sm text-slate-500">Live</span>
      </div>
      <div className="mt-4 flex h-36 items-end gap-3 rounded-lg bg-slate-50 p-4">
        {series.map((item, index) => (
          <div key={item} className="flex flex-1 flex-col items-center gap-2">
            <div className={`w-full rounded-t-lg bg-gradient-to-t ${index % 2 === 0 ? 'from-blue-500 to-cyan-400' : 'from-violet-500 to-fuchsia-400'}`} style={{ height: `${48 + index * 18}px` }} />
            <span className="text-xs text-slate-500">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
