import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  Edit3, 
  Trash2, 
  Search, 
  Calendar,
  Layers,
  BookOpen,
  Filter,
  RotateCcw,
  Bell
} from 'lucide-react';
import { TimetableItem, DayOfWeek, SubjectColor } from '../types';
import { 
  getDayOfWeekLabel, 
  getPastelTheme, 
  getDayOfWeekNumber 
} from '../utils/helpers';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface TimetableSectionProps {
  timetable: TimetableItem[];
  onAddSubject: (item: Omit<TimetableItem, 'id'>) => void;
  onEditSubject: (item: TimetableItem) => void;
  onDeleteSubject: (id: string) => void;
}

export const TimetableSection: React.FC<TimetableSectionProps> = ({
  timetable,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDayFilter, setSelectedDayFilter] = useState<DayOfWeek>(getDayOfWeekNumber());
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TimetableItem | null>(null);

  // Form inputs
  const [formData, setFormData] = useState<{
    subject: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    room: string;
    teacher: string;
    notes: string;
    color: SubjectColor;
    reminderMinutesBefore: number;
  }>({
    subject: '',
    dayOfWeek: 2,
    startTime: '07:30',
    endTime: '09:30',
    room: '',
    teacher: '',
    notes: '',
    color: 'amber',
    reminderMinutesBefore: 10,
  });

  const days: DayOfWeek[] = [2, 3, 4, 5, 6, 7, 8];

  const handleOpenAddModal = (defaultDay?: DayOfWeek) => {
    setEditingItem(null);
    setFormData({
      subject: '',
      dayOfWeek: defaultDay || selectedDayFilter,
      startTime: '07:30',
      endTime: '09:30',
      room: '',
      teacher: '',
      notes: '',
      color: 'amber',
      reminderMinutesBefore: 10,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TimetableItem) => {
    setEditingItem(item);
    setFormData({
      subject: item.subject,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      teacher: item.teacher || '',
      notes: item.notes || '',
      color: item.color,
      reminderMinutesBefore: item.reminderMinutesBefore ?? 10,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) return;

    if (editingItem) {
      onEditSubject({
        ...formData,
        id: editingItem.id,
      });
    } else {
      onAddSubject(formData);
    }
    setIsModalOpen(false);
  };

  // Filter items
  const filteredItems = timetable.filter((item) => {
    const matchesSearch = item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.teacher && item.teacher.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.room.toLowerCase().includes(searchQuery.toLowerCase());

    if (viewMode === 'day') {
      return matchesSearch && item.dayOfWeek === selectedDayFilter;
    }
    return matchesSearch;
  });

  const pastelColors: { id: SubjectColor; label: string; bg: string }[] = [
    { id: 'amber', label: 'Vàng mật', bg: 'bg-[#fffbeb] border-[#fde68a]' },
    { id: 'rose', label: 'Hồng san hô', bg: 'bg-[#fff1f2] border-[#fecdd3]' },
    { id: 'orange', label: 'Cam nhạt', bg: 'bg-[#fff7ed] border-[#fed7aa]' },
    { id: 'sand', label: 'Cát ấm', bg: 'bg-[#fefce8] border-[#fef08a]' },
    { id: 'lavender', label: 'Tím nhạt', bg: 'bg-[#f5f3ff] border-[#ddd6fe]' },
    { id: 'caramel', label: 'Caramel', bg: 'bg-[#fdf4ff] border-[#f5d0fe]' },
    { id: 'stone', label: 'Ghi ấm', bg: 'bg-[#f5f5f4] border-[#e7e5e4]' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                Lịch học cố định
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight mt-1">
              Thời khóa biểu học tập
            </h2>
            <p className="text-xs text-stone-600">
              Ghi lại và theo dõi giờ học, giảng đường, giảng viên theo từng ngày trong tuần
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/60 text-xs">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Cả tuần
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'day'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Theo thứ
              </button>
            </div>

            {/* Add Subject Button */}
            <button
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-medium shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm môn học</span>
            </button>
          </div>
        </div>

        {/* Search and Day filter */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Day selection tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {days.map((day) => {
              const count = timetable.filter((t) => t.dayOfWeek === day).length;
              const isSelected = selectedDayFilter === day;
              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDayFilter(day);
                    if (viewMode !== 'day') setViewMode('day');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-amber-100/80 text-amber-900 border-amber-300 font-semibold'
                      : 'bg-stone-50 text-stone-600 border-stone-200/60 hover:bg-stone-100'
                  }`}
                >
                  <span>{getDayOfWeekLabel(day)}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-amber-200/90 text-amber-950 font-bold' : 'bg-stone-200/70 text-stone-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-stone-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm môn, phòng, giảng viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Week Grid View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {days.map((day) => {
            const dayItems = timetable
              .filter((item) => item.dayOfWeek === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={day}
                className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 mb-3">
                    <h3 className="font-semibold text-stone-800 text-sm flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-700" />
                      {getDayOfWeekLabel(day)}
                    </h3>
                    <span className="text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                      {dayItems.length} tiết
                    </span>
                  </div>

                  {dayItems.length === 0 ? (
                    <div className="py-8 text-center text-stone-600 text-xs italic">
                      Không có lịch học
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayItems.map((item) => {
                        const theme = getPastelTheme(item.color);
                        return (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-xl border ${theme.bg} ${theme.border} transition-all relative group`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.badge}`}>
                                    {item.startTime} - {item.endTime}
                                  </span>
                                  {item.reminderMinutesBefore !== undefined && item.reminderMinutesBefore > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-900 bg-amber-100/70 border border-amber-300 px-1 py-0.5 rounded">
                                      <Bell className="w-2.5 h-2.5" />
                                      Báo trước {item.reminderMinutesBefore}p
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-semibold text-stone-800 text-sm mt-1">
                                  {item.subject}
                                </h4>
                                <div className="space-y-0.5 pt-1 text-xs text-stone-600">
                                  <p className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-stone-600" />
                                    <span>{item.room}</span>
                                  </p>
                                  {item.teacher && (
                                    <p className="flex items-center gap-1">
                                      <User className="w-3 h-3 text-stone-600" />
                                      <span>{item.teacher}</span>
                                    </p>
                                  )}
                                </div>
                                {item.notes && (
                                  <p className="text-[11px] text-stone-600 bg-white/70 p-1.5 rounded mt-2 border border-white/80">
                                    {item.notes}
                                  </p>
                                )}
                              </div>

                              {/* Edit & Delete Action Buttons */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="p-1.5 rounded-lg text-stone-700 hover:text-stone-900 bg-white/80 hover:bg-white shadow-2xs transition-colors"
                                  title="Chỉnh sửa lịch"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setItemToDelete(item)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                                  title="Xóa môn học ghi sai"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span className="hidden sm:inline">Xóa</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleOpenAddModal(day)}
                  className="w-full mt-3 pt-2 text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center justify-center gap-1 border-t border-stone-100"
                >
                  <Plus className="w-3 h-3" />
                  Thêm môn vào {getDayOfWeekLabel(day)}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Day List View */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <h3 className="font-semibold text-stone-800 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-700" />
              Lịch học chi tiết {getDayOfWeekLabel(selectedDayFilter)}
            </h3>
            <span className="text-xs text-stone-600">
              {filteredItems.length} môn học
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-stone-600 text-sm">
              <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              Không có môn học nào vào {getDayOfWeekLabel(selectedDayFilter)}.
              <div className="mt-3">
                <button
                  onClick={() => handleOpenAddModal(selectedDayFilter)}
                  className="px-3.5 py-1.5 bg-amber-100/70 text-amber-900 border border-amber-300 rounded-xl text-xs font-medium hover:bg-amber-100"
                >
                  + Thêm môn học ngay
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((item) => {
                  const theme = getPastelTheme(item.color);
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border ${theme.bg} ${theme.border} transition-all`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${theme.badge}`}>
                              {item.startTime} - {item.endTime}
                            </span>
                            {item.reminderMinutesBefore !== undefined && item.reminderMinutesBefore > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded-md">
                                <Bell className="w-3 h-3" />
                                Báo trước {item.reminderMinutesBefore} phút
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-stone-800 text-base">
                            {item.subject}
                          </h4>
                          <div className="text-xs text-stone-600 space-y-1">
                            <p className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-stone-600" />
                              <span className="font-medium text-stone-700">{item.room}</span>
                            </p>
                            {item.teacher && (
                              <p className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-stone-600" />
                                <span>{item.teacher}</span>
                              </p>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-xs text-stone-600 bg-white/70 p-2 rounded-lg mt-2 border border-white/80">
                              {item.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-stone-700 hover:text-stone-900 bg-white/80 hover:bg-white shadow-2xs transition-colors"
                            title="Chỉnh sửa môn học"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                            title="Xóa môn học ghi sai"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Modal Add / Edit Subject */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-800 text-lg">
                {editingItem ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
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
                    Tên môn học / Học phần <span className="text-rose-500">*</span>
                  </label>
                  {formData.subject && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, subject: '' })}
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
                    placeholder="Ví dụ: Lập trình Web, Toán cao cấp..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 pr-8 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  {formData.subject && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, subject: '' })}
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
                    Thứ trong tuần
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) as DayOfWeek })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {getDayOfWeekLabel(d)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phòng học / Giảng đường
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Phòng A2.301, Lab 4..."
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Giảng viên / Giáo viên phụ trách
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: TS. Nguyễn Lan Anh"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Reminder Feature */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  Chuông báo trước giờ vào học (Âm thanh Chime)
                </label>
                <select
                  value={formData.reminderMinutesBefore}
                  onChange={(e) => setFormData({ ...formData, reminderMinutesBefore: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                >
                  <option value={0}>Không nhắc (Đúng giờ)</option>
                  <option value={5}>Nhắc trước 5 phút</option>
                  <option value={10}>Nhắc trước 10 phút (Mặc định chuẩn)</option>
                  <option value={15}>Nhắc trước 15 phút</option>
                  <option value={30}>Nhắc trước 30 phút</option>
                </select>
                <p className="text-[11px] text-stone-600 mt-1">
                  Hệ thống sẽ phát chuông âm thanh êm tai trước giờ vào lớp để bạn kịp chuẩn bị tập vở và phòng học.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tông màu nhạt (Dịu mắt)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {pastelColors.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setFormData({ ...formData, color: c.id })}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${c.bg} ${
                        formData.color === c.id ? 'ring-2 ring-stone-700 font-bold' : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Ghi chú thêm
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
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Mang giáo trình, slide nhóm, chuẩn bị bài kiểm tra..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                {editingItem ? (
                  <button
                    type="button"
                    onClick={() => {
                      const cur = editingItem;
                      setIsModalOpen(false);
                      setItemToDelete(cur);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                    title="Xóa môn học ghi sai này"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Xóa môn này (ghi sai)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFormData({
                      subject: '',
                      dayOfWeek: selectedDayFilter,
                      startTime: '07:30',
                      endTime: '09:30',
                      room: '',
                      teacher: '',
                      notes: '',
                      color: 'amber',
                      reminderMinutesBefore: 10,
                    })}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                    title="Xóa trắng các ô đã nhập"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Xóa trắng form</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-amber-700 text-white hover:bg-amber-800 shadow-xs"
                  >
                    {editingItem ? 'Lưu thay đổi' : 'Thêm môn học'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        title="Xóa môn học ghi sai"
        itemName={itemToDelete?.subject}
        message={`Bạn có chắc muốn xóa môn học "${itemToDelete?.subject}" (${itemToDelete ? getDayOfWeekLabel(itemToDelete.dayOfWeek) : ''}) không? Thao tác này sẽ xóa vĩnh viễn nội dung ghi sai.`}
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteSubject(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
