import { Injectable, signal } from '@angular/core';

export type ChatSender = 'doctor' | 'patient';

export interface ChatMessage {
  id: number;
  text: string;
  sender: ChatSender;
  time: string;
  read: boolean;
}

export interface ChatContact {
  id: number;
  name: string;
  initials: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
}

const DEFAULT_CONTACTS: ChatContact[] = [
  {
    id: 1,
    name: 'Gheorghe Mihai',
    initials: 'GM',
    lastMessage: 'Good morning!',
    lastTime: '09:12',
    unread: 0,
    messages: [
      {
        id: 1,
        text: 'Good morning! I wanted to ask about the pre-op labs for tomorrow.',
        sender: 'patient',
        time: '09:12',
        read: true,
      },
    ],
  }
];

const STORAGE_KEY = 'chat_state_v1';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly contactsSignal = signal<ChatContact[]>(DEFAULT_CONTACTS);
  private readonly selectedContactSignal = signal<ChatContact | null>(null);

  readonly contacts = this.contactsSignal.asReadonly();
  readonly selectedContact = this.selectedContactSignal.asReadonly();

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.contactsSignal.set(parsed as ChatContact[]);
        }
      } catch {
        // Ignore invalid storage content.
      }
    }
  }

  private persistContacts(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.contactsSignal()));
    } catch {
      // Ignore storage write errors.
    }
  }

  openConversation(patientId: number, patientName: string, patientInitials: string): void {
    let threads = this.contactsSignal();
    let thread = threads.find(t => t.id === patientId);

    if (!thread) {
      thread = {
        id: patientId,
        name: patientName,
        initials: patientInitials,
        lastMessage: '',
        lastTime: '',
        unread: 0,
        messages: [],
      };
      this.contactsSignal.set([...threads, thread]);
    }

    // Clear unread for opened thread
    this.contactsSignal.update(list =>
      list.map(c => (c.id === patientId ? { ...c, unread: 0 } : c))
    );
    this.persistContacts();

    const updated = this.contactsSignal().find(c => c.id === patientId) ?? thread;
    this.selectedContactSignal.set(updated);
  }

  closeThread(): void {
    this.selectedContactSignal.set(null);
  }

  sendMessage(mode: ChatSender, text: string): void {
    const contact = this.selectedContactSignal();
    const trimmed = text.trim();
    if (!contact || !trimmed) return;

    const newMsg: ChatMessage = {
      id: Date.now(),
      text: trimmed,
      sender: mode,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    this.contactsSignal.update(list =>
      list.map(c =>
        c.id === contact.id
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: trimmed,
              lastTime: newMsg.time,
            }
          : c
      )
    );
    this.persistContacts();

    const updated = this.contactsSignal().find(c => c.id === contact.id) ?? contact;
    this.selectedContactSignal.set({
      ...updated,
      messages: [...updated.messages, newMsg],
      lastMessage: trimmed,
      lastTime: newMsg.time,
    });
  }
}
