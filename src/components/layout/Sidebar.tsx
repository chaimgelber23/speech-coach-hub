'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Kanban,
  Clock,
  Calendar,
  ListTodo,
  Sparkles,
  BookOpen,
  HelpCircle,
  Mic,
  BookOpenCheck,
  Library,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import NotificationManager from '@/components/NotificationManager';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/research', label: 'Research', icon: FileText },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/schedule', label: 'Schedule', icon: Clock },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/growth', label: 'Growth', icon: Sparkles },
  { href: '/shas', label: 'Shas Tracker', icon: Library },
  { href: '/stories', label: 'Stories', icon: BookOpen },
  { href: '/questions', label: 'Questions', icon: HelpCircle },
  { href: '/practice', label: 'Practice', icon: Mic },
  { href: '/journal', label: 'Journal', icon: BookOpenCheck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'h-screen bg-slate-900 text-white flex flex-col transition-all duration-200 sticky top-0',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-lg font-bold tracking-tight">Coach Hub</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-slate-700 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 flex items-center justify-between">
        {!collapsed && (
          <span className="text-xs text-slate-500">Speech Coach Hub</span>
        )}
        <NotificationManager />
      </div>
    </aside>
  );
}
