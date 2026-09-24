import { TimetableItem, TaskItem, RoutineEvent, ExpenseItem, NotificationAlert } from '../types';
import { getTodayDateString } from '../utils/helpers';

const today = getTodayDateString();

// Generate yesterday and tomorrow for realistic dates
const d = new Date();
const dTomorrow = new Date(d);
dTomorrow.setDate(d.getDate() + 1);
const tomorrow = dTomorrow.toISOString().split('T')[0];

export const initialTimetable: TimetableItem[] = [
  {
    id: 'tt-1',
    subject: 'Toán Cao Cấp & Đại Số Tuyến Tính',
    dayOfWeek: 2, // Thứ Hai
    startTime: '07:30',
    endTime: '09:30',
    room: 'Phòng A2.301',
    teacher: 'ThS. Hoàng Minh Tuấn',
    notes: 'Mang theo máy tính cầm tay và giáo trình tập 1',
    color: 'amber',
    reminderMinutesBefore: 10,
  },
  {
    id: 'tt-2',
    subject: 'Tiếng Anh Học Thuật (B1)',
    dayOfWeek: 2, // Thứ Hai
    startTime: '09:45',
    endTime: '11:45',
    room: 'Phòng B1.102',
    teacher: 'Cô Emma Johnson',
    notes: 'Thuyết trình nhóm chủ đề Environmental Issues',
    color: 'lavender',
    reminderMinutesBefore: 10,
  },
  {
    id: 'tt-3',
    subject: 'Lập Trình Web & Giao Diện Người Dùng',
    dayOfWeek: 3, // Thứ Ba
    startTime: '13:30',
    endTime: '16:30',
    room: 'Phòng Lab 4 - Tòa CNTT',
    teacher: 'TS. Nguyễn Lan Anh',
    notes: 'Thực hành React component & Tailwind CSS',
    color: 'caramel',
    reminderMinutesBefore: 10,
  },
  {
    id: 'tt-4',
    subject: 'Kỹ Năng Giao Tiếp & Thuyết Trình',
    dayOfWeek: 4, // Thứ Tư
    startTime: '08:00',
    endTime: '10:15',
    room: 'Hội trường H3',
    teacher: 'ThS. Trần Thị Mai',
    notes: 'Chuẩn bị slide giới thiệu dự án cá nhân',
    color: 'peach',
    reminderMinutesBefore: 10,
  },
  {
    id: 'tt-5',
    subject: 'Cấu Trúc Dữ Liệu & Giải Thuật',
    dayOfWeek: 5, // Thứ Năm
    startTime: '13:30',
    endTime: '16:00',
    room: 'Phòng A1.205',
    teacher: 'PGS. TS. Lê Quốc Bảo',
    notes: 'Kiểm tra 15 phút bài tập Binary Search Tree',
    color: 'rose',
    reminderMinutesBefore: 10,
  },
  {
    id: 'tt-6',
    subject: 'Giáo Dục Thể Chất (Bóng Rổ)',
    dayOfWeek: 6, // Thứ Sáu
    startTime: '07:30',
    endTime: '09:30',
    room: 'Nhà thi đấu Đa năng',
    teacher: 'Thầy Đoàn Thanh Tùng',
    notes: 'Mặc đồng phục thể dục, mang giày thể thao',
    color: 'sand',
    reminderMinutesBefore: 10,
  },
];

export const initialTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Hoàn thành bài tập lớn Lập Trình Web',
    category: 'hoc_tap',
    dueDate: today,
    dueTime: '20:00',
    priority: 'cao',
    isCompleted: false,
    reminderMinutesBefore: 10,
    notes: 'Kiểm tra lại tính năng responsive và push code lên GitHub',
  },
  {
    id: 'task-2',
    title: 'Ôn từ vựng Tiếng Anh Unit 4 & bài nghe',
    category: 'hoc_tap',
    dueDate: today,
    dueTime: '21:30',
    priority: 'trung_binh',
    isCompleted: false,
    reminderMinutesBefore: 10,
    notes: 'Luyện tập phát âm và hoàn thiện bài tập sách bài tập trang 42',
  },
  {
    id: 'task-3',
    title: 'Đăng ký môn học kỳ phụ trên cổng đào tạo',
    category: 'cong_viec',
    dueDate: tomorrow,
    dueTime: '09:00',
    priority: 'cao',
    isCompleted: false,
    reminderMinutesBefore: 10,
    notes: 'Cổng mở lúc 9h sáng, nhớ kiểm tra mã lớp học phần',
  },
  {
    id: 'task-4',
    title: 'Mua giáo trình Kỹ Năng Giao Tiếp tại nhà sách trường',
    category: 'ca_nhan',
    dueDate: today,
    dueTime: '12:15',
    priority: 'thap',
    isCompleted: true,
    completedAt: `${today} 12:30`,
    reminderMinutesBefore: 10,
    notes: 'Đã mua xong bản tái bản mới nhất',
  },
  {
    id: 'task-5',
    title: 'Dọn dẹp bàn học và giặt quần áo cuối tuần',
    category: 'sinh_hoat',
    dueDate: tomorrow,
    dueTime: '17:00',
    priority: 'thap',
    isCompleted: false,
    reminderMinutesBefore: 10,
    notes: 'Phơi đồ trước khi trời tối',
  },
];

