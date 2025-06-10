export interface Student {
    id: number;
    last_name: string;
    first_name?: string;
    email?: string;
    phone?: string;
    cin?: string;
    birth_date?: string;
    gender?: "1" | "2";
    profile_picture: string;
    residence_certificate: string;
    password?: string;
    previous_license?: string;
    payment_receipt: string;
    training_id?: number;
    status: "pending" | "validated" | "rejected";
}