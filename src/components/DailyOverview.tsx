import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Heart, 
  Wallet, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  User,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { 
  TimetableItem, 
  TaskItem, 
  RoutineEvent, 
  ExpenseItem, 
  AppTab 
} from '../types';
import { 
  getTodayDateString, 
  getDayOfWeekNumber, 
  getFormattedDateFull, 
  getPastelTheme, 
  formatVND,
  getCategoryBadge,
  getPriorityBadge
} from '../utils/helpers';

interface DailyOverviewProps {
  timetable: TimetableItem[];
  tasks: TaskItem[];
  routineEvents: RoutineEvent[];
  expenses: ExpenseItem[];
  onToggleTask: (taskId: string) => void;
  onNavigateTab: (tab: AppTab) => void;
  onOpenQuickAdd: (type?: 'task' | 'class' | 'event' | 'expense') => void;
}

export const DailyOverview: React.FC<DailyOverviewProps> = ({
  timetable,
  tasks,
  routineEvents,
  expenses,
  onToggleTask,
  onNavigateTab,
  onOpenQuickAdd,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Navigation helpers for dates
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(getTodayDateString());
  };

  const isToday = selectedDate === getTodayDateString();
  const dayOfWeekNumber = getDayOfWeekNumber(selectedDate);

  // Filter items for selected day
  const dayClasses = timetable.filter((item) => item.dayOfWeek === dayOfWeekNumber);
  const dayTasks = tasks.filter((item) => item.dueDate === selectedDate);
  const dayEvents = routineEvents.filter((item) => item.date === selectedDate);
  const dayExpenses = expenses.filter((item) => item.date === selectedDate);

  // Statistics
  const completedTasksCount = dayTasks.filter((t) => t.isCompleted).length;
  const totalTasksCount = dayTasks.length;
  const taskProgressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const dayTotalExpense = dayExpenses
    .filter((e) => e.type === 'chi')
    .reduce((sum, e) => sum + e.amount, 0);

  // Combined timeline items
  interface TimelineItem {
    id: string;
    type: 'class' | 'task' | 'routine';
    time: string;
    endTime?: string;
    title: string;
    subtitle?: string;
    detail?: string;
    isCompleted?: boolean;
    colorScheme?: string;
    originalId?: string;
  }

  const timelineItems: TimelineItem[] = [];

  dayClasses.forEach((c) => {
    timelineItems.push({
      id: `class-${c.id}`,
      type: 'class',
      time: c.startTime,
      endTime: c.endTime,
      title: c.subject,
      subtitle: `${c.room} ${c.teacher ? `• GV: ${c.teacher}` : ''}`,
      detail: c.notes,
      colorScheme: c.color,
    });
  });

  dayTasks.forEach((t) => {
    timelineItems.push({
      id: `task-${t.id}`,
      originalId: t.id,
      type: 'task',
      time: t.dueTime || '23:59',
      title: t.title,
      subtitle: `Hạn hoàn thành • ${getCategoryBadge(t.category).label}`,
      detail: t.notes,
      isCompleted: t.isCompleted,
    });
  });

  dayEvents.forEach((e) => {
    timelineItems.push({
      id: `event-${e.id}`,
      type: 'routine',
      time: e.startTime,
      endTime: e.endTime,
      title: e.title,
      subtitle: 'Hoạt động sinh hoạt cá nhân',
      detail: e.notes,
      colorScheme: e.color,
    });
  });

  // Sort chronologically
  timelineItems.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      {/* Date Header & Quick Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                {isToday ? 'Hôm Nay' : 'Lịch Sinh Hoạt'}
              </span>
              <span className="text-xs text-stone-600 font-medium">
                {timelineItems.length} hoạt động tổng hợp
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight">
              {getFormattedDateFull(selectedDate)}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
              title="Ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                isToday
                  ? 'bg-amber-100/80 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
              title="Ngày tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-700 bg-stone-50/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
      </div>

      {/* Snapshot Cards (Progress, Next Class, Daily Expense) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Task Progress */}
        <div 
          onClick={() => onNavigateTab('cong_viec')}
          className="cursor-pointer group bg-gradient-to-br from-amber-50/70 to-white p-4.5 rounded-2xl border border-amber-200/80 shadow-2xs hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-amber-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-700" />
              Công việc trong ngày
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
              {completedTasksCount}/{totalTasksCount}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-stone-800">{taskProgressPercent}%</span>
              <span className="text-xs text-stone-600">hoàn thành</span>
            </div>
            <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-600 rounded-full transition-all duration-300"
                style={{ width: `${taskProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Classes Scheduled */}
        <div 
          onClick={() => onNavigateTab('thoi_khoa_bieu')}
          className="cursor-pointer group bg-gradient-to-br from-orange-50/60 to-white p-4.5 rounded-2xl border border-orange-200/80 shadow-2xs hover:border-orange-300 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-orange-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-orange-700" />
              Thời khóa biểu hôm nay
            </span>
            <span className="text-xs font-bold text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded-md">
              {dayClasses.length} môn
            </span>
          </div>
          <div className="space-y-1">
            {dayClasses.length > 0 ? (
              <div>
                <p className="text-sm font-semibold text-stone-800 truncate">
                  {dayClasses[0].subject}
                </p>
                <p className="text-xs text-stone-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-600" />
                  {dayClasses[0].startTime} - {dayClasses[0].endTime} • {dayClasses[0].room}
                </p>
              </div>
            ) : (
              <p className="text-xs text-stone-600 pt-2">Không có tiết học nào trong ngày này</p>
            )}
          </div>
        </div>

        {/* Daily Expenses */}
        <div 
          onClick={() => onNavigateTab('chi_tieu')}
          className="cursor-pointer group bg-gradient-to-br from-rose-50/50 to-white p-4.5 rounded-2xl border border-rose-200/70 shadow-2xs hover:border-rose-300 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-rose-900 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-rose-700" />
              Chi tiêu trong ngày
            </span>
            <span className="text-xs font-bold text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded-md">
              {dayExpenses.length} giao dịch
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-stone-800">
              {formatVND(dayTotalExpense)}
            </div>
            <p className="text-xs text-stone-600">
              {dayExpenses.length > 0 ? 'Tổng chi phí phát sinh' : 'Chưa ghi nhận khoản chi nào'}
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-column layout: Left is Daily Combined Timeline, Right is Quick To-Do & Fast-Add */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline 24h of activities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="font-semibold text-stone-800 text-base">
                  Dòng thời gian hoạt động
                </h3>
                <p className="text-xs text-stone-600">
                  Tổng hợp lịch học, các mốc công việc và lịch sinh hoạt cá nhân
                </p>
              </div>
              <button
                onClick={() => onOpenQuickAdd('event')}
                className="text-xs flex items-center gap-1 font-medium text-amber-900 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Thêm hoạt động
              </button>
            </div>

            {timelineItems.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-stone-50/60 border border-dashed border-stone-200">
                <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-600 text-sm font-medium">Chưa có hoạt động nào trong ngày này</p>
                <p className="text-stone-600 text-xs mt-1">
                  Hãy thêm lịch học, việc cần làm hoặc lịch sinh hoạt để sắp xếp thời gian hợp lý.
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => onOpenQuickAdd('class')}
                    className="text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
                  >
                    + Môn học
                  </button>
                  <button
                    onClick={() => onOpenQuickAdd('task')}
                    className="text-xs px-3 py-1.5 bg-amber-700 text-white rounded-lg hover:bg-amber-800 font-medium"
                  >
                    + Việc cần làm
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {timelineItems.map((item) => {
                  if (item.type === 'class') {
                    const theme = getPastelTheme(item.colorScheme as any || 'amber');
                    return (
                      <div key={item.id} className="relative group">
                        {/* Dot indicator */}
                        <div className="absolute -left-[27px] top-3.5 w-3.5 h-3.5 rounded-full bg-amber-600 border-2 border-white shadow-2xs" />
                        <div className={`p-4 rounded-xl border ${theme.bg} ${theme.border} transition-all duration-150`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${theme.badge}`}>
                                  Lịch học • {item.time} {item.endTime ? `- ${item.endTime}` : ''}
                                </span>
                              </div>
                              <h4 className="font-semibold text-stone-800 text-sm sm:text-base">
                                {item.title}
                              </h4>
                              {item.subtitle && (
                                <p className="text-xs text-stone-600 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-stone-600" />
                                  {item.subtitle}
                                </p>
                              )}
                              {item.detail && (
                                <p className="text-xs text-stone-600 italic bg-white/60 p-2 rounded-lg mt-1.5 border border-white/80">
                                  {item.detail}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (item.type === 'task') {
                    return (
                      <div key={item.id} className="relative group">
                        {/* Dot indicator */}
                        <div className={`absolute -left-[27px] top-3.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-2xs ${
                          item.isCompleted ? 'bg-stone-500' : 'bg-rose-400'
                        }`} />
                        <div className={`p-3.5 rounded-xl border transition-all duration-150 ${
                          item.isCompleted 
                            ? 'bg-stone-50/90 border-stone-200/80 opacity-75' 
                            : 'bg-white border-stone-200/80 hover:border-stone-300'
                        }`}>
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => item.originalId && onToggleTask(item.originalId)}
                              className="mt-0.5 text-stone-600 hover:text-amber-700 transition-colors"
                              title={item.isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                            >
                              {item.isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-amber-700" />
                              ) : (
                                <Circle className="w-5 h-5 text-stone-600" />
                              )}
                            </button>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                                  Công việc • {item.time !== '23:59' ? item.time : 'Trong ngày'}
                                </span>
                              </div>
                              <h4 className={`text-sm font-medium ${
                                item.isCompleted ? 'line-through text-stone-600' : 'text-stone-800'
                              }`}>
                                {item.title}
                              </h4>
                              {item.detail && (
                                <p className="text-xs text-stone-600">{item.detail}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Routine event
                  const theme = getPastelTheme(item.colorScheme as any || 'caramel');
                  return (
                    <div key={item.id} className="relative group">
                      {/* Dot indicator */}
                      <div className="absolute -left-[27px] top-3.5 w-3.5 h-3.5 rounded-full bg-orange-600 border-2 border-white shadow-2xs" />
                      <div className={`p-3.5 rounded-xl border ${theme.bg} ${theme.border} transition-all duration-150`}>
                        <div className="space-y-1">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${theme.badge}`}>
                            Sinh hoạt • {item.time} {item.endTime ? `- ${item.endTime}` : ''}
                          </span>
                          <h4 className="font-medium text-stone-800 text-sm">
                            {item.title}
                          </h4>
                          {item.detail && (
                            <p className="text-xs text-stone-600 italic">{item.detail}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Focus Tasks & Quick Routine Helpers */}
        <div className="space-y-5">
          {/* Priority Tasks for this day */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <h3 className="font-semibold text-stone-800 text-sm">
                Việc cần làm hôm nay
              </h3>
              <button
                onClick={() => onNavigateTab('cong_viec')}
                className="text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1"
              >
                Xem tất cả
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {dayTasks.length === 0 ? (
              <p className="text-xs text-stone-600 py-4 text-center">
                Không có việc nào cần làm hôm nay.
              </p>
            ) : (
              <div className="space-y-2.5">
                {dayTasks.slice(0, 4).map((task) => {
                  const priority = getPriorityBadge(task.priority);
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-all ${
                        task.isCompleted
                          ? 'bg-stone-50/80 border-stone-200/60 opacity-70'
                          : 'bg-stone-50/50 border-stone-200/80 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="mt-0.5 text-stone-600 hover:text-amber-700"
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-amber-700" />
                          ) : (
                            <Circle className="w-4 h-4 text-stone-600" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-medium truncate ${
                            task.isCompleted ? 'line-through text-stone-600' : 'text-stone-800'
                          }`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {task.dueTime && (
                              <span className="text-[11px] text-stone-600 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-stone-600" />
                                {task.dueTime}
                              </span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${priority.color}`}>
                              {priority.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => onOpenQuickAdd('task')}
              className="w-full mt-3 py-2 px-3 rounded-xl border border-dashed border-stone-300 hover:border-amber-400 hover:bg-amber-50/40 text-stone-600 hover:text-amber-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Thêm nhanh công việc
            </button>
          </div>

          {/* Tips for Time Management */}
          <div className="bg-gradient-to-br from-amber-50/40 to-stone-50 rounded-2xl p-4.5 border border-amber-200/60 text-stone-700 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <Heart className="w-4 h-4 text-amber-700" />
              Gợi ý quản lý thời gian
            </div>
            <p className="text-stone-600 leading-relaxed">
              Hãy phân chia thời gian theo phương pháp 50/10 (50 phút tập trung học, 10 phút nghỉ ngơi). Luôn ưu tiên giải quyết các bài tập và công việc quan trọng trước 12h trưa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
