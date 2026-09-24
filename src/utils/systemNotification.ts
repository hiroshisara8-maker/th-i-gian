/**
 * System Notification & Background Alert Helper
 * Allows notifications to pop up directly on the computer / phone desktop
 * even when the user is actively working on another application.
 */

let originalDocTitle = typeof document !== 'undefined' ? document.title : 'Quản Lý Sinh Hoạt Cá Nhân';
let flashInterval: number | null = null;

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Triggers a desktop / mobile system notification that appears above all other applications
 */
export function sendSystemAlert(title: string, message: string, tag?: string): void {
  // 1. Flash document title if window is in background
  startTitleFlash(title);

  // 2. Dispatch native OS system notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: tag || `shcn-alert-${Date.now()}`,
        requireInteraction: true, // Remains on screen on Windows/Mac until user dismisses or clicks
        silent: false, // Allows OS notification sound
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        stopTitleFlash();
      };
    } catch (e) {
      console.warn('Failed to display system notification:', e);
    }
  }
}

/**
 * Starts flashing the document title so if the user has multiple windows or another app,
 * the tab bar draws their attention
 */
export function startTitleFlash(alertText: string): void {
  if (typeof document === 'undefined') return;
  if (!originalDocTitle) {
    originalDocTitle = document.title || 'Quản Lý Sinh Hoạt Cá Nhân';
  }

  stopTitleFlash();

  let state = false;
  flashInterval = window.setInterval(() => {
    document.title = state ? `🔔 [NHẮC NHỞ 10 PHÚT] ${alertText}` : originalDocTitle;
    state = !state;
  }, 1000);

  // Auto-stop flashing when user focuses back on window
  const onFocus = () => {
    stopTitleFlash();
    window.removeEventListener('focus', onFocus);
  };
  window.addEventListener('focus', onFocus);
}

export function stopTitleFlash(): void {
  if (flashInterval !== null) {
    clearInterval(flashInterval);
    flashInterval = null;
  }
  if (typeof document !== 'undefined' && originalDocTitle) {
    document.title = originalDocTitle;
  }
}
