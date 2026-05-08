import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface ChatMessage {
    id: number;
    text: string;
    sender: 'doctor' | 'patient';
    time: string;
    read: boolean;
}

interface ChatContact {
    id: number;
    name: string;
    initials: string;
    lastMessage: string;
    lastTime: string;
    unread: number;
    messages: ChatMessage[];
}

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() mode: 'doctor' | 'patient' = 'doctor';
    @Output() closed = new EventEmitter<void>();

    selectedContact = signal<ChatContact | null>(null);
    newMessage = '';

    contacts = signal<ChatContact[]>([
        {
            id: 1, name: 'Gheorghe Mihai', initials: 'GM',
            lastMessage: 'Thank you, doctor!', lastTime: '10:15', unread: 0,
            messages: [
                { id: 1, text: 'Good morning! I wanted to ask about the pre-op labs for tomorrow.', sender: 'patient', time: '09:12', read: true },
                { id: 2, text: 'Good morning. Yes, please make sure to fast from midnight and arrive at 07:30.', sender: 'doctor', time: '09:45', read: true },
                { id: 3, text: 'Thank you, doctor!', sender: 'patient', time: '10:15', read: true },
            ]
        },
        {
            id: 2, name: 'Nicolae Radu', initials: 'NR',
            lastMessage: 'Should I bring the blood work?', lastTime: '09:30', unread: 2,
            messages: [
                { id: 1, text: 'Doctor, should I bring the previous blood work results?', sender: 'patient', time: '09:28', read: true },
                { id: 2, text: 'Should I bring the blood work?', sender: 'patient', time: '09:30', read: false },
            ]
        },
        {
            id: 3, name: 'Stan Diana', initials: 'SD',
            lastMessage: 'I understand, see you then.', lastTime: 'Yesterday', unread: 0,
            messages: [
                { id: 1, text: 'When is my next check-up scheduled?', sender: 'patient', time: '14:00', read: true },
                { id: 2, text: 'Your next visit is on Monday at 10:00.', sender: 'doctor', time: '14:10', read: true },
                { id: 3, text: 'I understand, see you then.', sender: 'patient', time: '14:12', read: true },
            ]
        },
    ]);

    openContact(contact: ChatContact): void {
        contact.unread = 0;
        this.selectedContact.set(contact);
    }

    back(): void {
        this.selectedContact.set(null);
    }

    send(): void {
        const text = this.newMessage.trim();
        const contact = this.selectedContact();
        if (!text || !contact) return;

        const newMsg: ChatMessage = {
            id: Date.now(),
            text,
            sender: this.mode,
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            read: false
        };

        this.contacts.update(list =>
            list.map(c => c.id === contact.id
                ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastTime: newMsg.time }
                : c
            )
        );

        this.selectedContact.set({
            ...contact,
            messages: [...contact.messages, newMsg],
            lastMessage: text,
            lastTime: newMsg.time
        });

        this.newMessage = '';
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.send();
        }
    }
    ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true && this.mode === 'patient') {
      this.selectedContact.set({
        id: 0,
        name: 'Dr. Ionescu Alexandru',
        initials: 'IA',
        lastMessage: '',
        lastTime: '',
        unread: 0,
        messages: [
          { id: 1, text: 'Good morning! I wanted to ask about the pre-op labs for tomorrow.', sender: 'patient', time: '09:12', read: true },
          { id: 2, text: 'Good morning. Yes, please make sure to fast from midnight and arrive at 07:30.', sender: 'doctor', time: '09:45', read: true },
          { id: 3, text: 'Should I bring the previous blood work results?', sender: 'patient', time: '10:02', read: true },
          { id: 4, text: 'Yes, bring everything from the last 6 months if possible.', sender: 'doctor', time: '10:15', read: false },
        ]
      });
    }

    if (changes['isOpen']?.currentValue === false && this.mode === 'patient') {
      this.selectedContact.set(null);
    }
  }

    close(): void {
        this.selectedContact.set(null);
        this.closed.emit();
    }
}