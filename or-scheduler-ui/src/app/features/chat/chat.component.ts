import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatContact, ChatService } from './chat.service';


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

    private chatService = inject(ChatService);

    selectedContact = this.chatService.selectedContact;
    contacts = this.chatService.contacts;
    newMessage = '';

    openContact(contact: ChatContact): void {
        this.chatService.openContact(contact);
    }

    back(): void {
        this.chatService.closeThread();
    }

    send(): void {
        const text = this.newMessage.trim();
        if (!text) return;

        this.chatService.sendMessage(this.mode, text);
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
            this.chatService.openPatientThread();
        }

        if (changes['isOpen']?.currentValue === false) {
            this.chatService.closeThread();
        }
    }

    close(): void {
        this.chatService.closeThread();
        this.closed.emit();
    }
}
