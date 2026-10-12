import React from 'react';
import { BookOpen, Code2, Cpu, FileText, Globe, Atom, Binary, BarChart3, FlaskConical } from 'lucide-react';

interface BookCoverProps {
  title: string;
  author: string;
  category: string;
  gradient?: string;
  className?: string;
}

export const BookCoverPlaceholder: React.FC<BookCoverProps> = ({
  title,
  author,
  category,
  gradient = 'from-blue-800 via-indigo-900 to-slate-900',
  className = 'h-52 w-full',
}) => {
  const getIcon = () => {
    const cat = category.toLowerCase();
    if (cat.includes('computer') || cat.includes('algorithm') || cat.includes('code')) {
      return <Code2 className="w-8 h-8 text-blue-200 opacity-90" />;
    }
    if (cat.includes('intelligence') || cat.includes('ai') || cat.includes('data')) {
      return <Cpu className="w-8 h-8 text-cyan-200 opacity-90" />;
    }
    if (cat.includes('physics') || cat.includes('science')) {
      return <Atom className="w-8 h-8 text-indigo-200 opacity-90" />;
    }
    if (cat.includes('bio') || cat.includes('cell')) {
      return <FlaskConical className="w-8 h-8 text-emerald-200 opacity-90" />;
    }
    if (cat.includes('economics') || cat.includes('business')) {
      return <BarChart3 className="w-8 h-8 text-amber-200 opacity-90" />;
    }
    if (cat.includes('math')) {
      return <Binary className="w-8 h-8 text-sky-200 opacity-90" />;
    }
    if (cat.includes('lit')) {
      return <Globe className="w-8 h-8 text-rose-200 opacity-90" />;
    }
    return <BookOpen className="w-8 h-8 text-slate-200 opacity-90" />;
  };

  return (
    <div
      className={`relative rounded-lg bg-gradient-to-br ${gradient} p-4 text-white shadow-md overflow-hidden flex flex-col justify-between select-none ${className}`}
    >
      {/* Decorative book spine highlight & geometric texture overlay */}
      <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-white/10 border-r border-white/15" />
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />

      {/* Top Section: Category & Icon */}
      <div className="pl-2 flex items-start justify-between gap-2 z-10">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded">
          {category}
        </span>
        <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm shadow-inner">
          {getIcon()}
        </div>
      </div>

      {/* Center/Bottom Section: Title and Author */}
      <div className="pl-2 pr-1 z-10 mt-auto">
        <h4 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 text-white drop-shadow-sm">
          {title}
        </h4>
        <p className="text-xs text-white/80 mt-1 line-clamp-1 font-medium italic">
          {author}
        </p>
      </div>

      {/* Book page edges visual simulation at bottom */}
      <div className="absolute bottom-0 right-3 left-3 h-1 bg-amber-50/20 rounded-t-sm" />
    </div>
  );
};
