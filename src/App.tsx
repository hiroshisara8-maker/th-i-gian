import React, { useState, useEffect, useRef } from 'react';
import { 
  TimetableItem, 
  TaskItem, 
  RoutineEvent, 
  ExpenseItem, 
  NotificationAlert, 
  AppTab,
  SoundSettings
} from './types';
import { 
  initialTimetable, 
  initialTasks, 
  initialRoutineEvents, 
  initialExpenses, 
  initialNotifications 
} from './data/initialData';
import { Header } from './components/Header';
import { DailyOverview } from './components/DailyOverview';
import { TimetableSection } from './components/TimetableSection';
import { TaskManagerSection } from './components/TaskManagerSection';
import { ScheduleManagerSection } from './components/ScheduleManagerSection';
import { ExpenseTrackerSection } from './components/ExpenseTrackerSection';
import { SettingsSection } from './components/SettingsSection';
import { NotificationModal } from './components/NotificationModal';
import { QuickAddModal } from './components/QuickAddModal';
import { AudioPlayerWidget } from './components/AudioPlayerWidget';
import { playSoftChime } from './utils/audio';
import { getTodayDateString, getDayOfWeekNumber } from './utils/helpers';
import { BackgroundTimer } from './utils/backgroundTimer';
import { sendSystemAlert } from './utils/systemNotification';

