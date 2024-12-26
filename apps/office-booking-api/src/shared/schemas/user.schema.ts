import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../utils/user-role.enum'

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash?: string;

    @Prop({
        type: String,
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;

    @Prop({ required: true, unique: true })
    nickname?: string;

    @Prop({ required: true })
    phone?: string;

    @Prop({ required: true })
    firstName?: string;

    @Prop({ required: true })
    lastName?: string;

    @Prop({ default: Date.now })
    createdAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
    transform: (_, ret) => {
        ret.id = ret._id.toString(); // Add `id` for responses
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash; // Never expose passwordHash
    },
});