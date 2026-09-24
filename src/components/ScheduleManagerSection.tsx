import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Smile, 
  Activity,
  Heart,
  Tag,
  RotateCcw,
  Bell
} from 'lucide-react';
import { RoutineEvent, RoutineCategory, SubjectColor } from '../types';
import { 
  getTodayDateString, 
  getPastelTheme, 
  getFormattedDateFull 
} from '../utils/helpers';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface ScheduleManagerSectionProps {
  events: RoutineEvent[];
  onAddEvent: (event: Omit<RoutineEvent, 'id'>) => void;
  onEditEvent: (event: RoutineEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const ScheduleManagerSection: React.FC<ScheduleManagerSectionProps> = ({
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RoutineEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<RoutineEvent | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    category: RoutineCategory;
    notes: string;
    color: SubjectColor;
    reminderMinutesBefore: number;
  }>({
    title: '',
    date: selectedDate,
    startTime: '08:00',
    endTime: '09:00',
    category: 'sinh_hoat_khac',
    notes: '',
    color: 'amber',
    reminderMinutesBefore: 10,
  });

  const handleOpenAddModal = (date?: string) => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: date || selectedDate,
      startTime: '08:00',
      endTime: '09:00',
      category: 'sinh_hoat_khac',
      notes: '',
      color: 'amber',
      reminderMinutesBefore: 10,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: RoutineEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      category: event.category,
      notes: event.notes || '',
      color: event.color,
      reminderMinutesBefore: event.reminderMinutesBefore ?? 10,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingEvent) {
      onEditEvent({
        ...formData,
        id: editingEvent.id,
      });
    } else {
      onAddEvent(formData);
    }
    setIsModalOpen(false);
  };

  // Calendar math
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Monday-first indexing (0 = Monday, 6 = Sunday)
  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  const totalDays = lastDayOfMonth.getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const selectedDayEvents = events.filter((e) => e.date === selectedDate);

  const getCategoryName = (cat: RoutineCategory) => {
    switch (cat) {
      case 'the_thao': return 'Thể dục & Thể thao';
      case 'nghi_ngoi': return 'Nghỉ ngơi & Thư giãn';
      case 'hoc_bai': return 'Tự học & Nghiên cứu';
      case 'cau_lac_bo': return 'Họp CLB & Hoạt động nhóm';
      case 'sinh_hoat_khac': default: return 'Sinh hoạt cá nhân';
    }
  };

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
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-900 bg-orange-100/70 px-2.5 py-0.5 rounded-full border border-orange-200">
                Lịch & Hoạt động
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight mt-1">
              Quản lý lịch sinh hoạt & sự kiện
            </h2>
            <p className="text-xs text-stone-600">
              Chỉnh sửa hoặc xóa các hoạt động sinh hoạt cá nhân, họp nhóm, tập luyện khi có thay đổi
            </p>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-medium shadow-xs transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm lịch sinh hoạt</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Calendar Picker (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-800 text-base">
              Tháng {month + 1}, {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600"
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-2.5 py-1 text-xs rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium"
              >
                Hôm nay
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600"
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-600 py-1 border-b border-stone-100">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span className="text-rose-600">CN</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty offset cells */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl" />
            ))}

            {/* Month days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === getTodayDateString();
              const dayEventsCount = events.filter((e) => e.date === dateStr).length;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-10 sm:h-12 rounded-xl text-xs font-medium relative flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-700 text-white font-bold shadow-xs'
                      : isToday
                      ? 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span>{dayNum}</span>
                  {dayEventsCount > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      isSelected ? 'bg-white' : 'bg-amber-600'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-stone-600 text-center pt-2">
            Nhấn vào ngày để xem và quản lý danh sách hoạt động sinh hoạt tương ứng
          </p>
        </div>

        {/* Right: Selected Day's Routine Events (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs font-medium text-stone-600">Chi tiết ngày đã chọn</span>
                <h4 className="font-bold text-stone-800 text-sm sm:text-base">
                  {getFormattedDateFull(selectedDate)}
                </h4>
              </div>
              <button
                onClick={() => handleOpenAddModal(selectedDate)}
                className="p-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-medium flex items-center gap-1"
                title="Thêm lịch cho ngày này"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {selectedDayEvents.length === 0 ? (
                <div className="py-10 text-center text-stone-600 text-xs">
                  <Smile className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  Chưa có lịch sinh hoạt nào vào ngày này.
                </div>
              ) : (
                selectedDayEvents
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((ev) => {
                    const theme = getPastelTheme(ev.color);
                    return (
                      <div
                        key={ev.id}
                        className={`p-3.5 rounded-xl border ${theme.bg} ${theme.border} group transition-all`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.badge}`}>
                                {ev.startTime} - {ev.endTime}
                              </span>
                              {ev.reminderMinutesBefore !== undefined && ev.reminderMinutesBefore > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-900 bg-amber-100/70 border border-amber-300 px-1 py-0.5 rounded">
                                  <Bell className="w-2.5 h-2.5" />
                                  Báo trước {ev.reminderMinutesBefore}p
                                </span>
                              )}
                            </div>
                            <h5 className="font-semibold text-stone-800 text-sm">
                              {ev.title}
                            </h5>
                            <span className="text-[11px] text-stone-600 block">
                              {getCategoryName(ev.category)}
                            </span>
                            {ev.notes && (
                              <p className="text-xs text-stone-600 italic bg-white/70 p-1.5 rounded mt-1">
                                {ev.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleOpenEditModal(ev)}
                              className="p-1.5 rounded-lg text-stone-700 hover:text-stone-900 bg-white/80 hover:bg-white shadow-2xs transition-colors"
                              title="Chỉnh sửa lịch"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEventToDelete(ev)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                              title="Xóa lịch sinh hoạt ghi sai"
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
          </div>

          <button
            onClick={() => handleOpenAddModal(selectedDate)}
            className="w-full mt-4 py-2 px-3 rounded-xl border border-dashed border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm sự kiện / Lịch sinh hoạt
          </button>
        </div>
      </div>

      {/* Modal Add / Edit Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-800 text-lg">
                {editingEvent ? 'Chỉnh sửa lịch sinh hoạt' : 'Thêm hoạt động sinh hoạt'}
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
                    Tên hoạt động / Sự kiện <span className="text-rose-500">*</span>
                  </label>
                  {formData.title && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, title: '' })}
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
                    placeholder="Ví dụ: Chạy bộ rèn luyện, Họp CLB Sinh viên..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 pr-8 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  {formData.title && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, title: '' })}
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
                    Ngày thực hiện
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phân loại
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as RoutineCategory })}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                  >
                    <option value="the_thao">Thể dục & Thể thao</option>
                    <option value="nghi_ngoi">Nghỉ ngơi & Thư giãn</option>
                    <option value="hoc_bai">Tự học & Nghiên cứu</option>
                    <option value="cau_lac_bo">Họp CLB & Đội nhóm</option>
                    <option value="sinh_hoat_khac">Sinh hoạt cá nhân khác</option>
                  </select>
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
                  Màu sắc thẻ hoạt động
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

              {/* Reminder feature */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  Cài đặt chuông thông báo nhắc nhở
                </label>
                <select
                  value={formData.reminderMinutesBefore}
                  onChange={(e) => setFormData({ ...formData, reminderMinutesBefore: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                >
                  <option value={0}>Đúng giờ bắt đầu</option>
                  <option value={5}>Nhắc trước 5 phút</option>
                  <option value={10}>Nhắc trước 10 phút (Mặc định chuẩn)</option>
                  <option value={15}>Nhắc trước 15 phút</option>
                  <option value={30}>Nhắc trước 30 phút</option>
                  <option value={60}>Nhắc trước 1 tiếng</option>
                </select>
                <p className="text-[11px] text-stone-600 mt-1">
                  Hệ thống sẽ phát chuông thông báo âm thanh êm dịu trước giờ diễn ra hoạt động.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Ghi chú
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
                  placeholder="Ghi chú thêm về địa điểm, đồ dùng cần mang theo..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                {editingEvent ? (
                  <button
                    type="button"
                    onClick={() => {
                      const cur = editingEvent;
                      setIsModalOpen(false);
                      setEventToDelete(cur);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                    title="Xóa hoạt động ghi sai này"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Xóa lịch này (ghi sai)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFormData({
                      title: '',
                      date: selectedDate,
                      startTime: '08:00',
                      endTime: '09:00',
                      category: 'sinh_hoat_khac',
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
                    {editingEvent ? 'Lưu thay đổi' : 'Thêm hoạt động'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!eventToDelete}
        title="Xóa lịch sinh hoạt ghi sai"
        itemName={eventToDelete?.title}
        message={`Bạn có chắc muốn xóa lịch sinh hoạt "${eventToDelete?.title}" (${eventToDelete?.date} lúc ${eventToDelete?.startTime}) không? Thao tác này sẽ xóa vĩnh viễn nội dung ghi sai.`}
        onConfirm={() => {
          if (eventToDelete) {
            onDeleteEvent(eventToDelete.id);
            setEventToDelete(null);
          }
        }}
        onCancel={() => setEventToDelete(null)}
      />
    </div>
  );
};

