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
import { playSoftChime, startRinging, stopRinging } from './utils/audio';
import { getTodayDateString, getDayOfWeekNumber } from './utils/helpers';
import { BackgroundTimer } from './utils/backgroundTimer';
import { sendSystemAlert, stopTitleFlash } from './utils/systemNotification';
import { Bell, Check, Square, RotateCcw } from 'lucide-react';

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
      try {
        const parsed = JSON.parse(saved);
        return {
          enabled: parsed.enabled ?? true,
          volume: parsed.volume ?? 0.75,
          soundType: parsed.soundType ?? 'bell',
          defaultMinutesBefore: parsed.defaultMinutesBefore ?? 10,
          ringDuration: parsed.ringDuration ?? 15, // 15 seconds ring duration by default
          snoozeMinutes: parsed.snoozeMinutes ?? 5,
          notifyTimetable: parsed.notifyTimetable ?? true,
          notifyTasks: parsed.notifyTasks ?? true,
          notifyEvents: parsed.notifyEvents ?? true,
        };
      } catch (e) { /* ignore */ }
    }
    return {
      enabled: true,
      volume: 0.75,
      soundType: 'bell',
      defaultMinutesBefore: 10,
      ringDuration: 15,
      snoozeMinutes: 5,
      notifyTimetable: true,
      notifyTasks: true,
      notifyEvents: true,
    };
  });

  const [activeTab, setActiveTab] = useState<AppTab>('tong_quan');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'class' | 'event' | 'expense'>('task');

  // Active alarm ringing state
  const [activeAlarm, setActiveAlarm] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'task' | 'class' | 'event';
    sourceId: string;
    totalSeconds: number;
  } | null>(null);
  const [alarmRemainingSec, setAlarmRemainingSec] = useState<number>(0);

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

  // Keep latest state in refs for Background Timer to avoid unnecessary worker teardowns
  const tasksRef = useRef(tasks);
  const timetableRef = useRef(timetable);
  const routineEventsRef = useRef(routineEvents);
  const soundSettingsRef = useRef(soundSettings);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    timetableRef.current = timetable;
  }, [timetable]);

  useEffect(() => {
    routineEventsRef.current = routineEvents;
  }, [routineEvents]);

  useEffect(() => {
    soundSettingsRef.current = soundSettings;
  }, [soundSettings]);

  // Reminder Checker Tracker
  const alertedIdsRef = useRef<Set<string>>(new Set());

  // Stop active ringing alarm
  const handleStopAlarm = () => {
    stopRinging();
    stopTitleFlash();
    setActiveAlarm(null);
  };

  // Snooze active alarm (e.g. 5 minutes)
  const handleSnoozeAlarm = (minutes: number = soundSettings.snoozeMinutes || 5) => {
    stopRinging();
    stopTitleFlash();
    if (activeAlarm) {
      const savedAlarm = { ...activeAlarm };
      setTimeout(() => {
        triggerAlarm(
          `[BÁO LẠI] ${savedAlarm.title}`,
          `Chuông báo lại sau ${minutes} phút cho ${savedAlarm.title}`,
          savedAlarm.type,
          savedAlarm.sourceId,
          `snooze-${savedAlarm.sourceId}-${Date.now()}`
        );
      }, minutes * 60 * 1000);
    }
    setActiveAlarm(null);
  };

  // Alarm trigger function that rings with duration and sends system alerts
  const triggerAlarm = (
    title: string,
    message: string,
    type: 'task' | 'class' | 'event',
    sourceId: string,
    reminderKey: string
  ) => {
    if (alertedIdsRef.current.has(reminderKey)) return;
    alertedIdsRef.current.add(reminderKey);

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    // Create Notification item
    const newNotif: NotificationAlert = {
      id: `notif-${Date.now()}-${sourceId}`,
      title,
      message,
      timestamp: `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`,
      type,
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Send native system notification (desktop / phone lock screen)
    sendSystemAlert(title, message, reminderKey);

    // If sound is enabled, trigger audio ringing with duration
    const currentSound = soundSettingsRef.current;
    if (currentSound.enabled) {
      const ringSec = currentSound.ringDuration !== undefined ? currentSound.ringDuration : 15;
      setActiveAlarm({
        id: `alarm-${Date.now()}`,
        title,
        message,
        type,
        sourceId,
        totalSeconds: ringSec,
      });
      setAlarmRemainingSec(ringSec);

      startRinging(
        currentSound.soundType,
        currentSound.volume,
        ringSec,
        () => {
          setActiveAlarm(null);
        },
        (remaining) => {
          setAlarmRemainingSec(remaining);
        }
      );
    }
  };

  // Periodic Reminder Checker
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const todayStr = getTodayDateString();
      const currentDayOfWeek = getDayOfWeekNumber();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMin = currentHours * 60 + currentMinutes;

      const currentTasks = tasksRef.current;
      const currentTimetable = timetableRef.current;
      const currentRoutineEvents = routineEventsRef.current;
      const currentSound = soundSettingsRef.current;
      const defaultMin = currentSound.defaultMinutesBefore ?? 10;

      // 1. Check Tasks (Due today)
      if (currentSound.notifyTasks) {
        currentTasks.forEach((task) => {
          if (task.isCompleted || !task.dueTime || task.dueDate !== todayStr) return;
          const reminderMin = task.reminderMinutesBefore !== undefined ? task.reminderMinutesBefore : defaultMin;
          const [tH, tM] = task.dueTime.split(':').map(Number);
          if (isNaN(tH) || isNaN(tM)) return;
          const taskTotalMin = tH * 60 + tM;
          let targetAlertMin = taskTotalMin - reminderMin;
          if (targetAlertMin < 0) targetAlertMin += 1440;

          const reminderKey = `task-${task.id}-${todayStr}-${targetAlertMin}`;
          if (
            currentTotalMin >= targetAlertMin &&
            currentTotalMin <= targetAlertMin + 2 &&
            !alertedIdsRef.current.has(reminderKey)
          ) {
            triggerAlarm(
              `Nhắc việc: ${task.title}`,
              `Công việc sắp đến hạn lúc ${task.dueTime} (${reminderMin > 0 ? `chuông báo trước ${reminderMin} phút` : 'đúng giờ'})!`,
              'task',
              task.id,
              reminderKey
            );
          }
        });
      }

      // 2. Check Timetable (Classes today)
      if (currentSound.notifyTimetable) {
        currentTimetable.forEach((item) => {
          if (item.dayOfWeek !== currentDayOfWeek) return;
          const reminderMin = item.reminderMinutesBefore !== undefined ? item.reminderMinutesBefore : defaultMin;
          const [sH, sM] = item.startTime.split(':').map(Number);
          if (isNaN(sH) || isNaN(sM)) return;
          const classTotalMin = sH * 60 + sM;
          let targetAlertMin = classTotalMin - reminderMin;
          if (targetAlertMin < 0) targetAlertMin += 1440;

          const reminderKey = `class-${item.id}-${todayStr}-${targetAlertMin}`;
          if (
            currentTotalMin >= targetAlertMin &&
            currentTotalMin <= targetAlertMin + 2 &&
            !alertedIdsRef.current.has(reminderKey)
          ) {
            triggerAlarm(
              `Lịch học: ${item.subject}`,
              `Lớp học bắt đầu lúc ${item.startTime}${item.room ? ` tại ${item.room}` : ''} (${reminderMin > 0 ? `chuông báo trước ${reminderMin} phút` : 'đúng giờ'})!`,
              'class',
              item.id,
              reminderKey
            );
          }
        });
      }

      // 3. Check Routine Events (Events today)
      if (currentSound.notifyEvents) {
        currentRoutineEvents.forEach((ev) => {
          if (ev.date !== todayStr) return;
          const reminderMin = ev.reminderMinutesBefore !== undefined ? ev.reminderMinutesBefore : defaultMin;
          const [eH, eM] = ev.startTime.split(':').map(Number);
          if (isNaN(eH) || isNaN(eM)) return;
          const eventTotalMin = eH * 60 + eM;
          let targetAlertMin = eventTotalMin - reminderMin;
          if (targetAlertMin < 0) targetAlertMin += 1440;

          const reminderKey = `event-${ev.id}-${todayStr}-${targetAlertMin}`;
          if (
            currentTotalMin >= targetAlertMin &&
            currentTotalMin <= targetAlertMin + 2 &&
            !alertedIdsRef.current.has(reminderKey)
          ) {
            triggerAlarm(
              `Sinh hoạt: ${ev.title}`,
              `Hoạt động diễn ra lúc ${ev.startTime} (${reminderMin > 0 ? `chuông báo trước ${reminderMin} phút` : 'đúng giờ'})!`,
              'event',
              ev.id,
              reminderKey
            );
          }
        });
      }
    };

    checkReminders();
    const bgTimer = new BackgroundTimer(checkReminders, 12000);
    bgTimer.start();

    return () => {
      bgTimer.stop();
    };
  }, []); // Run once with stable background timer!


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
        {/* Active Alarm Ringing Alert Bar */}
        {activeAlarm && (
          <aside
            aria-label="Thông báo chuông nhắc nhở"
            className="sticky top-20 z-40 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-4 sm:p-5 rounded-2xl shadow-xl border-2 border-amber-300 ring-4 ring-amber-400/20 animate-in slide-in-from-top-4 duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 animate-bounce shadow-inner">
                  <Bell className="w-6 h-6 text-amber-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[11px] uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-amber-100">
                      🔔 ĐANG REO CHUÔNG NHẮC NHỞ
                    </span>
                    {activeAlarm.totalSeconds > 0 ? (
                      <span className="text-xs font-semibold bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-400/40 text-amber-200 flex items-center gap-1">
                        <span>Thời gian reo: còn</span>
                        <strong className="text-white text-sm">{alarmRemainingSec}s</strong>
                        <span>/ {activeAlarm.totalSeconds}s</span>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-400/40 text-amber-200">
                        Chuông đang reo liên tục
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-base mt-1 text-white">{activeAlarm.title}</h4>
                  <p className="text-xs text-amber-100/90">{activeAlarm.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end shrink-0">
                {activeAlarm.type === 'task' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleTask(activeAlarm.sourceId);
                      handleStopAlarm();
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Xong việc & Tắt</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSnoozeAlarm(soundSettings.snoozeMinutes || 5)}
                  className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Báo lại sau {soundSettings.snoozeMinutes || 5}p</span>
                </button>

                <button
                  type="button"
                  onClick={handleStopAlarm}
                  className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-100 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>DỪNG CHUÔNG</span>
                </button>
              </div>
            </div>
            {/* Progress bar countdown when duration > 0 */}
            {activeAlarm.totalSeconds > 0 && (
              <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-amber-300 h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, (alarmRemainingSec / activeAlarm.totalSeconds) * 100))}%` }}
                />
              </div>
            )}
          </aside>
        )}

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
