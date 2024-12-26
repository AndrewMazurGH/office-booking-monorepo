export class UserResponse {
    id: string;  // Changed from userId to id for consistency
    email: string;
    createdAt?: Date;
    role?: string;

    constructor(partial: Partial<UserResponse>) {
        Object.assign(this, partial);
    }

    static fromDocument(doc: any): UserResponse {
        return new UserResponse({
            id: doc.id || doc._id.toString(), // Handle both id and _id
            email: doc.email,
            createdAt: doc.createdAt,
            role: doc.role || 'user'
        });
    }
}