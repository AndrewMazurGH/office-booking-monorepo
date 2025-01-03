export class UserResponse {
    id: string;
    email: string;
    role?: string;
    nickname?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: Date;

    constructor(partial: Partial<UserResponse>) {
        Object.assign(this, partial);
    }

    static fromDocument(doc: any): UserResponse {
        return new UserResponse({
            id: doc.id || doc._id.toString(),
            email: doc.email,
            role: doc.role || 'user',
            nickname: doc.nickname,
            phone: doc.phone,
            firstName: doc.firstName,
            lastName: doc.lastName,
            createdAt: doc.createdAt
        });
    }
}