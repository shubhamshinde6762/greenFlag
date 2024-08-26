import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
    username: string;
    password: string;
}

const userSchema: Schema<IUser> = new Schema(
    {
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true 
    }
);

export const User = mongoose.model<IUser>('User', userSchema);
