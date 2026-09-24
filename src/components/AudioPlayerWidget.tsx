import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Bell, 
  CheckCircle2, 
  Sliders, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Smartphone,
  Square,
  Clock,
  RotateCcw,
  Timer
} from 'lucide-react';
import { SoundSettings, ChimeSoundType } from '../types';
import { playSoftChime, unlockAudio, startRinging, stopRinging, isCurrentlyRinging } from '../utils/audio';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus,
  sendSystemAlert 
} from '../utils/systemNotification';

interface AudioPlayerWidgetProps {
  soundSettings: SoundSettings;
  onUpdateSoundSettings: (settings: SoundSettings) => void;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({
  soundSettings,
  onUpdateSoundSettings,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTestRinging, setIsTestRinging] = useState(false);
  const [testRemainingSec, setTestRemainingSec] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [isExpanded, setIsExpanded] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setPermissionStatus(getNotificationPermissionStatus());
  }, []);

  const chimeList: { id: ChimeSoundType; name: string; desc: string }[] = [
    { id: 'bell', name: 'Chuông ngân trong trẻo', desc: 'Âm sắc vang rõ, dễ nghe từ xa' },
    { id: 'school', name: 'Chuông trường học', desc: '4 nốt vào tiết trang nghiêm, thân thuộc' },
    { id: 'gentle', name: 'Giai điệu êm dịu', desc: 'Hợp âm du dương, không giật mình' },
    { id: 'marimba', name: 'Mộc cầm ấm áp', desc: 'Gõ phím gỗ vui tươi, rõ ràng' },
  ];

  const ringDurationOptions = [
    { value: 5, label: '5 giây' },
    { value: 10, label: '10 giây' },
    { value: 15, label: '15 giây (Chuẩn)' },
    { value: 30, label: '30 giây' },
    { value: 60, label: '1 phút' },
    { value: 0, label: 'Reo liên tục' },
  ];

  const leadTimeOptions = [
    { value: 0, label: 'Đúng giờ' },
    { value: 5, label: 'Trước 5 phút' },
    { value: 10, label: 'Trước 10 phút (Chuẩn)' },
    { value: 15, label: 'Trước 15 phút' },
    { value: 30, label: 'Trước 30 phút' },
  ];

  const handlePlayQuickTest = async (type?: ChimeSoundType) => {
    if (isTestRinging) {
      stopRinging();
      setIsTestRinging(false);
    }
    setIsPlaying(true);
    await unlockAudio();
    const selectedType = type || soundSettings.soundType;
    await playSoftChime(selectedType, soundSettings.volume);
    setIsPlaying(false);

    setTestSuccessMessage('Đã phát thử 1 nốt chuông thành công!');
    setTimeout(() => setTestSuccessMessage(null), 3000);
  };

  const handleStartTestRinging = async () => {
    if (isTestRinging) {
      stopRinging();
      setIsTestRinging(false);
      setTestSuccessMessage('Đã dừng phát chuông thử nghiệm.');
      setTimeout(() => setTestSuccessMessage(null), 2500);
      return;
    }

    setIsTestRinging(true);
    const duration = soundSettings.ringDuration !== undefined ? soundSettings.ringDuration : 15;
    setTestRemainingSec(duration);

    await unlockAudio();
    startRinging(
      soundSettings.soundType,
      soundSettings.volume,
      duration,
      () => {
        setIsTestRinging(false);
        setTestSuccessMessage(`Đã hoàn tất thời gian reo chuông (${duration > 0 ? `${duration}s` : 'liên tục'})!`);
        setTimeout(() => setTestSuccessMessage(null), 3000);
      },
      (remaining) => {
        setTestRemainingSec(remaining);
      }
    );
  };

  const handleEnableBackgroundAlerts = async () => {
    await unlockAudio();
    const result = await requestNotificationPermission();
    setPermissionStatus(result);

    if (result === 'granted') {
      sendSystemAlert(
        'Đã kích hoạt thông báo trên ứng dụng khác',
        `Ứng dụng sẽ tự động phát chuông ${soundSettings.ringDuration || 15}s và hiện thông báo trước ${soundSettings.defaultMinutesBefore || 10} phút ngay cả khi dùng app khác!`
      );
      playSoftChime(soundSettings.soundType, soundSettings.volume);
      setTestSuccessMessage('Đã cấp quyền chạy trên ứng dụng khác thành công!');
      setTimeout(() => setTestSuccessMessage(null), 3500);
    }
  };

  return (
    <div id="audio-player-controller" className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Main Bar */}
      <div className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-stone-50/90 via-amber-50/40 to-stone-50/90 border-b border-stone-200/60">
        <div className="flex items-center gap-3">
          {/* Main Play Test Button */}
          {isTestRinging ? (
            <button
              id="btn-stop-test-chime"
              type="button"
              onClick={handleStartTestRinging}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xs bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
              title="Bấm để dừng chuông đang reo"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              id="btn-play-test-chime"
              type="button"
              onClick={handleStartTestRinging}
              disabled={isPlaying}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xs ${
                isPlaying
                  ? 'bg-amber-800 text-white animate-pulse'
                  : 'bg-amber-700 hover:bg-amber-800 text-white'
              }`}
              title={`Phát thử reo chuông ${soundSettings.ringDuration > 0 ? `${soundSettings.ringDuration} giây` : 'liên tục'}`}
            >
              <Play className={`w-5 h-5 ml-0.5 ${isPlaying ? 'scale-110' : ''}`} />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-stone-800 text-sm">Trình phát âm thanh & Nhắc nhở nền</span>
              <span className="inline-block text-[11px] font-semibold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300">
                Reo: {soundSettings.ringDuration > 0 ? `${soundSettings.ringDuration}s` : 'Liên tục'}
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-300">
                Báo trước: {soundSettings.defaultMinutesBefore ?? 10}p
              </span>
            </div>
            <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
              <span>Chuông: <strong>{chimeList.find(c => c.id === soundSettings.soundType)?.name}</strong></span>
              <span>•</span>
              <span>Âm lượng: <strong>{Math.round(soundSettings.volume * 100)}%</strong></span>
              <span>•</span>
              <span className={soundSettings.enabled ? 'text-emerald-700 font-medium' : 'text-stone-500'}>
                {soundSettings.enabled ? 'Đang bật' : 'Đang tắt'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Test Ringing Status if active */}
          {isTestRinging && (
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 animate-pulse flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" />
              <span>Đang reo ({testRemainingSec}s)</span>
            </span>
          )}

          {/* Background Run & System Notifications Button */}
          {permissionStatus === 'granted' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Đang chạy trên ứng dụng khác</span>
              <span className="sm:hidden">Chạy nền</span>
            </div>
          ) : (
            <button
              id="btn-request-bg-permission"
              type="button"
              onClick={handleEnableBackgroundAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Bật chạy nền</span>
            </button>
          )}

          {/* Quick Sound Toggle */}
          <button
            id="btn-toggle-sound-mute"
            type="button"
            onClick={() => onUpdateSoundSettings({ ...soundSettings, enabled: !soundSettings.enabled })}
            className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
              soundSettings.enabled 
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' 
                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
            }`}
            title={soundSettings.enabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundSettings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Expand Details */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-800 hover:bg-stone-100 border border-stone-200 transition-colors"
            title="Mở rộng cài đặt thời gian chuông reo & âm thanh"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Test feedback banner */}
      {testSuccessMessage && (
        <div className="bg-amber-50 text-amber-900 px-4 py-2 text-xs font-medium border-b border-amber-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{testSuccessMessage}</span>
          </span>
          <span className="text-[11px] text-amber-700">Đã cập nhật</span>
        </div>
      )}

      {/* Expanded Controls Panel */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5 bg-white">
          {/* Multi-app explanation note */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-stone-800">
              <Smartphone className="w-4 h-4 text-amber-700" />
              <span>Cơ chế chạy và reo chuông khi đang dùng ứng dụng khác:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-stone-600">
              <li>
                <strong>Web Worker chạy ngầm:</strong> Luồng riêng xử lý thời gian chính xác từng giây, chuông sẽ reo đúng lịch đã định.
              </li>
              <li>
                <strong>Thời lượng chuông reo:</strong> Tùy chỉnh chuông reo trong 5s, 10s, 15s, 30s hoặc reo liên tục cho tới khi bạn bấm <em>Dừng chuông</em>.
              </li>
              <li>
                <strong>Thông báo hệ thống nổi:</strong> Hiện popup kèm chuông nổi lên trên các ứng dụng khác (Word, YouTube, Game...).
              </li>
            </ul>
          </div>

          {/* Thời lượng chuông reo (Ring Duration) Selector */}
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-800" />
                <label className="text-xs font-bold text-stone-800">
                  Thời lượng chuông reo (Ring Duration):
                </label>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                {soundSettings.ringDuration > 0 ? `${soundSettings.ringDuration} giây` : 'Reo liên tục'}
              </span>
            </div>
            <p className="text-[11px] text-stone-600">
              Chuông sẽ phát vang liên tục trong khoảng thời gian này khi đến giờ nhắc nhở.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
              {ringDurationOptions.map((opt) => {
                const isSelected = soundSettings.ringDuration === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateSoundSettings({ ...soundSettings, ringDuration: opt.value })}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-center border transition-all ${
                      isSelected
                        ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thời gian chuông reo báo trước (Lead Time) Selector */}
          <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-700" />
                <label className="text-xs font-bold text-stone-800">
                  Thời gian chuông reo báo trước mặc định (Lead Time):
                </label>
              </div>
              <span className="text-xs font-bold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-300">
                {soundSettings.defaultMinutesBefore === 0 ? 'Đúng giờ' : `Trước ${soundSettings.defaultMinutesBefore} phút`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {leadTimeOptions.map((opt) => {
                const isSelected = (soundSettings.defaultMinutesBefore ?? 10) === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateSoundSettings({ ...soundSettings, defaultMinutesBefore: opt.value })}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-center border transition-all ${
                      isSelected
                        ? 'bg-stone-800 text-white border-stone-800 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Choices */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-stone-800">
                Chọn âm sắc chuông phát ra loa:
              </label>
              <div className="flex items-center gap-2">
                {isTestRinging ? (
                  <button
                    type="button"
                    onClick={handleStartTestRinging}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Dừng reo ({testRemainingSec}s)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartTestRinging}
                    className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Thử reo chuông ({soundSettings.ringDuration || 15}s)</span>
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {chimeList.map((chime) => {
                const active = soundSettings.soundType === chime.id;
                return (
                  <div
                    key={chime.id}
                    onClick={() => {
                      onUpdateSoundSettings({ ...soundSettings, soundType: chime.id });
                      handlePlayQuickTest(chime.id);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-amber-50/90 border-amber-400 shadow-2xs'
                        : 'bg-stone-50/40 border-stone-200 hover:border-amber-200'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-stone-900">{chime.name}</p>
                      <p className="text-[11px] text-stone-600">{chime.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayQuickTest(chime.id);
                      }}
                      className="px-2.5 py-1 bg-white border border-stone-200 hover:bg-amber-100 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 shadow-2xs"
                    >
                      <Play className="w-3 h-3 text-amber-800" />
                      <span>Thử 1 nốt</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-stone-700" />
              <span className="text-xs font-semibold text-stone-800">Âm lượng chuông:</span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                {Math.round(soundSettings.volume * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-sm">
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
                onClick={() => handlePlayQuickTest()}
                className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-medium shrink-0 transition-colors shadow-2xs"
              >
                Nghe tiếng
              </button>
            </div>
          </div>

          {/* Scope selection */}
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-stone-600 font-medium">
              Tự động báo chuông cho các mục:
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={soundSettings.notifyTimetable}
                  onChange={(e) => onUpdateSoundSettings({ ...soundSettings, notifyTimetable: e.target.checked })}
                  className="rounded text-amber-700 accent-amber-700"
                />
                <span>Thời khóa biểu</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
                <input
                  type="checkbox"
                  checked={soundSettings.notifyTasks}
                  onChange={(e) => onUpdateSoundSettings({ ...soundSettings, notifyTasks: e.target.checked })}
                  className="rounded text-amber-700 accent-amber-700"
                />
                <span>Công việc</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
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
      )}
    </div>
  );
};
