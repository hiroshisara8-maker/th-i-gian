import React, { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  Check, 
  Trash2, 
  Clock, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Sliders, 
  CheckSquare,
  Timer,
  Square
} from 'lucide-react';
import { NotificationAlert, TaskItem, TimetableItem, RoutineEvent, SoundSettings, ChimeSoundType } from '../types';
import { playSoftChime, unlockAudio, startRinging, stopRinging } from '../utils/audio';
import { getDayOfWeekNumber, getTodayDateString } from '../utils/helpers';
import { sendSystemAlert } from '../utils/systemNotification';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationAlert[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  tasks: TaskItem[];
  timetable: TimetableItem[];
  routineEvents: RoutineEvent[];
  soundSettings: SoundSettings;
  onUpdateSoundSettings: (settings: SoundSettings) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
  tasks,
  timetable,
  routineEvents,
  soundSettings,
  onUpdateSoundSettings,
}) => {
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const soundOptions: { id: ChimeSoundType; label: string; desc: string }[] = [
    { id: 'gentle', label: 'Êm dịu (Gentle)', desc: '2 nốt ngân du dương, không giật mình' },
    { id: 'bell', label: 'Chuông ngân (Bell)', desc: '3 nốt trong trẻo, tươi sáng' },
    { id: 'school', label: 'Chuông lớp học (School)', desc: '4 nốt quen thuộc báo giờ vào tiết' },
    { id: 'marimba', label: 'Mộc cầm (Marimba)', desc: 'Âm thanh gõ gỗ ấm áp, thư thái' },
  ];

  const [isRingingTest, setIsRingingTest] = useState(false);
  const [testRemainingSec, setTestRemainingSec] = useState(0);

  const handleTestSound = async (type?: ChimeSoundType) => {
    if (isRingingTest) {
      stopRinging();
      setIsRingingTest(false);
    }
    await unlockAudio();
    playSoftChime(type || soundSettings.soundType, soundSettings.volume);
  };

  const handleToggleRingDurationTest = async () => {
    if (isRingingTest) {
      stopRinging();
      setIsRingingTest(false);
      return;
    }

    setIsRingingTest(true);
    await unlockAudio();
    const duration = soundSettings.ringDuration !== undefined ? soundSettings.ringDuration : 15;
    setTestRemainingSec(duration);

    startRinging(
      soundSettings.soundType,
      soundSettings.volume,
      duration,
      () => {
        setIsRingingTest(false);
      },
      (remaining) => {
        setTestRemainingSec(remaining);
      }
    );
  };

  const handleRequestPermission = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        await unlockAudio();
        const result = await Notification.requestPermission();
        setBrowserPermission(result);
        if (result === 'granted') {
          playSoftChime(soundSettings.soundType, soundSettings.volume);
          sendSystemAlert(
            'Quản Lý Sinh Hoạt Cá Nhân',
            'Đã kích hoạt: Chuông và thông báo sẽ phát trước 10 phút ngay cả khi đang dùng ứng dụng khác!'
          );
        }
      } catch (e) {
        console.error('Notification error:', e);
      }
    }
  };

  // Find today's reminders across tasks, classes, and routine
  const todayStr = getTodayDateString();
  const currentDayOfWeek = getDayOfWeekNumber();

  const todayClasses = timetable
    .filter((t) => t.dayOfWeek === currentDayOfWeek)
    .map((c) => ({
      id: c.id,
      title: `Học: ${c.subject}`,
      time: c.startTime,
      place: c.room,
      reminderMin: c.reminderMinutesBefore ?? 10,
      type: 'class' as const,
    }));

  const todayTasks = tasks
    .filter((t) => !t.isCompleted && t.dueDate === todayStr && t.dueTime)
    .map((t) => ({
      id: t.id,
      title: `Việc: ${t.title}`,
      time: t.dueTime!,
      place: '',
      reminderMin: t.reminderMinutesBefore ?? 10,
      type: 'task' as const,
    }));

  const todayRoutines = routineEvents
    .filter((r) => r.date === todayStr)
    .map((r) => ({
      id: r.id,
      title: `Lịch: ${r.title}`,
      time: r.startTime,
      place: '',
      reminderMin: r.reminderMinutesBefore ?? 10,
      type: 'event' as const,
    }));

  const allTodayReminders = [...todayClasses, ...todayTasks, ...todayRoutines]
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-lg">
                Chuông thông báo & Nhắc nhở
              </h3>
              <p className="text-xs text-stone-600">
                Tự động reo chuông êm dịu trước 10 phút để không quên lịch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 text-sm font-semibold rounded-lg hover:bg-stone-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 scrollbar-thin">
          {/* Notification Sound Settings Panel */}
          <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-700" />
                  Âm thanh chuông báo trước 10 phút
                </span>
                <p className="text-xs text-stone-600">
                  Chuông báo nhẹ nhàng, không giật mình khi học tập và làm việc
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundSettings.enabled}
                  onChange={(e) => onUpdateSoundSettings({ ...soundSettings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-700"></div>
              </label>
            </div>

            {soundSettings.enabled && (
              <div className="space-y-3 pt-2 border-t border-amber-200/50">
                {/* Sound Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Kiểu chuông thông báo
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {soundOptions.map((opt) => {
                      const isSelected = soundSettings.soundType === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            onUpdateSoundSettings({ ...soundSettings, soundType: opt.id });
                            handleTestSound(opt.id);
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-amber-100/70 border-amber-400 shadow-2xs font-semibold'
                              : 'bg-white border-stone-200 hover:border-amber-200'
                          }`}
                        >
                          <div>
                            <p className="text-xs text-stone-800 font-medium">{opt.label}</p>
                            <p className="text-[10px] text-stone-600 leading-tight mt-0.5">{opt.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestSound(opt.id);
                            }}
                            className="p-1 rounded-md bg-stone-100 hover:bg-amber-200 text-stone-700 text-[10px] shrink-0"
                            title="Nghe thử"
                          >
                            <Play className="w-3 h-3 text-amber-900" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700">Âm lượng chuông:</span>
                    <span className="text-amber-800 font-bold">{Math.round(soundSettings.volume * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={soundSettings.volume}
                      onChange={(e) => onUpdateSoundSettings({ ...soundSettings, volume: Number(e.target.value) })}
                      className="w-full accent-amber-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => handleTestSound()}
                      className="px-2 py-1 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-lg text-xs font-medium shrink-0 transition-colors"
                    >
                      Thử
                    </button>
                  </div>
                </div>

                {/* Ring Duration and Lead Time Settings */}
                <div className="pt-2 border-t border-amber-200/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-amber-800" />
                      Thời lượng chuông reo:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isRingingTest ? (
                        <button
                          type="button"
                          onClick={handleToggleRingDurationTest}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold flex items-center gap-1"
                        >
                          <Square className="w-2.5 h-2.5 fill-current" />
                          <span>Dừng ({testRemainingSec}s)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleToggleRingDurationTest}
                          className="px-2 py-0.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-[11px] font-medium flex items-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>Thử reo</span>
                        </button>
                      )}
                      <span className="text-amber-900 font-bold bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-300 text-[11px]">
                        {soundSettings.ringDuration > 0 ? `${soundSettings.ringDuration}s` : 'Liên tục'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      { val: 5, label: '5s' },
                      { val: 10, label: '10s' },
                      { val: 15, label: '15s (Chuẩn)' },
                      { val: 30, label: '30s' },
                      { val: 60, label: '1p' },
                      { val: 0, label: 'Liên tục' },
                    ].map((d) => {
                      const isSelected = soundSettings.ringDuration === d.val;
                      return (
                        <button
                          key={d.val}
                          type="button"
                          onClick={() => onUpdateSoundSettings({ ...soundSettings, ringDuration: d.val })}
                          className={`py-1 px-1.5 rounded text-[11px] font-medium border text-center transition-colors ${
                            isSelected
                              ? 'bg-amber-700 text-white border-amber-700'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Categories applied */}
                <div className="pt-2 border-t border-amber-200/50 space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-700">
                    Kích hoạt chuông thông báo cho:
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <label className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-stone-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={soundSettings.notifyTimetable}
                        onChange={(e) => onUpdateSoundSettings({ ...soundSettings, notifyTimetable: e.target.checked })}
                        className="rounded text-amber-700 accent-amber-700"
                      />
                      <span>Lịch học trên lớp</span>
                    </label>
                    <label className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-stone-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={soundSettings.notifyTasks}
                        onChange={(e) => onUpdateSoundSettings({ ...soundSettings, notifyTasks: e.target.checked })}
                        className="rounded text-amber-700 accent-amber-700"
                      />
                      <span>Hạn nộp & Công việc</span>
                    </label>
                    <label className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-stone-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={soundSettings.notifyEvents}
                        onChange={(e) => onUpdateSoundSettings({ ...soundSettings, notifyEvents: e.target.checked })}
                        className="rounded text-amber-700 accent-amber-700"
                      />
                      <span>Lịch sinh hoạt cá nhân</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Device Push Notification Toggle */}
            {typeof Notification !== 'undefined' && (
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-stone-800">
                    Cho phép chạy và báo chuông trên ứng dụng khác
                  </span>
                  <p className="text-[11px] text-stone-600">
                    {browserPermission === 'granted' ? 'Đã kích hoạt: Sẵn sàng báo chuông khi dùng ứng dụng khác' : 'Nhận thông báo và chuông reo dù đang dùng Word, YouTube, game...'}
                  </p>
                </div>
                {browserPermission !== 'granted' ? (
                  <button
                    onClick={handleRequestPermission}
                    className="px-2.5 py-1 bg-amber-700 text-white hover:bg-amber-800 rounded-lg text-xs font-medium transition-colors shadow-2xs"
                  >
                    Cho phép
                  </button>
                ) : (
                  <span className="text-xs text-amber-900 font-medium bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-300">
                    Đã bật ✓
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Today's upcoming reminders list */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Lịch nhắc nhở hôm nay ({allTodayReminders.length})
              </span>
              <span className="text-[11px] font-normal text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Chuông reo trước 10 phút
              </span>
            </h4>

            {allTodayReminders.length === 0 ? (
              <p className="text-xs text-stone-600 italic bg-stone-50/50 p-3 rounded-xl border border-stone-100 text-center">
                Hôm nay không có lịch học hoặc công việc nào cần nhắc nhở.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allTodayReminders.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between text-xs hover:border-amber-200 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-stone-800">{item.title}</p>
                      <p className="text-stone-600 text-[11px] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-stone-500" />
                        Diễn ra lúc: <strong className="text-stone-800">{item.time}</strong>
                        {item.place && <span className="text-stone-600">• {item.place}</span>}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-[11px] shrink-0">
                      <Bell className="w-2.5 h-2.5 text-amber-700" />
                      Báo trước {item.reminderMin}p
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History of alerts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Lịch sử chuông đã reo ({notifications.length})
              </h4>
              <div className="flex items-center gap-2">
                {notifications.some((n) => !n.isRead) && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-[11px] text-amber-800 hover:text-amber-900 font-medium"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-[11px] text-stone-600 hover:text-rose-600 font-medium"
                  >
                    Xóa lịch sử
                  </button>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-stone-600 italic bg-stone-50/50 p-3 rounded-xl border border-stone-100 text-center">
                Chưa có thông báo lịch sử nào. Chuông sẽ reo tự động khi đến 10 phút trước giờ.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border transition-all text-xs ${
                      n.isRead
                        ? 'bg-stone-50/50 border-stone-200/60 opacity-85'
                        : 'bg-amber-50/70 border-amber-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-semibold text-stone-800 flex items-center gap-1">
                          <Bell className="w-3 h-3 text-amber-700" />
                          {n.title}
                        </h5>
                        <p className="text-stone-600 mt-0.5 leading-relaxed text-[11px]">{n.message}</p>
                      </div>
                      <span className="text-[10px] text-stone-600 shrink-0 font-medium">
                        {n.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={() => handleTestSound()}
            className="flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-900 font-medium"
          >
            <Play className="w-3.5 h-3.5" />
            Thử chuông hiện tại
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-amber-700 text-white hover:bg-amber-800 shadow-xs transition-colors"
          >
            Hoàn tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
