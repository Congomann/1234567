
import { Backend } from './apiBackend';

export interface ChatChannel {
    id: string;
    name: string;
    type: 'direct' | 'group' | 'advisor_channel' | 'case_chat';
    case_id?: string;
    product_type?: string;
    members?: string[];
    last_message?: string;
}

export interface ChatMessage {
    id: string;
    channel_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: string;
    sender_avatar?: string;
    content: string;
    is_predefined: boolean;
    metadata: any;
    is_pinned: boolean;
    created_at: string;
}

export interface CaseNote {
    id: string;
    client_id: string;
    author_id: string;
    author_name: string;
    author_role: string;
    note_type: 'medical' | 'general' | 'underwriting' | 'decline_reason';
    structured_data: any;
    content: string;
    created_at: string;
}

export const chatService = {
    async getChannels(): Promise<ChatChannel[]> {
        return Backend.get('/chat/channels');
    },

    async getMessages(channelId: string): Promise<ChatMessage[]> {
        return Backend.get(`/chat/messages/${channelId}`);
    },

    async sendMessage(channelId: string, content: string, metadata?: any): Promise<ChatMessage> {
        return Backend.post('/chat/messages', { channelId, content, metadata });
    },

    async getOrCreateCaseChat(caseId: string): Promise<ChatChannel> {
        return Backend.get(`/chat/case/${caseId}`);
    },

    async getCaseNotes(clientId: string): Promise<CaseNote[]> {
        return Backend.get(`/case-notes/${clientId}`);
    },

    async addCaseNote(clientId: string, noteType: string, content: string, structuredData?: any): Promise<CaseNote> {
        return Backend.post('/case-notes', { clientId, noteType, content, structuredData });
    }
};
