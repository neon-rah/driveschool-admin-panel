export interface Result {
    id: number;
    exam_id: number;
    student_id: number;
    score: number | null;
    passed?: boolean; // Calculé localement
    created_at?: string;
    updated_at?: string;
    student?: {
        id: number;
        first_name: string;
        last_name: string;
    };
}