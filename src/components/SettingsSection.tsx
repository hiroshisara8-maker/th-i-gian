import React, { useRef, useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Heart,
  ShieldCheck,
  Smartphone,
  Volume2,
  Bell,
  Play,
  Timer,
  Clock,
  Square
} from 'lucide-react';
import { TimetableItem, TaskItem, RoutineEvent, ExpenseItem, SoundSettings, ChimeSoundType } from '../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { playSoftChime, unlockAudio, startRinging, stopRinging } from '../utils/audio';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus, 
  sendSystemAlert 
} from '../utils/systemNotification';

interface SettingsSectionProps {
  timetable: TimetableItem[];
  tasks: TaskItem[];
  routineEvents: RoutineEvent[];
  expenses: ExpenseItem[];
  soundSettings?: SoundSettings;
  onUpdateSoundSettings?: (settings: SoundSettings) => void;
  onResetToSampleData: () => void;
  onClearAllData: () => void;
  onImportData: (data: {
    timetable?: TimetableItem[];
    tasks?: TaskItem[];
    routineEvents?: RoutineEvent[];
    expenses?: ExpenseItem[];
    soundSettings?: SoundSettings;
  }) => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  timetable,
  tasks,
  routineEvents,
  expenses,
  soundSettings,
  onUpdateSoundSettings,
  onResetToSampleData,
  onClearAllData,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const soundOptions: { id: ChimeSoundType; label: string; desc: string }[] = [
    { id: 'gentle', label: 'Êm dịu (Gentle)', desc: '2 nốt ngân du dương, thanh thoát' },
    { id: 'bell', label: 'Chuông ngân (Bell)', desc: '3 nốt chuông trong sáng' },
    { id: 'school', label: 'Chuông trường (School)', desc: '4 nốt vào tiết thân quen' },
    { id: 'marimba', label: 'Mộc cầm (Marimba)', desc: 'Gõ phím gỗ ấm cúng' },
  ];

