import { Injectable, inject, signal } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  timestamp: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private authService = inject(AuthService);
  private stompClient: Client | null = null;
  
  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  private connect() {
    const socket = new SockJS(`${environment.apiUrl}/ws-notifications`);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket');
      
      // Subscribe to global notifications
      this.stompClient?.subscribe('/topic/global', (message: Message) => {
        this.addNotification(JSON.parse(message.body));
      });

      // Subscribe to user notifications (for private alerts)
      // /user/queue/notifications is the standard for @SendToUser
      this.stompClient?.subscribe('/user/queue/notifications', (message: Message) => {
        this.addNotification(JSON.parse(message.body));
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP Error', frame);
    };

    this.stompClient.activate();
  }

  private disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  private addNotification(notif: any) {
    const newNotif: Notification = {
      ...notif,
      read: false
    };
    this.notifications.update(prev => [newNotif, ...prev]);
    this.unreadCount.update(count => count + 1);
    
    // Auto-dismiss after 10s if needed, or handle via UI component
  }

  markAllAsRead() {
    this.notifications.update(prev => prev.map(n => ({ ...n, read: true })));
    this.unreadCount.set(0);
  }

  markAsRead(id: string) {
    this.notifications.update(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    const count = this.notifications().filter(n => !n.read).length;
    this.unreadCount.set(count);
  }
}
