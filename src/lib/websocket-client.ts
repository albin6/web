const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/ws';

export type MessageType =
    | 'task_assigned'
    | 'task_updated'
    | 'task_status_changed'
    | 'deadline_requested'
    | 'deadline_approved'
    | 'deadline_rejected'
    | 'user_approved';

export interface WebSocketMessage {
    type: MessageType;
    payload: any;
}

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private messageHandlers: Set<MessageHandler> = new Set();
    private token: string | null = null;

    connect(token: string) {
        this.token = token;
        this.createConnection();
    }

    private createConnection() {
        if (!this.token) {
            console.error('No token provided for WebSocket connection');
            return;
        }

        try {
            this.ws = new WebSocket(`${WS_URL}?token=${this.token}`);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    this.messageHandlers.forEach((handler) => handler(message));
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.attemptReconnect();
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

            setTimeout(() => {
                this.createConnection();
            }, delay);
        } else {
            console.error('Max reconnect attempts reached');
        }
    }

    onMessage(handler: MessageHandler) {
        this.messageHandlers.add(handler);
        return () => {
            this.messageHandlers.delete(handler);
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.messageHandlers.clear();
        this.token = null;
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}

export const wsClient = new WebSocketClient();
export default wsClient;
