export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

class ToastManager {
  private container: HTMLElement | null = null;
  private toastCounter = 0;

  private createContainer() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  show(options: ToastOptions) {
    this.createContainer();
    
    const {
      message,
      type = 'info',
      duration = 3000,
      position = 'top-right'
    } = options;

    const toastId = ++this.toastCounter;
    const toast = document.createElement('div');
    toast.id = `toast-${toastId}`;
    
    // Styling based on type
    const typeStyles = {
      success: 'background: #10b981; color: white;',
      error: 'background: #ef4444; color: white;',
      warning: 'background: #f59e0b; color: white;',
      info: 'background: #3b82f6; color: white;'
    };

    // Position styles
    const positionStyles = {
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;'
    };

    toast.style.cssText = `
      ${typeStyles[type]}
      ${positionStyles[position]}
      position: fixed;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 320px;
      word-wrap: break-word;
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
      opacity: 0;
      pointer-events: auto;
      z-index: 9999;
      margin-bottom: 8px;
    `;

    // Add icon based on type
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">${icons[type]}</span>
        <span>${message}</span>
      </div>
    `;

    // Adjust container position if needed
    if (position.includes('left')) {
      this.container!.style.left = '20px';
      this.container!.style.right = 'auto';
    }
    if (position.includes('bottom')) {
      this.container!.style.top = 'auto';
      this.container!.style.bottom = '20px';
    }

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    }, 100);

    // Auto remove
    setTimeout(() => {
      this.remove(toastId);
    }, duration);

    return toastId;
  }

  private remove(toastId: number) {
    const toast = document.getElementById(`toast-${toastId}`);
    if (!toast) return;

    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  clear() {
    const toasts = document.querySelectorAll('[id^="toast-"]');
    toasts.forEach(toast => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
  }
}

// Create singleton instance
const toastManager = new ToastManager();

// Export convenient functions
export const toast = {
  success: (message: string, duration?: number) => 
    toastManager.show({ message, type: 'success', duration }),
  
  error: (message: string, duration?: number) => 
    toastManager.show({ message, type: 'error', duration }),
  
  warning: (message: string, duration?: number) => 
    toastManager.show({ message, type: 'warning', duration }),
  
  info: (message: string, duration?: number) => 
    toastManager.show({ message, type: 'info', duration }),
  
  show: (options: ToastOptions) => toastManager.show(options),
  
  clear: () => toastManager.clear()
};

export default toast;
