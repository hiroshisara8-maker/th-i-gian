import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Bell, 
  Search, 
  Edit3, 
  Trash2, 
  Filter,
  CheckCheck,
  Flag,
  RotateCcw
} from 'lucide-react';
import { TaskItem, TaskCategory, TaskPriority } from '../types';
import { 
  getTodayDateString, 
  getCategoryBadge, 
  getPriorityBadge 
} from '../utils/helpers';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface TaskManagerSectionProps {
  tasks: TaskItem[];
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
}

export const TaskManagerSection: React.FC<TaskManagerSectionProps> = ({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTask,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'today' | 'pending' | 'completed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  const today = getTodayDateString();

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: TaskCategory;
    dueDate: string;
    dueTime: string;
    priority: TaskPriority;
    reminderMinutesBefore: number;
    notes: string;
  }>({
    title: '',
    category: 'hoc_tap',
    dueDate: today,
    dueTime: '19:00',
    priority: 'trung_binh',
    reminderMinutesBefore: 10,
    notes: '',
  });

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      category: 'hoc_tap',
      dueDate: today,
      dueTime: '19:00',
      priority: 'trung_binh',
      reminderMinutesBefore: 10,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      category: task.category,
      dueDate: task.dueDate,
      dueTime: task.dueTime || '19:00',
      priority: task.priority,
      reminderMinutesBefore: task.reminderMinutesBefore ?? 10,
      notes: task.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask) {
      onEditTask({
        ...editingTask,
        ...formData,
      });
    } else {
      onAddTask({
        ...formData,
        isCompleted: false,
      });
    }
    setIsModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;

    let matchesStatus = true;
    if (filterStatus === 'today') {
      matchesStatus = task.dueDate === today;
    } else if (filterStatus === 'pending') {
      matchesStatus = !task.isCompleted;
    } else if (filterStatus === 'completed') {
      matchesStatus = task.isCompleted;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                Theo dõi mục tiêu
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight mt-1">
              Ghi chú & Quản lý công việc
            </h2>
            <p className="text-xs text-stone-600">
              Ghi chú việc cần làm trong ngày, đặt chuông nhắc nhở và theo dõi tiến độ hoàn thành
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-medium shadow-xs transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm công việc</span>
          </button>
        </div>

        {/* Progress bar overview */}
        <div className="mt-5 p-4 rounded-xl bg-stone-50/70 border border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-stone-600">Tiến độ tổng thể</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-stone-800">{progressPercent}%</span>
              <span className="text-xs text-stone-600">
                (Đã xong {completedTasks} / {totalTasks} việc)
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64 h-2.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-amber-100/80 text-amber-900 font-medium">
              ✓ {completedTasks} đã xong
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-100/70 text-rose-800 font-medium">
              ⏳ {pendingTasks} đang làm
            </span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'today', label: 'Hôm nay' },
              { id: 'pending', label: 'Chưa xong' },
              { id: 'completed', label: 'Đã hoàn thành' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterStatus(btn.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                  filterStatus === btn.id
                    ? 'bg-amber-100/80 text-amber-900 border-amber-300 font-semibold'
                    : 'bg-stone-50 text-stone-600 border-stone-200/60 hover:bg-stone-100'
                }`}
              >
                {btn.label}
              </button>
            ))}

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 text-stone-700 bg-stone-50 hover:bg-white focus:outline-none"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="hoc_tap">Học tập</option>
              <option value="cong_viec">Công việc</option>
              <option value="ca_nhan">Cá nhân</option>
              <option value="sinh_hoat">Sinh hoạt</option>
            </select>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-stone-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm việc cần làm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200/80 shadow-2xs">
            <CheckCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-800 font-semibold text-base">Không tìm thấy công việc nào</p>
            <p className="text-stone-600 text-xs mt-1">
              Thử thay đổi bộ lọc hoặc thêm một công việc mới để bắt đầu.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-medium hover:bg-amber-800 shadow-xs"
            >
              Thêm công việc ngay
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const catBadge = getCategoryBadge(task.category);
            const priBadge = getPriorityBadge(task.priority);
            const isDueToday = task.dueDate === today;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all duration-150 shadow-2xs group ${
                  task.isCompleted
                    ? 'border-stone-200/60 bg-stone-50/50 opacity-75'
                    : 'border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left Checkbox & Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-stone-600 hover:text-amber-700 transition-colors shrink-0"
                      title={task.isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-amber-700" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-600" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${catBadge.color}`}>
                          {catBadge.label}
                        </span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${priBadge.color}`}>
                          {priBadge.label}
                        </span>
                        {task.reminderMinutesBefore !== undefined && task.reminderMinutesBefore > 0 && (
                          <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
                            <Bell className="w-3 h-3 text-amber-600" />
                            Nhắc trước {task.reminderMinutesBefore}p
                          </span>
                        )}
                      </div>

                      <h3 className={`text-base font-semibold ${
                        task.isCompleted ? 'line-through text-stone-600' : 'text-stone-900'
                      }`}>
                        {task.title}
                      </h3>

                      {task.notes && (
                        <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100">
                          {task.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-stone-600 pt-1">
                        <span className={`flex items-center gap-1 ${isDueToday ? 'text-rose-600 font-medium' : ''}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          Hạn: {task.dueDate} {task.dueTime ? `lúc ${task.dueTime}` : ''} {isDueToday ? '(Hôm nay)' : ''}
                        </span>
                        {task.completedAt && (
                          <span className="text-amber-800 flex items-center gap-1">
                            ✓ Hoàn thành: {task.completedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Sửa & Xóa nội dung ghi sai */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors"
                      title="Chỉnh sửa công việc"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sửa</span>
                    </button>
                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                      title="Xóa công việc ghi sai"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-800 text-lg">
                {editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-600 hover:text-stone-600 p-1 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Tiêu đề công việc <span className="text-rose-500">*</span>
                  </label>
                  {formData.title && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, title: '' })}
                      className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-0.5"
                    >
                      Xóa chữ ghi sai
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nộp báo cáo chuyên đề, Ôn tập kiểm tra..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 pr-8 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  {formData.title && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, title: '' })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-700 text-xs font-bold"
                      title="Xóa nhanh chữ ghi sai"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                  >
                    <option value="hoc_tap">Học tập</option>
                    <option value="cong_viec">Công việc</option>
                    <option value="ca_nhan">Cá nhân</option>
                    <option value="sinh_hoat">Sinh hoạt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                  >
                    <option value="thap">Thấp</option>
                    <option value="trung_binh">Bình thường</option>
                    <option value="cao">Ưu tiên cao</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ngày hoàn thành (Hạn chót)
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Giờ hoàn thành
                  </label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Reminder Feature */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  Cài đặt thời gian nhắc nhở (Thông báo)
                </label>
                <select
                  value={formData.reminderMinutesBefore}
                  onChange={(e) => setFormData({ ...formData, reminderMinutesBefore: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                >
                  <option value={0}>Đúng giờ đến hạn</option>
                  <option value={5}>Nhắc trước 5 phút</option>
                  <option value={10}>Nhắc trước 10 phút (Mặc định chuẩn)</option>
                  <option value={15}>Nhắc trước 15 phút</option>
                  <option value={30}>Nhắc trước 30 phút</option>
                  <option value={60}>Nhắc trước 1 tiếng</option>
                </select>
                <p className="text-[11px] text-stone-600 mt-1">
                  Hệ thống sẽ phát chuông êm tai và gửi thông báo nhắc nhở khi đến giờ.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Ghi chú chi tiết
                  </label>
                  {formData.notes && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, notes: '' })}
                      className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline"
                    >
                      Xóa ghi chú
                    </button>
                  )}
                </div>
                <div className="relative">
                  <textarea
                    rows={2}
                    placeholder="Ghi chú nội dung cần lưu ý..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                {editingTask ? (
                  <button
                    type="button"
                    onClick={() => {
                      const cur = editingTask;
                      setIsModalOpen(false);
                      setTaskToDelete(cur);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                    title="Xóa công việc ghi sai này"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Xóa việc này (ghi sai)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFormData({
                      title: '',
                      category: 'hoc_tap',
                      dueDate: today,
                      dueTime: '19:00',
                      priority: 'trung_binh',
                      reminderMinutesBefore: 10,
                      notes: '',
                    })}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                    title="Xóa sạch nội dung vừa nhập"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Xóa trắng form</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-amber-700 hover:bg-amber-800 text-white shadow-xs"
                  >
                    {editingTask ? 'Lưu thay đổi' : 'Thêm công việc'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        title="Xóa công việc ghi sai"
        itemName={taskToDelete?.title}
        message={`Bạn có chắc muốn xóa công việc "${taskToDelete?.title}" không? Thao tác này sẽ xóa vĩnh viễn nội dung ghi sai.`}
        onConfirm={() => {
          if (taskToDelete) {
            onDeleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
