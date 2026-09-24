import { DayOfWeek, SubjectColor, TaskCategory, TaskPriority, ExpenseCategory } from '../types';

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayOfWeekNumber(dateStr?: string): DayOfWeek {
  const date = dateStr ? new Date(dateStr) : new Date();
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  if (day === 0) return 8; // Sunday
  return (day + 1) as DayOfWeek; // 1->2 (Thứ 2), 2->3 (Thứ 3), etc.
}

export function getDayOfWeekLabel(dayNum: DayOfWeek): string {
  switch (dayNum) {
    case 2: return 'Thứ Hai';
    case 3: return 'Thứ Ba';
    case 4: return 'Thứ Tư';
    case 5: return 'Thứ Năm';
    case 6: return 'Thứ Sáu';
    case 7: return 'Thứ Bảy';
    case 8: return 'Chủ Nhật';
    default: return '';
  }
}

export function getFormattedDateFull(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  const dayOfWeek = getDayOfWeekLabel(getDayOfWeekNumber(dateStr));
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${dayOfWeek}, ngày ${day} tháng ${month}, ${year}`;
}

export function getPastelTheme(color: SubjectColor | string) {
  switch (color) {
    case 'peach':
      return {
        bg: 'bg-[#fff2eb]',
        text: 'text-[#823a22]',
        border: 'border-[#fddbc9]',
        badge: 'bg-[#ffe5d9] text-[#6b2b17]',
        bar: '#e27d5f',
      };
    case 'rose':
      return {
        bg: 'bg-[#fff0f3]',
        text: 'text-[#86253c]',
        border: 'border-[#fcced6]',
        badge: 'bg-[#fde0e6] text-[#6d1b2e]',
        bar: '#dc5676',
      };
    case 'lavender':
      return {
        bg: 'bg-[#f7f0fd]',
        text: 'text-[#553372]',
        border: 'border-[#ebd6fc]',
        badge: 'bg-[#eedafb] text-[#472763]',
        bar: '#996ec9',
      };
    case 'caramel':
      return {
        bg: 'bg-[#faf3eb]',
        text: 'text-[#6e431d]',
        border: 'border-[#f1dac4]',
        badge: 'bg-[#f4e4d3] text-[#563415]',
        bar: '#b77943',
      };
    case 'sand':
    case 'stone':
    case 'sage':
    case 'mint':
      return {
        bg: 'bg-[#f9f7f2]',
        text: 'text-[#5e5648]',
        border: 'border-[#e9e4d6]',
        badge: 'bg-[#eee9dc] text-[#4a4337]',
        bar: '#9e937e',
      };
    case 'orange':
      return {
        bg: 'bg-[#fff5ee]',
        text: 'text-[#9a3412]',
        border: 'border-[#fed7aa]',
        badge: 'bg-[#ffedd5] text-[#7c2d12]',
        bar: '#ea580c',
      };
    case 'amber':
    default:
      return {
        bg: 'bg-[#fef8e7]',
        text: 'text-[#715011]',
        border: 'border-[#fae5a8]',
        badge: 'bg-[#fef0cb] text-[#593e0b]',
        bar: '#d9a13b',
      };
  }
}

export function getCategoryBadge(cat: TaskCategory) {
  switch (cat) {
    case 'hoc_tap':
      return { label: 'Học tập', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'cong_viec':
      return { label: 'Công việc', color: 'bg-orange-50 text-orange-800 border-orange-200' };
    case 'ca_nhan':
      return { label: 'Cá nhân', color: 'bg-stone-100 text-stone-800 border-stone-300' };
    case 'sinh_hoat':
      return { label: 'Sinh hoạt', color: 'bg-rose-50 text-rose-800 border-rose-200' };
    default:
      return { label: 'Khác', color: 'bg-stone-100 text-stone-700 border-stone-200' };
  }
}

export function getPriorityBadge(priority: TaskPriority) {
  switch (priority) {
    case 'cao':
      return { label: 'Ưu tiên cao', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'trung_binh':
      return { label: 'Bình thường', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'thap':
      return { label: 'Thấp', color: 'bg-stone-100 text-stone-700 border-stone-200' };
    default:
      return { label: 'Thấp', color: 'bg-stone-100 text-stone-600 border-stone-200' };
  }
}

export function getExpenseCategoryBadge(cat: ExpenseCategory) {
  switch (cat) {
    case 'an_uong': return { label: 'Ăn uống', icon: 'Utensils', color: 'bg-orange-50 text-orange-800 border-orange-200' };
    case 'hoc_tap': return { label: 'Học tập', icon: 'BookOpen', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'di_lai': return { label: 'Đi lại', icon: 'Bus', color: 'bg-amber-100/70 text-amber-900 border-amber-300' };
    case 'mua_sam': return { label: 'Mua sắm', icon: 'ShoppingBag', color: 'bg-rose-50 text-rose-800 border-rose-200' };
    case 'nha_tro': return { label: 'Nhà trọ / Phòng', icon: 'Home', color: 'bg-stone-100 text-stone-800 border-stone-200' };
    case 'giai_tri': return { label: 'Giải trí', icon: 'Gamepad2', color: 'bg-peach text-[#823a22] border-[#fddbc9]' };
    case 'khac': return { label: 'Khác', icon: 'Layers', color: 'bg-stone-100 text-stone-700 border-stone-200' };
    default: return { label: 'Khác', icon: 'Layers', color: 'bg-stone-100 text-stone-700 border-stone-200' };
  }
}
