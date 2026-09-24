import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Calendar, 
  Wallet, 
  Plus, 
  Tag,
  RotateCcw
} from 'lucide-react';
import { 
  TaskItem, 
  TimetableItem, 
  RoutineEvent, 
  ExpenseItem, 
  DayOfWeek, 
  SubjectColor,
  TaskCategory,
  TaskPriority,
  RoutineCategory,
  ExpenseType,
  ExpenseCategory 
} from '../types';
import { getTodayDateString, getDayOfWeekNumber, getDayOfWeekLabel } from '../utils/helpers';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'task' | 'class' | 'event' | 'expense';
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onAddClass: (c: Omit<TimetableItem, 'id'>) => void;
  onAddEvent: (e: Omit<RoutineEvent, 'id'>) => void;
  onAddExpense: (e: Omit<ExpenseItem, 'id'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'task',
  onAddTask,
  onAddClass,
  onAddEvent,
  onAddExpense,
}) => {
  const [activeType, setActiveType] = useState<'task' | 'class' | 'event' | 'expense'>(defaultType);

  useEffect(() => {
    if (defaultType) setActiveType(defaultType);
  }, [defaultType, isOpen]);

  const today = getTodayDateString();

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: 'hoc_tap' as TaskCategory,
    dueDate: today,
    dueTime: '20:00',
    priority: 'trung_binh' as TaskPriority,
    reminderMinutesBefore: 10,
    notes: '',
  });

  // Class form state
  const [classForm, setClassForm] = useState({
    subject: '',
    dayOfWeek: getDayOfWeekNumber() as DayOfWeek,
    startTime: '07:30',
    endTime: '09:30',
    room: '',
    teacher: '',
    notes: '',
    color: 'amber' as SubjectColor,
    reminderMinutesBefore: 10,
  });

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    date: today,
    startTime: '17:00',
    endTime: '18:00',
    category: 'sinh_hoat_khac' as RoutineCategory,
    notes: '',
    color: 'orange' as SubjectColor,
    reminderMinutesBefore: 10,
  });

  // Expense form state
  const [expenseForm, setExpenseForm] = useState<{
    title: string;
    amount: number | '';
    type: ExpenseType;
    category: ExpenseCategory;
    date: string;
    notes: string;
  }>({
    title: '',
    amount: '',
    type: 'chi' as ExpenseType,
    category: 'an_uong' as ExpenseCategory,
    date: today,
    notes: '',
  });

  if (!isOpen) return null;

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    onAddTask({
      ...taskForm,
      isCompleted: false,
    });
    onClose();
  };

  const handleClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.subject.trim()) return;
    onAddClass(classForm);
    onClose();
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;
    onAddEvent(eventForm);
    onClose();
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title.trim() || !expenseForm.amount || Number(expenseForm.amount) <= 0) return;
    onAddExpense({
      ...expenseForm,
      amount: Number(expenseForm.amount),
    });
    onClose();
  };

  const days: DayOfWeek[] = [2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <h3 className="font-bold text-stone-800 text-lg">
            Thêm nhanh nội dung
          </h3>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-600 p-1 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-100 rounded-xl mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveType('task')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeType === 'task' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-stone-700" />
            <span className="truncate">Việc làm</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('class')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeType === 'class' ? 'bg-white text-amber-900 font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span className="truncate">Môn học</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('event')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeType === 'event' ? 'bg-white text-orange-900 font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-orange-700" />
            <span className="truncate">Sinh hoạt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('expense')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeType === 'expense' ? 'bg-white text-rose-800 font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-rose-600" />
            <span className="truncate">Chi tiêu</span>
          </button>
        </div>

        {/* Task Form */}
        {activeType === 'task' && (
          <form onSubmit={handleTaskSubmit} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Tên công việc / Hoạt động <span className="text-rose-500">*</span>
                </label>
                {taskForm.title && (
                  <button
                    type="button"
                    onClick={() => setTaskForm({ ...taskForm, title: '' })}
                    className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Xóa tên ghi sai
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Làm bài tập Lập trình, Ôn thi..."
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 pr-8 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {taskForm.title && (
                  <button
                    type="button"
                    onClick={() => setTaskForm({ ...taskForm, title: '' })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Danh mục</label>
                <select
                  value={taskForm.category}
                  onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="hoc_tap">Học tập</option>
                  <option value="cong_viec">Công việc</option>
                  <option value="ca_nhan">Cá nhân</option>
                  <option value="sinh_hoat">Sinh hoạt</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mức độ ưu tiên</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="thap">Thấp</option>
                  <option value="trung_binh">Bình thường</option>
                  <option value="cao">Ưu tiên cao</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Ngày hoàn thành</label>
                <input
                  type="date"
                  required
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Giờ hoàn thành</label>
                <input
                  type="time"
                  value={taskForm.dueTime}
                  onChange={(e) => setTaskForm({ ...taskForm, dueTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Chuông báo trước giờ
              </label>
              <select
                value={taskForm.reminderMinutesBefore}
                onChange={(e) => setTaskForm({ ...taskForm, reminderMinutesBefore: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none"
              >
                <option value="10">Trước 10 phút (Mặc định)</option>
                <option value="5">Trước 5 phút</option>
                <option value="15">Trước 15 phút</option>
                <option value="30">Trước 30 phút</option>
                <option value="60">Trước 1 tiếng</option>
                <option value="0">Đúng giờ (không báo trước)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setTaskForm({
                  title: '',
                  category: 'hoc_tap',
                  dueDate: today,
                  dueTime: '20:00',
                  priority: 'trung_binh',
                  reminderMinutesBefore: 10,
                  notes: '',
                })}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa trắng form</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-amber-700 text-white hover:bg-amber-800 rounded-xl shadow-xs"
                >
                  Lưu công việc
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Class Form */}
        {activeType === 'class' && (
          <form onSubmit={handleClassSubmit} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Tên môn học <span className="text-rose-500">*</span>
                </label>
                {classForm.subject && (
                  <button
                    type="button"
                    onClick={() => setClassForm({ ...classForm, subject: '' })}
                    className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Xóa tên ghi sai
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cơ sở dữ liệu, Triết học..."
                  value={classForm.subject}
                  onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                  className="w-full px-3 py-2 pr-8 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {classForm.subject && (
                  <button
                    type="button"
                    onClick={() => setClassForm({ ...classForm, subject: '' })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Thứ</label>
                <select
                  value={classForm.dayOfWeek}
                  onChange={(e) => setClassForm({ ...classForm, dayOfWeek: Number(e.target.value) as any })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>{getDayOfWeekLabel(d)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phòng học</label>
                <input
                  type="text"
                  placeholder="Ví dụ: B2.401"
                  value={classForm.room}
                  onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Bắt đầu</label>
                <input
                  type="time"
                  required
                  value={classForm.startTime}
                  onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kết thúc</label>
                <input
                  type="time"
                  required
                  value={classForm.endTime}
                  onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Chuông báo trước giờ vào lớp
              </label>
              <select
                value={classForm.reminderMinutesBefore}
                onChange={(e) => setClassForm({ ...classForm, reminderMinutesBefore: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none"
              >
                <option value="10">Trước 10 phút (Mặc định)</option>
                <option value="5">Trước 5 phút</option>
                <option value="15">Trước 15 phút</option>
                <option value="30">Trước 30 phút</option>
                <option value="0">Đúng giờ (không báo trước)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setClassForm({
                  subject: '',
                  dayOfWeek: getDayOfWeekNumber() as DayOfWeek,
                  startTime: '07:30',
                  endTime: '09:30',
                  room: '',
                  teacher: '',
                  notes: '',
                  color: 'amber',
                  reminderMinutesBefore: 10,
                })}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa trắng form</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-amber-700 text-white hover:bg-amber-800 rounded-xl shadow-xs"
                >
                  Lưu môn học
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Event Form */}
        {activeType === 'event' && (
          <form onSubmit={handleEventSubmit} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Tên hoạt động sinh hoạt <span className="text-rose-500">*</span>
                </label>
                {eventForm.title && (
                  <button
                    type="button"
                    onClick={() => setEventForm({ ...eventForm, title: '' })}
                    className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Xóa tên ghi sai
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tập gym, Học nhóm, Khám răng..."
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 pr-8 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {eventForm.title && (
                  <button
                    type="button"
                    onClick={() => setEventForm({ ...eventForm, title: '' })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Ngày</label>
                <input
                  type="date"
                  required
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phân loại</label>
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="the_thao">Thể dục & Thể thao</option>
                  <option value="nghi_ngoi">Nghỉ ngơi & Thư giãn</option>
                  <option value="hoc_bai">Tự học & Nghiên cứu</option>
                  <option value="cau_lac_bo">Họp CLB / Đội nhóm</option>
                  <option value="sinh_hoat_khac">Sinh hoạt khác</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Bắt đầu</label>
                <input
                  type="time"
                  required
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kết thúc</label>
                <input
                  type="time"
                  required
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Chuông báo trước giờ sinh hoạt
              </label>
              <select
                value={eventForm.reminderMinutesBefore}
                onChange={(e) => setEventForm({ ...eventForm, reminderMinutesBefore: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none"
              >
                <option value="10">Trước 10 phút (Mặc định)</option>
                <option value="5">Trước 5 phút</option>
                <option value="15">Trước 15 phút</option>
                <option value="30">Trước 30 phút</option>
                <option value="60">Trước 1 tiếng</option>
                <option value="0">Đúng giờ (không báo trước)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEventForm({
                  title: '',
                  date: today,
                  startTime: '17:00',
                  endTime: '18:00',
                  category: 'sinh_hoat_khac',
                  notes: '',
                  color: 'orange',
                  reminderMinutesBefore: 10,
                })}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa trắng form</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-amber-700 text-white hover:bg-amber-800 rounded-xl shadow-xs"
                >
                  Lưu lịch sinh hoạt
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Expense Form */}
        {activeType === 'expense' && (
          <form onSubmit={handleExpenseSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => setExpenseForm({ ...expenseForm, type: 'chi' })}
                className={`py-1 text-xs font-semibold rounded-lg ${
                  expenseForm.type === 'chi' ? 'bg-white text-rose-600 shadow-2xs' : 'text-stone-600'
                }`}
              >
                Khoản chi (-)
              </button>
              <button
                type="button"
                onClick={() => setExpenseForm({ ...expenseForm, type: 'thu' })}
                className={`py-1 text-xs font-semibold rounded-lg ${
                  expenseForm.type === 'thu' ? 'bg-white text-amber-900 shadow-2xs' : 'text-stone-600'
                }`}
              >
                Khoản thu (+)
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Nội dung chi tiêu <span className="text-rose-500">*</span>
                </label>
                {expenseForm.title && (
                  <button
                    type="button"
                    onClick={() => setExpenseForm({ ...expenseForm, title: '' })}
                    className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Xóa tên ghi sai
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ăn trưa, Đổ xăng xe máy..."
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3 py-2 pr-8 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {expenseForm.title && (
                  <button
                    type="button"
                    onClick={() => setExpenseForm({ ...expenseForm, title: '' })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Số tiền (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  placeholder="30000"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value ? Number(e.target.value) : '' })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Danh mục</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="an_uong">Ăn uống</option>
                  <option value="hoc_tap">Học tập</option>
                  <option value="di_lai">Đi lại</option>
                  <option value="mua_sam">Mua sắm</option>
                  <option value="nha_tro">Nhà trọ</option>
                  <option value="giai_tri">Giải trí</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setExpenseForm({
                  title: '',
                  amount: '',
                  type: 'chi',
                  category: 'an_uong',
                  date: today,
                  notes: '',
                })}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa trắng form</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-amber-700 text-white hover:bg-amber-800 rounded-xl shadow-xs"
                >
                  Lưu giao dịch
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

