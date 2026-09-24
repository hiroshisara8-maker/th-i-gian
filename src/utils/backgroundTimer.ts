/**
 * Background Timer Utility using Web Worker
 * Web Workers run on a background thread and are NOT throttled by modern browsers
 * when the user switches to other applications or minimizes the window.
 */

export type TimerCallback = () => void;

export class BackgroundTimer {
  private worker: Worker | null = null;
  private fallbackInterval: number | null = null;
  private callback: TimerCallback;
  private intervalMs: number;
  private isRunning: boolean = false;

  constructor(callback: TimerCallback, intervalMs: number = 20000) {
    this.callback = callback;
    this.intervalMs = intervalMs;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Try creating an inline Web Worker via Blob URL
    try {
      if (typeof window !== 'undefined' && window.Worker && window.Blob && window.URL) {
        const workerCode = `
          let timerId = null;
          self.onmessage = function(e) {
            if (e.data.action === 'start') {
              if (timerId) clearInterval(timerId);
              timerId = setInterval(function() {
                self.postMessage('tick');
              }, e.data.interval || 20000);
            } else if (e.data.action === 'stop') {
              if (timerId) {
                clearInterval(timerId);
                timerId = null;
              }
            }
          };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        this.worker = new Worker(workerUrl);

        this.worker.onmessage = (event) => {
          if (event.data === 'tick' && this.isRunning) {
            this.callback();
          }
        };

        this.worker.postMessage({ action: 'start', interval: this.intervalMs });
        return;
      }
    } catch (e) {
      console.warn('Web Worker background timer initialization failed, falling back to window.setInterval:', e);
    }

    // Fallback if Worker fails or not available
    this.fallbackInterval = window.setInterval(() => {
      if (this.isRunning) {
        this.callback();
      }
    }, this.intervalMs);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.worker) {
      try {
        this.worker.postMessage({ action: 'stop' });
        this.worker.terminate();
      } catch {
        // ignore
      }
      this.worker = null;
    }
    if (this.fallbackInterval !== null) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }

  public updateInterval(newIntervalMs: number): void {
    this.intervalMs = newIntervalMs;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}
