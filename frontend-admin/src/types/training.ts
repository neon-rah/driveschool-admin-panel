export interface Training {
    id: number;
    title: string;
    description: string;
    start_date: string;
    duration_weeks: number;
    price: number;
    category_id: number;
    category: { id: number; name: string };
    schedule?: any;
    registration_end_date: string;
    created_at?: string;
    updated_at?: string;
    covering?:string;
}