  const [bgPermission, setBgPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    return getNotificationPermissionStatus();
  });

  const [isRingingTest, setIsRingingTest] = useState(false);
  const [testRemainingSec, setTestRemainingSec] = useState(0);

  const handleTestSound = async (type?: ChimeSoundType) => {
    if (isRingingTest) {
      stopRinging();
      setIsRingingTest(false);
    }
    await unlockAudio();
    if (soundSettings) {
      playSoftChime(type || soundSettings.soundType, soundSettings.volume);
    } else {
      playSoftChime(type || 'bell', 0.8);
    }
  };

  const handleToggleRingDurationTest = async () => {
    if (isRingingTest) {
      stopRinging();
      setIsRingingTest(false);
      setStatusMessage({ text: 'Đã dừng phát chuông thử nghiệm', type: 'success' });
      setTimeout(() => setStatusMessage(null), 2500);
      return;
    }

    setIsRingingTest(true);
    await unlockAudio();
    const duration = soundSettings?.ringDuration !== undefined ? soundSettings.ringDuration : 15;
    setTestRemainingSec(duration);

    startRinging(
      soundSettings?.soundType || 'bell',
      soundSettings?.volume || 0.8,
      duration,
      () => {
        setIsRingingTest(false);
        setStatusMessage({ text: 'Đã hoàn tất thời gian phát thử chuông', type: 'success' });
        setTimeout(() => setStatusMessage(null), 2500);
      },
      (remaining) => {
        setTestRemainingSec(remaining);
      }
    );
  };

  const handleEnableCrossApp = async () => {
    await unlockAudio();
    const result = await requestNotificationPermission();
    setBgPermission(result);
    if (result === 'granted') {
      sendSystemAlert(
        'Đã kích hoạt chế độ chạy trên ứng dụng khác',
        'Ứng dụng sẽ báo chuông và thông báo trước 10 phút ngay cả khi bạn mở Word, xem video hoặc chơi game.'
      );
      playSoftChime(soundSettings?.soundType || 'bell', soundSettings?.volume || 0.8);
      setStatusMessage({ text: 'Đã cấp quyền chạy trên ứng dụng khác thành công!', type: 'success' });
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleTestCrossAppAlert = async () => {
    await unlockAudio();
    sendSystemAlert(
      'Thử nghiệm thông báo trên ứng dụng khác',
      'Chuông đã reo và thông báo đã xuất hiện thành công trên màn hình!'
    );
    playSoftChime(soundSettings?.soundType || 'bell', soundSettings?.volume || 0.8);
    setStatusMessage({ text: 'Đã gửi thông báo hệ thống thử nghiệm!', type: 'success' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExport = () => {
    const backupData = {
      app: 'QuanLySinhHoatCaNhan',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        timetable,
        tasks,
        routineEvents,
        expenses,
        soundSettings,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sinh-hoat-ca-nhan-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'Đã xuất file sao lưu thành công!', type: 'success' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data) {
          onImportData(parsed.data);
          setStatusMessage({ text: 'Khôi phục dữ liệu từ tệp thành công!', type: 'success' });
        } else {
          setStatusMessage({ text: 'Tệp sao lưu không đúng cấu trúc ứng dụng!', type: 'error' });
        }
      } catch (err) {
        setStatusMessage({ text: 'Không thể đọc tệp sao lưu. Vui lòng kiểm tra lại!', type: 'error' });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-300">
            Hệ thống & Cài đặt
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight mt-1">
          Dữ liệu & Cài đặt cá nhân
        </h2>
        <p className="text-xs text-stone-600">
          Quản lý sao lưu dữ liệu, khôi phục cài đặt gốc và tối ưu hóa trải nghiệm
        </p>

        {statusMessage && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-medium border ${
            statusMessage.type === 'success' 
              ? 'bg-amber-50 text-amber-900 border-amber-300' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {statusMessage.text}
          </div>
        )}
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-600 block">Thời khóa biểu</span>
          <span className="text-2xl font-bold text-amber-900 mt-1 block">{timetable.length}</span>
          <span className="text-[11px] text-stone-600">tiết học / tuần</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-600 block">Công việc & Mục tiêu</span>
          <span className="text-2xl font-bold text-stone-800 mt-1 block">{tasks.length}</span>
          <span className="text-[11px] text-stone-600">nhiệm vụ đã lưu</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-600 block">Lịch sinh hoạt</span>
          <span className="text-2xl font-bold text-orange-800 mt-1 block">{routineEvents.length}</span>
          <span className="text-[11px] text-stone-600">hoạt động ghi nhận</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-600 block">Quản lý chi tiêu</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">{expenses.length}</span>
          <span className="text-[11px] text-stone-600">giao dịch tài chính</span>
        </div>
      </div>

      {/* Sound Reminder Settings Card */}
      {soundSettings && onUpdateSoundSettings && (
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-base">
                  Cài đặt âm thanh & Thời gian chuông reo thông báo
                </h3>
                <p className="text-xs text-stone-600">
                  Phát âm thanh chuông nhắc nhở chuẩn xác, tùy chỉnh thời lượng chuông reo và thời gian báo trước
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundSettings.enabled}
                onChange={(e) => onUpdateSoundSettings({ ...soundSettings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-700"></div>
            </label>
          </div>

          {soundSettings.enabled ? (
            <div className="space-y-4">
              {/* Thời lượng chuông reo (Ring Duration) */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-amber-800" />
                    <span className="font-bold text-xs text-stone-800">
                      Thời lượng chuông reo (Ring Duration):
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    {soundSettings.ringDuration > 0 ? `${soundSettings.ringDuration} giây` : 'Reo liên tục cho đến khi tắt'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Chuông sẽ reo lặp lại liên tục trong đúng khoảng thời gian này khi đến giờ nhắc nhở.
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {[
                    { val: 5, label: '5 giây' },
                    { val: 10, label: '10 giây' },
                    { val: 15, label: '15 giây (Chuẩn)' },
                    { val: 30, label: '30 giây' },
                    { val: 60, label: '1 phút' },
                    { val: 0, label: 'Reo liên tục' },
                  ].map((dur) => {
                    const isSelected = soundSettings.ringDuration === dur.val;
                    return (
                      <button
                        key={dur.val}
                        type="button"
                        onClick={() => onUpdateSoundSettings({ ...soundSettings, ringDuration: dur.val })}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                          isSelected
                            ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300 hover:bg-amber-50/40'
                        }`}
                      >
                        {dur.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Thời gian chuông reo báo trước mặc định (Lead Time) */}
              <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-700" />
                    <span className="font-bold text-xs text-stone-800">
                      Thời gian chuông reo báo trước mặc định (Lead Time):
                    </span>
                  </div>
                  <span className="text-xs font-bold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-300">
                    {soundSettings.defaultMinutesBefore === 0 ? 'Đúng giờ' : `Trước ${soundSettings.defaultMinutesBefore} phút`}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Thời điểm chuông reo trước khi bắt đầu tiết học, hạn công việc hoặc sinh hoạt.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                  {[
                    { val: 0, label: 'Đúng giờ' },
                    { val: 5, label: 'Trước 5 phút' },
                    { val: 10, label: 'Trước 10 phút' },
                    { val: 15, label: 'Trước 15 phút' },
                    { val: 30, label: 'Trước 30 phút' },
                    { val: 60, label: 'Trước 1 tiếng' },
                  ].map((lt) => {
                    const isSelected = (soundSettings.defaultMinutesBefore ?? 10) === lt.val;
                    return (
                      <button
                        key={lt.val}
                        type="button"
                        onClick={() => onUpdateSoundSettings({ ...soundSettings, defaultMinutesBefore: lt.val })}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                          isSelected
                            ? 'bg-stone-800 text-white border-stone-800 shadow-2xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-100'
                        }`}
                      >
                        {lt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chime Sound Style & Live Trial */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-stone-700">
                    Lựa chọn âm sắc chuông (Không gây giật mình):
                  </label>
                  <div className="flex items-center gap-2">
                    {isRingingTest ? (
                      <button
                        type="button"
                        onClick={handleToggleRingDurationTest}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Dừng reo ({testRemainingSec}s)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleToggleRingDurationTest}
                        className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Play className="w-3 h-3 ml-0.5" />
                        <span>Thử reo chuông ({soundSettings.ringDuration || 15}s)</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {soundOptions.map((opt) => {
                    const isSelected = soundSettings.soundType === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          onUpdateSoundSettings({ ...soundSettings, soundType: opt.id });
                          handleTestSound(opt.id);
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-400 shadow-2xs'
                            : 'bg-stone-50/40 border-stone-200 hover:border-amber-200'
                        }`}
                      >
                        <div>
                          <p className="text-xs text-stone-900 font-semibold">{opt.label}</p>
                          <p className="text-[11px] text-stone-600 mt-0.5">{opt.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestSound(opt.id);
                          }}
                          className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-amber-100 text-[11px] font-medium flex items-center gap-1 shrink-0"
                        >
                          <Play className="w-3 h-3 text-amber-800" />
                          <span>Nghe thử 1 nốt</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Volume */}
              <div className="bg-stone-50/60 p-3 rounded-xl border border-stone-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">Âm lượng chuông thông báo:</span>
                  <span className="text-amber-900 font-bold">{Math.round(soundSettings.volume * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={soundSettings.volume}
                    onChange={(e) => onUpdateSoundSettings({ ...soundSettings, volume: Number(e.target.value) })}
                    className="w-full accent-amber-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestSound()}
                    className="px-3 py-1 bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 rounded-lg text-xs font-medium shrink-0 transition-colors"
                  >
                    Thử chuông
                  </button>
                </div>
              </div>

              {/* Reminder default time notice & scopes */}
              <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-stone-600">
                  Tự động reo chuông thông báo cho:
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundSettings.notifyTimetable}
                      onChange={(e) => onUpdateSoundSettings({ ...soundSettings, notifyTimetable: e.target.checked })}
                      className="rounded text-amber-700 accent-amber-700"
                    />
                    <span>Thời khóa biểu</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundSettings.notifyTasks}
                      onChange={(e) => onUpdateSoundSettings({ ...soundSettings, notifyTasks: e.target.checked })}
                      className="rounded text-amber-700 accent-amber-700"
                    />
                    <span>Công việc</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundSettings.notifyEvents}
                      onChange={(e) => onUpdateSoundSettings({ ...soundSettings, notifyEvents: e.target.checked })}
                      className="rounded text-amber-700 accent-amber-700"
                    />
                    <span>Sinh hoạt</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic">
              Chuông âm thanh đang tắt. Bạn có thể bật công tắc ở trên để nhận thông báo âm thanh trước khi đến giờ.
            </p>
          )}
        </div>
      )}

      {/* Cross-App Background Execution Card */}
      <div id="cross-app-settings-card" className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-base">
                Chạy trên ứng dụng khác & Báo chuông nền
              </h3>
              <p className="text-xs text-stone-600">
                Cho phép thông báo và chuông reo to rõ ngay cả khi bạn đang dùng Word, xem YouTube hay lướt web
              </p>
            </div>
          </div>
          {bgPermission === 'granted' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã kích hoạt</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleEnableCrossApp}
              className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Cho phép ngay
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Web Worker nền</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              Bộ đếm thời gian chạy trên luồng phụ độc lập, không bị trình duyệt làm chậm lại khi chuyển sang cửa sổ ứng dụng khác.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Âm thanh nghe rõ</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              Tích hợp bộ nén âm thanh (Dynamics Compressor) cho âm sắc chuông vang, trong trẻo và dễ nghe thấy từ khoảng cách xa.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <Bell className="w-3.5 h-3.5 text-amber-700" />
              <span>Cửa sổ nổi hệ thống</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              Biểu ngữ thông báo hiện trực tiếp trên màn hình máy tính/điện thoại, bấm vào sẽ tự động chuyển về ứng dụng.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestCrossAppAlert}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-amber-800" />
              <span>Gửi thông báo & Chuông thử nghiệm</span>
            </button>
            <button
              type="button"
              onClick={() => handleTestSound()}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-colors"
            >
              Thử loa
            </button>
          </div>
          <span className="text-[11px] text-stone-500">
            Khuyên dùng: Bật loa thiết bị ở mức 50% trở lên để chuông báo đạt hiệu quả tối ưu.
          </span>
        </div>
      </div>

      {/* Backup and Restore Box */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs space-y-4">
        <h3 className="font-bold text-stone-800 text-base">
          Sao lưu & Đồng bộ tệp cá nhân
        </h3>
        <p className="text-xs text-stone-600">
          Dữ liệu của bạn được lưu tự động trên thiết bị trình duyệt (LocalStorage). Bạn có thể tải file sao lưu về máy để lưu trữ hoặc chuyển sang máy khác.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-medium shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Xuất bản sao lưu (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-xs font-medium transition-all"
          >
            <Upload className="w-4 h-4 text-stone-600" />
            <span>Nhập tệp sao lưu</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-all"
          >
            <RotateCcw className="w-4 h-4 text-stone-600" />
            <span>Nạp lại dữ liệu mẫu</span>
          </button>

          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium transition-all ml-auto"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Xóa sạch dữ liệu</span>
          </button>
        </div>
      </div>

      {/* About Application Card */}
      <div className="bg-gradient-to-br from-amber-50/40 to-stone-50 rounded-2xl p-5 border border-amber-200/70 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-800" />
          <h4 className="font-semibold text-stone-800 text-sm">
            Về ứng dụng Quản Lý Sinh Hoạt Cá Nhân
          </h4>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Ứng dụng được thiết kế chuyên biệt cho <strong>học sinh, sinh viên và người có nhu cầu sắp xếp cuộc sống khoa học</strong>. Với triết lý giao diện tối giản, sử dụng các gam màu nhạt (pastel) dịu mắt, ứng dụng giúp bạn tập trung cao độ vào những điều quan trọng: không bỏ lỡ lịch học, không quên hạn nộp bài tập, duy trì thói quen sinh hoạt lành mạnh và kiểm soát chi tiêu tài chính hiệu quả.
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showResetModal}
        title="Khôi phục dữ liệu mẫu học tập"
        itemName="Toàn bộ dữ liệu mẫu"
        message="Thao tác này sẽ đặt lại thời khóa biểu, việc cần làm, lịch sinh hoạt và chi tiêu về bộ dữ liệu học sinh/sinh viên mẫu. Bạn có muốn tiếp tục?"
        confirmText="Nạp dữ liệu mẫu"
        onConfirm={() => {
          onResetToSampleData();
          setShowResetModal(false);
          setStatusMessage({ text: 'Đã nạp lại bộ dữ liệu mẫu thành công!', type: 'success' });
          setTimeout(() => setStatusMessage(null), 3000);
        }}
        onCancel={() => setShowResetModal(false)}
      />

      {/* Clear Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showClearModal}
        title="Xóa toàn bộ dữ liệu ứng dụng"
        itemName="Toàn bộ lịch & công việc"
        message="CẢNH BÁO: Thao tác này sẽ xóa sạch tất cả thời khóa biểu, công việc, chi tiêu và sự kiện hiện có. Dữ liệu sẽ bị xóa hoàn toàn khỏi trình duyệt. Bạn có chắc chắn muốn xóa không?"
        confirmText="Xác nhận xóa sạch"
        onConfirm={() => {
          onClearAllData();
          setShowClearModal(false);
          setStatusMessage({ text: 'Đã xóa sạch toàn bộ dữ liệu!', type: 'success' });
          setTimeout(() => setStatusMessage(null), 3000);
        }}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
};

