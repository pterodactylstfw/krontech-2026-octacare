import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <button class="bell-btn" (click)="toggleDropdown($event)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        @if (unreadCount() > 0) {
          <span class="badge">{{ unreadCount() }}</span>
        }
      </button>

      @if (isOpen()) {
        <div class="dropdown-panel" (click)="$event.stopPropagation()">
          <div class="dropdown-header">
            <span>Notifications</span>
            <button class="mark-all-btn" (click)="markAllAsRead()">Mark all as read</button>
          </div>
          
          <div class="notifications-list">
            @for (notif of notifications(); track notif.id) {
              <div class="notification-item" [class.unread]="!notif.read" (click)="markAsRead(notif.id)">
                <div class="icon-wrap" [ngClass]="notif.type">
                   <!-- Simplified icons based on type -->
                   @if (notif.type === 'success') { <span>✅</span> }
                   @else if (notif.type === 'critical') { <span>🚨</span> }
                   @else if (notif.type === 'warning') { <span>⚠️</span> }
                   @else { <span>ℹ️</span> }
                </div>
                <div class="notif-body">
                  <div class="notif-title">{{ notif.title }}</div>
                  <div class="notif-msg">{{ notif.message }}</div>
                  <div class="notif-time">{{ notif.timestamp | date:'shortTime' }}</div>
                </div>
              </div>
            } @empty {
              <div class="empty-state">No notifications</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container { position: relative; }
    .bell-btn { 
      background: var(--surface-primary, #ffffff);
      border: 1px solid var(--border-soft, #d2d2d7);
      color: var(--text-primary, #1d1d1f); 
      cursor: pointer; 
      padding: 10px; 
      position: relative; 
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      transition: background var(--transition-fast, 0.2s), box-shadow var(--transition-fast, 0.2s);
      box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    }
    .bell-btn:hover { 
      background: var(--bg-primary, #f5f5f7); 
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    
    .badge {
      position: absolute; top: -2px; right: -2px;
      background: #ff3b30; color: white; font-size: 11px;
      min-width: 18px; height: 18px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; border: 2px solid var(--surface-primary, #ffffff);
      box-shadow: 0 2px 4px rgba(255, 59, 48, 0.3);
    }

    .dropdown-panel {
      position: absolute; bottom: 0; left: 52px; /* Open upwards and to the right */
      width: 340px; 
      background: var(--surface-primary, #ffffff); 
      border-radius: var(--radius-md, 12px);
      box-shadow: 10px 10px 30px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.04);
      border: 1px solid var(--border-soft, #d2d2d7);
      z-index: 1000; overflow: hidden;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      animation: dropFadeRight 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    @keyframes dropFadeRight {
      from { opacity: 0; transform: translateX(-10px) translateY(10px) scale(0.98); }
      to { opacity: 1; transform: translateX(0) translateY(0) scale(1); }
    }

    .dropdown-header {
      padding: 14px 16px; 
      border-bottom: 1px solid var(--border-soft, #d2d2d7);
      display: flex; justify-content: space-between; align-items: center;
      font-weight: 600; font-size: 14px;
      color: var(--text-primary, #1d1d1f);
      background: transparent;
    }

    .mark-all-btn {
      background: none; border: none; color: var(--accent, #0071e3);
      font-size: 12px; cursor: pointer; font-weight: 500;
      transition: color 0.15s ease;
    }
    .mark-all-btn:hover { color: var(--accent-hover, #0077ed); }

    .notifications-list { max-height: 400px; overflow-y: auto; }
    .notifications-list::-webkit-scrollbar { width: 4px; }
    .notifications-list::-webkit-scrollbar-thumb { background: var(--border-soft); border-radius: 4px; }

    .notification-item {
      padding: 12px 16px; display: flex; gap: 12px;
      cursor: pointer; border-bottom: 1px solid var(--border-soft, #f8fafc);
      transition: background 0.2s;
    }
    .notification-item:last-child { border-bottom: none; }
    .notification-item:hover { background: var(--bg-primary, #f5f5f7); }
    .notification-item.unread { background: rgba(0, 113, 227, 0.04); }

    .icon-wrap { 
      width: 36px; height: 36px; border-radius: 50%; 
      display: flex; align-items: center; justify-content: center; 
      font-size: 16px; flex-shrink: 0;
    }
    .icon-wrap.success { background: rgba(52, 199, 89, 0.15); }
    .icon-wrap.critical { background: rgba(255, 59, 48, 0.15); }
    .icon-wrap.warning { background: rgba(255, 204, 0, 0.2); }
    .icon-wrap.info { background: rgba(0, 113, 227, 0.15); }

    .notif-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
    .notif-title { font-weight: 600; font-size: 13px; color: var(--text-primary, #1d1d1f); margin-bottom: 3px; }
    .notif-msg { font-size: 13px; color: var(--text-secondary, #6e6e73); line-height: 1.4; }
    .notif-time { font-size: 11px; color: #86868b; margin-top: 5px; font-weight: 500; }

    .empty-state { padding: 40px 20px; text-align: center; color: var(--text-secondary, #6e6e73); font-size: 14px; }
  `],
  host: {
    '(document:click)': 'closeDropdown()'
  }
})
export class NotificationCenterComponent {
  private notificationService = inject(NotificationService);
  
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  isOpen = signal(false);

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  markAsRead(id: string) {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }
}
