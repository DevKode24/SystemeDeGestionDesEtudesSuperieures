import { Injectable } from '@angular/core';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  public toasts: Toast[] = [];
  private id = 0;

  private add(type: ToastType, message: string): void {
    const id = ++this.id;
    this.toasts.push({ id, type, message });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 4500);
  }

  success(message: string): void {
    this.add('success', message);
  }

  error(message: string): void {
    this.add('error', message);
  }

  info(message: string): void {
    this.add('info', message);
  }

  warning(message: string): void {
    this.add('warning', message);
  }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
