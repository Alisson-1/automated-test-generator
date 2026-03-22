import { useState, useCallback } from 'react';
import { BookOpen, FileText, ClipboardCheck } from 'lucide-react';
import type { NavItem } from '../types';

const NAV_ITEMS: NavItem[] = [
  { label: 'Questions', path: '/questions', icon: BookOpen },
  { label: 'Exams', path: '/exams', icon: FileText },
  { label: 'Grading', path: '/grading', icon: ClipboardCheck },
];

export function useLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return { navItems: NAV_ITEMS, sidebarOpen, openSidebar, closeSidebar };
}
