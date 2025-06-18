export interface Notification {
    id: number;
    training_id?: number; // Nullable
    title: string;
    message: string;
    sent_at: string;
    is_read: boolean;
}