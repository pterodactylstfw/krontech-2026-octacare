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

const DEFAULT_PATIENT_THREAD_ID = 1;

const DEFAULT_CONTACTS: ChatContact[] = [
  {
    id: 1,
    name: 'Gheorghe Mihai',
    initials: 'GM',
    lastMessage: 'Thank you, doctor!',
    lastTime: '10:15',
    unread: 0,
    messages: [
      {
        id: 1,
        text: 'Good morning! I wanted to ask about the pre-op labs for tomorrow.',
        sender: 'patient',
        time: '09:12',
        read: true,
      },
      {
        id: 2,
        text: 'Good morning. Yes, please make sure to fast from midnight and arrive at 07:30.',
        sender: 'doctor',
        time: '09:45',
        read: true,
      },
      { id: 3, text: 'Thank you, doctor!', sender: 'patient', time: '10:15', read: true },
    ],
  },
  {
    id: 2,
    name: 'Nicolae Radu',
    initials: 'NR',
    lastMessage: 'Should I bring the blood work?',
    lastTime: '09:30',
    unread: 2,
    messages: [
      {
        id: 1,
        text: 'Doctor, should I bring the previous blood work results?',
        sender: 'patient',
        time: '09:28',
        read: true,
      },
      { id: 2, text: 'Should I bring the blood work?', sender: 'patient', time: '09:30', read: false },
    ],
  },
  {
    id: 3,
    name: 'Stan Diana',
    initials: 'SD',
    lastMessage: 'I understand, see you then.',
    lastTime: 'Yesterday',
    unread: 0,
    messages: [
      { id: 1, text: 'When is my next check-up scheduled?', sender: 'patient', time: '14:00', read: true },
      {
        id: 2,
        text: 'Your next visit is on Monday at 10:00.',
        sender: 'doctor',
        time: '14:10',
        read: true,
      },
      { id: 3, text: 'I understand, see you then.', sender: 'patient', time: '14:12', read: true },
    ],
  },
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
        if (Array.isArray(parsed)) {
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
      // Ignore storage write errors (private mode or quota).
    }
  }

  openContact(contact: ChatContact): void {
    this.contactsSignal.update(list =>
      list.map(c => (c.id === contact.id ? { ...c, unread: 0 } : c))
    );
    this.persistContacts();
    const updated = this.contactsSignal().find(c => c.id === contact.id) ?? contact;
    this.selectedContactSignal.set(updated);
  }

  openContactById(id: number): void {
    const contact = this.contactsSignal().find(c => c.id === id);
    if (contact) this.openContact(contact);
  }

  openPatientThread(): void {
    const contact =
      this.contactsSignal().find(c => c.id === DEFAULT_PATIENT_THREAD_ID) ??
      this.contactsSignal()[0];
    if (contact) this.openContact(contact);
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