export const initialRoutineEvents: RoutineEvent[] = [
  {
    id: 'rt-1',
    title: 'Chạy bộ thể dục buổi sáng công viên',
    date: today,
    startTime: '06:00',
    endTime: '06:45',
    category: 'the_thao',
    notes: 'Chạy nhẹ nhàng 3km khởi động ngày mới',
    color: 'amber',
    reminderMinutesBefore: 10,
  },
  {
    id: 'rt-2',
    title: 'Ăn trưa & Nghỉ ngơi ngắn',
    date: today,
    startTime: '12:00',
    endTime: '13:00',
    category: 'nghi_ngoi',
    notes: 'Chợp mắt 20-30 phút để tỉnh táo buổi chiều',
    color: 'peach',
    reminderMinutesBefore: 10,
  },
  {
    id: 'rt-3',
    title: 'Họp Câu Lạc Bộ Sinh Viên Tình Nguyện',
    date: today,
    startTime: '17:30',
    endTime: '18:45',
    category: 'cau_lac_bo',
    notes: 'Thảo luận kế hoạch chương trình mùa hè xanh sắp tới',
    color: 'lavender',
    reminderMinutesBefore: 10,
  },
  {
    id: 'rt-4',
    title: 'Góc tự học & Đọc sách chuyên ngành',
    date: today,
    startTime: '20:30',
    endTime: '22:30',
    category: 'hoc_bai',
    notes: 'Tập trung sâu không lướt mạng xã hội',
    color: 'caramel',
    reminderMinutesBefore: 10,
  },
];

export const initialExpenses: ExpenseItem[] = [
  {
    id: 'exp-1',
    title: 'Cơm trưa căng tin trường',
    amount: 35000,
    type: 'chi',
    category: 'an_uong',
    date: today,
    notes: 'Cơm sườn + canh rau cải',
  },
  {
    id: 'exp-2',
    title: 'Mua giáo trình Kỹ Năng Giao Tiếp',
    amount: 65000,
    type: 'chi',
    category: 'hoc_tap',
    date: today,
    notes: 'Sách in tại nhà xuất bản trường',
  },
  {
    id: 'exp-3',
    title: 'Vé tháng xe buýt sinh viên',
    amount: 100000,
    type: 'chi',
    category: 'di_lai',
    date: today,
    notes: 'Vé liên tuyến sinh viên tháng này',
  },
  {
    id: 'exp-4',
    title: 'Lương trợ giảng / làm thêm bán thời gian',
    amount: 1800000,
    type: 'thu',
    category: 'khac',
    date: today,
    notes: 'Thanh toán đợt giữa tháng',
  },
  {
    id: 'exp-5',
    title: 'Trà sen học nhóm cùng bạn',
    amount: 32000,
    type: 'chi',
    category: 'an_uong',
    date: today,
    notes: 'Quán cà phê gần thư viện',
  },
];

export const initialNotifications: NotificationAlert[] = [
  {
    id: 'notif-1',
    title: 'Chào mừng bạn đến với Quản Lý Sinh Hoạt Cá Nhân',
    message: 'Chúc bạn một ngày học tập và làm việc thật hiệu quả, tràn đầy năng lượng!',
    timestamp: 'Vừa xong',
    type: 'system',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Nhắc nhở bài tập lớn',
    message: 'Bài tập lớn Lập Trình Web cần hoàn thành trước 20:00 hôm nay.',
    timestamp: 'Hôm nay',
    type: 'task',
    isRead: false,
  },
];
