import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { SoundSettings, ChimeSoundType } from '../types';
import { playSoftChime, unlockAudio } from '../utils/audio';
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

  const handlePlayTest = async (type?: ChimeSoundType) => {
    setIsPlaying(true);
    await unlockAudio();
    const selectedType = type || soundSettings.soundType;
    await playSoftChime(selectedType, soundSettings.volume);
    setIsPlaying(false);

    setTestSuccessMessage('Đã phát âm thanh thành công! Âm lượng rõ ràng.');
    setTimeout(() => setTestSuccessMessage(null), 3000);
  };

  const handleEnableBackgroundAlerts = async () => {
    await unlockAudio();
    const result = await requestNotificationPermission();
    setPermissionStatus(result);

    if (result === 'granted') {
      sendSystemAlert(
        'Đã kích hoạt thông báo trên ứng dụng khác',
        'Ứng dụng sẽ tự động phát chuông và hiện thông báo trước 10 phút ngay cả khi bạn đang dùng ứng dụng khác!'
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
          <button
            id="btn-play-test-chime"
            type="button"
            onClick={() => handlePlayTest()}
            disabled={isPlaying}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xs ${
              isPlaying
                ? 'bg-amber-800 text-white animate-pulse'
                : 'bg-amber-700 hover:bg-amber-800 text-white'
            }`}
            title="Bấm để phát thử âm thanh chuông"
          >
            <Play className={`w-5 h-5 ml-0.5 ${isPlaying ? 'scale-110' : ''}`} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-800 text-sm">Trình phát âm thanh & Nhắc nhở nền</span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300">
                Báo trước 10 phút
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
          {/* Background Run & System Notifications Button */}
          {permissionStatus === 'granted' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đang chạy trên ứng dụng khác</span>
            </div>
          ) : (
            <button
              id="btn-request-bg-permission"
              type="button"
              onClick={handleEnableBackgroundAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Cho phép chạy trên ứng dụng khác</span>
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
            title="Mở rộng cài đặt âm thanh"
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
          <span className="text-[11px] text-amber-700">Âm sắc to & rõ</span>
        </div>
      )}

      {/* Expanded Controls Panel */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 bg-white">
          {/* Multi-app explanation note */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-stone-800">
              <Smartphone className="w-4 h-4 text-amber-700" />
              <span>Cơ chế chạy và thông báo khi đang dùng ứng dụng khác:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-stone-600">
              <li>
                <strong>Web Worker chạy ngầm:</strong> Bộ đếm thời gian được xử lý ở luồng riêng, không bị hệ điều hành hay trình duyệt làm chậm lại khi thu nhỏ tab.
              </li>
              <li>
                <strong>Thông báo hệ thống nổi (System Alert):</strong> Khi mở ứng dụng khác (Word, YouTube, game...), cửa sổ nhắc nhở kèm chuông vẫn hiện nổi trên màn hình đúng 10 phút trước giờ.
              </li>
              <li>
                <strong>Rung thiết bị:</strong> Hỗ trợ rung 2 nhịp trên điện thoại để bạn không bao giờ bỏ lỡ sự kiện quan trọng.
              </li>
            </ul>
          </div>

          {/* Sound Choices */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-2">
              Chọn âm sắc chuông phát ra loa:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {chimeList.map((chime) => {
                const active = soundSettings.soundType === chime.id;
                return (
                  <div
                    key={chime.id}
                    onClick={() => {
                      onUpdateSoundSettings({ ...soundSettings, soundType: chime.id });
                      handlePlayTest(chime.id);
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
                        handlePlayTest(chime.id);
                      }}
                      className="px-2.5 py-1 bg-white border border-stone-200 hover:bg-amber-100 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 shadow-2xs"
                    >
                      <Play className="w-3 h-3 text-amber-800" />
                      <span>Thử</span>
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
                onClick={() => handlePlayTest()}
                className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-medium shrink-0 transition-colors shadow-2xs"
              >
                Nghe tiếng
              </button>
            </div>
          </div>

          {/* Scope selection */}
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-stone-600 font-medium">
              Tự động báo chuông 10 phút trước cho:
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
