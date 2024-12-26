import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CabinDocument = Cabin & Document;

/** 
 * Кабінка для короткострокових переговорів 
 */
@Schema({ timestamps: true })
export class Cabin {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    capacity: number;

    @Prop()
    description?: string;

    /**
     * Чи доступна для бронювання?
     * true - можна забронювати
     * false - неактивна/закрита на ремонт і т.п.
     */
    @Prop({ default: true })
    isAvailable: boolean;
}

export const CabinSchema = SchemaFactory.createForClass(Cabin);
