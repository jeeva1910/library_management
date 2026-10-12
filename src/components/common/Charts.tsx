import React from 'react';

interface BarChartProps {
  data: { label: string; value: number; secondaryLabel?: string }[];
  title: string;
  subtitle?: string;
  barColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  subtitle,
  barColor = 'bg-blue-600',
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="space-y-3">
        {data.map((item, idx) => {
          const percentage = Math.round((item.value / maxValue) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span className="truncate max-w-[200px]" title={item.label}>
                  {item.label}
                </span>
                <span className="font-mono font-semibold text-slate-900 ml-2">
                  {item.value} {item.secondaryLabel || 'borrows'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${Math.max(percentage, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface AreaTrendChartProps {
  data: { month: string; count: number }[];
  title: string;
  subtitle?: string;
}

export const AreaTrendChart: React.FC<AreaTrendChartProps> = ({ data, title, subtitle }) => {
  const max = Math.max(...data.map((d) => d.count), 10);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 300;
      const y = 120 - (d.count / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,120 ${points} 300,120`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative w-full h-36">
        <svg viewBox="0 0 300 130" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="70" x2="300" y2="70" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="120" x2="300" y2="120" stroke="#e2e8f0" strokeWidth="1" />

          {/* Area Fill */}
          <polygon points={areaPoints} fill="url(#areaGradient)" />

          {/* Line */}
          <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 300;
            const y = 120 - (d.count / max) * 100;
            return (
              <circle key={i} cx={x} cy={y} r="3.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between items-center text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
        {data.map((d, i) => (
          <span key={i}>{d.month}</span>
        ))}
      </div>
    </div>
  );
};

interface CategoryDonutProps {
  data: { category: string; count: number }[];
  title: string;
}

export const CategoryDonutChart: React.FC<CategoryDonutProps> = ({ data, title }) => {
  const total = data.reduce((acc, d) => acc + d.count, 0);
  const colors = [
    'bg-blue-600 border-blue-600 text-blue-600',
    'bg-indigo-600 border-indigo-600 text-indigo-600',
    'bg-teal-600 border-teal-600 text-teal-600',
    'bg-amber-500 border-amber-500 text-amber-500',
    'bg-sky-500 border-sky-500 text-sky-500',
    'bg-rose-500 border-rose-500 text-rose-500',
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>

      {/* Progress track */}
      <div className="w-full bg-slate-100 h-3 rounded-full flex overflow-hidden mb-5">
        {data.map((item, idx) => {
          const pct = (item.count / (total || 1)) * 100;
          const bg = colors[idx % colors.length].split(' ')[0];
          return (
            <div
              key={idx}
              className={`h-full ${bg} transition-all duration-300`}
              style={{ width: `${pct}%` }}
              title={`${item.category}: ${item.count} (${Math.round(pct)}%)`}
            />
          );
        })}
      </div>

      <div className="space-y-2">
        {data.map((item, idx) => {
          const pct = Math.round((item.count / (total || 1)) * 100);
          const colorClass = colors[idx % colors.length].split(' ')[0];
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                <span className="text-slate-700 truncate">{item.category}</span>
              </div>
              <div className="font-mono text-slate-900 font-medium ml-2">
                {item.count} <span className="text-slate-400 font-sans">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
