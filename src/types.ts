export type DayOfWeek = 2 | 3 | 4 | 5 | 6 | 7 | 8; // 2: Thứ 2, ..., 8: Chủ Nhật

export type SubjectColor = 'amber' | 'peach' | 'rose' | 'lavender' | 'caramel' | 'sand' | 'orange' | 'stone';

export interface TimetableItem {
  id: string;
  subject: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "07:30"
  endTime: string;   // "09:30"
  room: string;
  teacher?: string;
  notes?: string;
  color: SubjectColor;
  reminderMinutesBefore?: number; // 0, 5, 10, 15, 30
}

export type ChimeSoundType = 'gentle' | 'bell' | 'school' | 'marimba';

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0.1 to 1.0
  soundType: ChimeSoundType;
  defaultMinutesBefore: number; // Thời gian báo trước (0, 5, 10, 15, 30, 60 phút)
  ringDuration: number; // Thời lượng chuông reo tính bằng giây (5, 10, 15, 30, 60 hoặc 0 = reo liên tục)
  snoozeMinutes: number; // Thời gian báo lại sau khi tạm hoãn (mặc định 5 phút)
  notifyTimetable: boolean; // Báo trước giờ vào học
  notifyTasks: boolean;     // Báo trước hạn nộp bài / công việc
  notifyEvents: boolean;    // Báo trước sự kiện sinh hoạt
}

export type TaskCategory = 'hoc_tap' | 'cong_viec' | 'ca_nhan' | 'sinh_hoat';
export type TaskPriority = 'thap' | 'trung_binh' | 'cao';

export interface TaskItem {
  id: string;
  title: string;
  category: TaskCategory;
  dueDate: string; // "YYYY-MM-DD"
  dueTime?: string; // "HH:mm"
  priority: TaskPriority;
  isCompleted: boolean;
  completedAt?: string;
  reminderMinutesBefore?: number; // 0, 10, 15, 30, 60
  notes?: string;
}

export type RoutineCategory = 'the_thao' | 'nghi_ngoi' | 'hoc_bai' | 'cau_lac_bo' | 'sinh_hoat_khac';

export interface RoutineEvent {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  category: RoutineCategory;
  notes?: string;
  color: SubjectColor;
  reminderMinutesBefore?: number;
}

export type ExpenseType = 'chi' | 'thu';
export type ExpenseCategory = 'an_uong' | 'hoc_tap' | 'di_lai' | 'mua_sam' | 'nha_tro' | 'giai_tri' | 'khac';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  type: ExpenseType;
  category: ExpenseCategory;
  date: string; // "YYYY-MM-DD"
  notes?: string;
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'task' | 'class' | 'event' | 'system';
  isRead: boolean;
}

export type AppTab = 
  | 'tong_quan'       // Lịch sinh hoạt tổng hợp
  | 'thoi_khoa_bieu'  // Thời khóa biểu
  | 'cong_viec'       // Ghi chú & Theo dõi công việc
  | 'quan_ly_lich'    // Quản lý lịch
  | 'chi_tieu'        // Quản lý chi tiêu
  | 'cai_dat';        // Cài đặt & Dữ liệu
