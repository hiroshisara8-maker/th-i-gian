import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Clock, 
  CheckSquare, 
  Calendar, 
  Wallet, 
  Bell, 
  Plus, 
  Sparkles,
  Settings,
  Sun,
  Coffee,
  Moon
} from 'lucide-react';
import { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenQuickAdd: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenQuickAdd,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Xin chào');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds}`);

      if (hours >= 5 && hours < 12) {
        setGreeting('Chào buổi sáng');
      } else if (hours >= 12 && hours < 18) {
        setGreeting('Buổi chiều hiệu quả');
      } else {
        setGreeting('Buổi tối an lành');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'tong_quan' as AppTab, label: 'Lịch sinh hoạt', icon: CalendarDays },
    { id: 'thoi_khoa_bieu' as AppTab, label: 'Thời khóa biểu', icon: Clock },
    { id: 'cong_viec' as AppTab, label: 'Ghi chú công việc', icon: CheckSquare },
    { id: 'quan_ly_lich' as AppTab, label: 'Quản lý lịch', icon: Calendar },
    { id: 'chi_tieu' as AppTab, label: 'Quản lý chi tiêu', icon: Wallet },
    { id: 'cai_dat' as AppTab, label: 'Cài đặt & Dữ liệu', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Greeting */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-50 border border-amber-200/90 flex items-center justify-center text-amber-800 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 tracking-tight text-base sm:text-lg">
                  Sinh Hoạt Cá Nhân
                </span>
                <span className="hidden md:inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/60 font-medium">
                  {greeting}
                </span>
              </div>
              <p className="text-xs text-stone-600 hidden sm:block">
                Lịch học • Công việc • Nhắc nhở • Chi tiêu
              </p>
            </div>
          </div>

          {/* Quick Actions & Live Clock */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs font-mono text-stone-600">
              <Clock className="w-3.5 h-3.5 text-stone-600" />
              <span>{timeStr || '00:00:00'}</span>
            </div>

            {/* Notification bell button */}
            <button
              id="header-notification-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              title="Thông báo và nhắc nhở"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Quick Add Button */}
            <button
              id="header-quick-add-btn"
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-medium shadow-xs transition-all duration-150 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Thêm mới</span>
              <span className="sm:hidden">Thêm</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation - Soft, clear, and horizontally scrollable on mobile */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none border-t border-stone-100">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 border border-amber-200/90 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-800' : 'text-stone-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