export default function App() {
  // Load from localStorage or fallback to initial data
  const [timetable, setTimetable] = useState<TimetableItem[]>(() => {
    const saved = localStorage.getItem('shcn_timetable');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialTimetable;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('shcn_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialTasks;
  });

  const [routineEvents, setRoutineEvents] = useState<RoutineEvent[]>(() => {
    const saved = localStorage.getItem('shcn_routine');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialRoutineEvents;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('shcn_expenses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialExpenses;
  });

  const [notifications, setNotifications] = useState<NotificationAlert[]>(() => {
    const saved = localStorage.getItem('shcn_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialNotifications;
  });

  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() => {
    const saved = localStorage.getItem('shcn_sound_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      enabled: true,
      volume: 0.7,
      soundType: 'gentle',
      defaultMinutesBefore: 10,
      notifyTimetable: true,
      notifyTasks: true,
      notifyEvents: true,
    };
  });

  const [activeTab, setActiveTab] = useState<AppTab>('tong_quan');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'class' | 'event' | 'expense'>('task');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('shcn_timetable', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('shcn_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('shcn_routine', JSON.stringify(routineEvents));
  }, [routineEvents]);

  useEffect(() => {
    localStorage.setItem('shcn_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('shcn_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('shcn_sound_settings', JSON.stringify(soundSettings));
  }, [soundSettings]);

  // Periodic Reminder Checker (Checks every 30s)
  const alertedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const todayStr = getTodayDateString();
      const currentDayOfWeek = getDayOfWeekNumber();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMin = currentHours * 60 + currentMinutes;

      // 1. Check Tasks (Due today, notify 10 minutes before by default)
      if (soundSettings.notifyTasks) {
        tasks.forEach((task) => {
          if (task.isCompleted || !task.dueTime || task.dueDate !== todayStr) return;
          const reminderMin = task.reminderMinutesBefore !== undefined ? task.reminderMinutesBefore : 10;
          const [tH, tM] = task.dueTime.split(':').map(Number);
          if (isNaN(tH) || isNaN(tM)) return;
          const taskTotalMin = tH * 60 + tM;
          const targetAlertMin = taskTotalMin - reminderMin;

          const reminderKey = `task-${task.id}-${todayStr}-${targetAlertMin}`;
          if (
            currentTotalMin >= targetAlertMin &&
            currentTotalMin <= targetAlertMin + 2 &&
            !alertedIdsRef.current.has(reminderKey)
          ) {
            alertedIdsRef.current.add(reminderKey);
            if (soundSettings.enabled) {
              playSoftChime(soundSettings.soundType, soundSettings.volume);
            }

            const newNotif: NotificationAlert = {
              id: `notif-${Date.now()}-${task.id}`,
              title: `Nhắc việc: ${task.title}`,
              message: `Công việc sắp đến hạn lúc ${task.dueTime} (${reminderMin > 0 ? `chuông báo trước ${reminderMin} phút` : 'đúng giờ'})!`,
              timestamp: `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`,
              type: 'task',
              isRead: false,
            };

            setNotifications((prev) => [newNotif, ...prev]);

            // Dispatch system alert over other apps & flash title
            sendSystemAlert(newNotif.title, newNotif.message, reminderKey);
          }
        });
      }

      // 2. Check Timetable (Classes today, notify 10 minutes before by default)
      if (soundSettings.notifyTimetable) {
        timetable.forEach((item) => {
          if (item.dayOfWeek !== currentDayOfWeek) return;
          const reminderMin = item.reminderMinutesBefore !== undefined ? item.reminderMinutesBefore : 10;
          const [sH, sM] = item.startTime.split(':').map(Number);
          if (isNaN(sH) || isNaN(sM)) return;
          const classTotalMin = sH * 60 + sM;
          const targetAlertMin = classTotalMin - reminderMin;

          const reminderKey = `class-${item.id}-${todayStr}-${targetAlertMin}`;
          if (
            currentTotalMin >= targetAlertMin &&
            currentTotalMin <= targetAlertMin + 2 &&
            !alertedIdsRef.current.has(reminderKey)
          ) {
            alertedIdsRef.current.add(reminderKey);
            if (soundSettings.enabled) {
              playSoftChime(soundSettings.soundType, soundSettings.volume);
            }

            const newNotif: NotificationAlert = {
              id: `notif-${Date.now()}-${item.id}`,
              title: `Lịch học: ${item.subject}`,
              message: `Lớp học bắt đầu lúc ${item.startTime}${item.room ? ` tại ${item.room}` : ''} (${reminderMin > 0 ? `chuông báo trước ${reminderMin} phút` : 'đúng giờ'})!`,
              timestamp: `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`,
              type: 'class',
              isRead: false,
            };

            setNotifications((prev) => [newNotif, ...prev]);

            // Dispatch system alert over other apps & flash title
            sendSystemAlert(newNotif.title, newNotif.message, reminderKey);
          }
        });
      }

      // 3. Check Routine Events (Events today, notify 10 minutes before by default)
      if (soundSettings.notifyEvents) {
        routineEvents.forEach((ev) => {
          if (ev.date !== todayStr) return;
          const reminderMin = ev.reminderMinutesBefore !== undefined ? ev.reminderMinutesBefore : 10;
          const [eH, eM] = ev.startTime.split(':').map(Number);
          if (isNaN(eH) || isNaN(eM)) return;
          const eventTotalMin = eH * 60 + eM;
          const targetAlertMin = eventTotalMin - reminderMin;

          const reminderKey = `event-${ev.id}-${todayStr}-${targetAlertMin}`;
          if (
            currentTotalMin >= targetAlertMin &&
            currentTotalMin <= targetAlertMin + 2 &&
            !alertedIdsRef.current.has(reminderKey)
          ) {
            alertedIdsRef.current.add(reminderKey);
            if (soundSettings.enabled) {
              playSoftChime(soundSettings.soundType, soundSettings.volume);
            }

            const newNotif: NotificationAlert = {
              id: `notif-${Date.now()}-${ev.id}`,
              title: `Sinh hoạt: ${ev.title}`,
              message: `Hoạt động diễn ra lúc ${ev.startTime} (${reminderMin > 0 ? `chuông báo trước ${reminderMin} phút` : 'đúng giờ'})!`,
              timestamp: `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`,
              type: 'event',
              isRead: false,
            };

            setNotifications((prev) => [newNotif, ...prev]);

            // Dispatch system alert over other apps & flash title
            sendSystemAlert(newNotif.title, newNotif.message, reminderKey);
          }
        });
      }
    };

    checkReminders();
    const bgTimer = new BackgroundTimer(checkReminders, 15000);
    bgTimer.start();

    return () => {
      bgTimer.stop();
    };
  }, [tasks, timetable, routineEvents, soundSettings]);

  // Timetable Handlers
  const handleAddClass = (item: Omit<TimetableItem, 'id'>) => {
    const newClass: TimetableItem = {
      ...item,
      id: `tt-${Date.now()}`,
    };
    setTimetable((prev) => [...prev, newClass]);
  };

  const handleEditClass = (item: TimetableItem) => {
    setTimetable((prev) => prev.map((c) => (c.id === item.id ? item : c)));
  };

  const handleDeleteClass = (id: string) => {
    setTimetable((prev) => prev.filter((c) => c.id !== id));
  };

  // Task Handlers
  const handleAddTask = (task: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleEditTask = (task: TaskItem) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isComp = !t.isCompleted;
          if (isComp) playSoftChime(); // Gentle feedback on task completion
          return {
            ...t,
            isCompleted: isComp,
            completedAt: isComp ? `${getTodayDateString()} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : undefined,
          };
        }
        return t;
      })
    );
  };

  // Routine Events Handlers
  const handleAddEvent = (event: Omit<RoutineEvent, 'id'>) => {
    const newEvent: RoutineEvent = {
      ...event,
      id: `rt-${Date.now()}`,
    };
    setRoutineEvents((prev) => [...prev, newEvent]);
  };

  const handleEditEvent = (event: RoutineEvent) => {
    setRoutineEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));
  };

  const handleDeleteEvent = (id: string) => {
    setRoutineEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Expense Handlers
  const handleAddExpense = (item: Omit<ExpenseItem, 'id'>) => {
    const newExpense: ExpenseItem = {
      ...item,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Notifications Handlers
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleResetToSample = () => {
    setTimetable(initialTimetable);
    setTasks(initialTasks);
    setRoutineEvents(initialRoutineEvents);
    setExpenses(initialExpenses);
    setNotifications(initialNotifications);
  };

  const handleClearAllData = () => {
    setTimetable([]);
    setTasks([]);
    setRoutineEvents([]);
    setExpenses([]);
    setNotifications([]);
  };

  const handleImportData = (data: {
    timetable?: TimetableItem[];
    tasks?: TaskItem[];
    routineEvents?: RoutineEvent[];
    expenses?: ExpenseItem[];
  }) => {
    if (data.timetable) setTimetable(data.timetable);
    if (data.tasks) setTasks(data.tasks);
    if (data.routineEvents) setRoutineEvents(data.routineEvents);
    if (data.expenses) setExpenses(data.expenses);
  };

  const handleOpenQuickAddModal = (type: 'task' | 'class' | 'event' | 'expense' = 'task') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-800 flex flex-col font-['Be_Vietnam_Pro',sans-serif]">
      {/* Sticky App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenQuickAdd={() => handleOpenQuickAddModal('task')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dedicated Audio Player & Background Alert Controller */}
        <AudioPlayerWidget
          soundSettings={soundSettings}
          onUpdateSoundSettings={setSoundSettings}
        />

        {activeTab === 'tong_quan' && (
          <DailyOverview
            timetable={timetable}
            tasks={tasks}
            routineEvents={routineEvents}
            expenses={expenses}
            onToggleTask={handleToggleTask}
            onNavigateTab={setActiveTab}
            onOpenQuickAdd={handleOpenQuickAddModal}
          />
        )}

        {activeTab === 'thoi_khoa_bieu' && (
          <TimetableSection
            timetable={timetable}
            onAddSubject={handleAddClass}
            onEditSubject={handleEditClass}
            onDeleteSubject={handleDeleteClass}
          />
        )}

        {activeTab === 'cong_viec' && (
          <TaskManagerSection
            tasks={tasks}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
          />
        )}

        {activeTab === 'quan_ly_lich' && (
          <ScheduleManagerSection
            events={routineEvents}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeTab === 'chi_tieu' && (
          <ExpenseTrackerSection
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'cai_dat' && (
          <SettingsSection
            timetable={timetable}
            tasks={tasks}
            routineEvents={routineEvents}
            expenses={expenses}
            soundSettings={soundSettings}
            onUpdateSoundSettings={setSoundSettings}
            onResetToSampleData={handleResetToSample}
            onClearAllData={handleClearAllData}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Global Modals */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onClearNotifications={handleClearNotifications}
        tasks={tasks}
        timetable={timetable}
        routineEvents={routineEvents}
        soundSettings={soundSettings}
        onUpdateSoundSettings={setSoundSettings}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultType={quickAddType}
        onAddTask={handleAddTask}
        onAddClass={handleAddClass}
        onAddEvent={handleAddEvent}
        onAddExpense={handleAddExpense}
      />

      {/* Bottom Footer */}
      <footer className="border-t border-stone-200/80 bg-white/60 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
          <p>
            Ứng dụng Quản Lý Sinh Hoạt Cá Nhân • Dành cho học sinh, sinh viên
          </p>
          <p className="flex items-center gap-2">
            <span>Dữ liệu lưu an toàn trên trình duyệt</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('cai_dat')}
              className="text-amber-800 hover:underline font-medium"
            >
              Sao lưu & Cài đặt
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
}
