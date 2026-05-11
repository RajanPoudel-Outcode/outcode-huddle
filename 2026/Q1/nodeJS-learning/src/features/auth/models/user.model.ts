import mongoose, { Document, Schema } from 'mongoose';
import { IAuthUser } from '../types/auth.types';

export interface IUserDocument extends IAuthUser, Document {}

const userSchema: Schema<IUserDocument> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (value: string): boolean => {
                const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return emailRegex.test(value);
            },
            message: "Please enter a valid email address"
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: (value: string): boolean => {
                return value.length > 6;
            },
            message: "Password must be greater than 6 characters"
        }
    },
    address: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ['User', 'Admin'],
        default: "User"
    },
    image: {
        type: String,
        default: ""
    },
    token: {
        access_token: {
            type: String,
            default: ""
        },
        refresh_token: {
            type: String,
            default: ""
        }
    }
}, {
    timestamps: true,
    _id: true
});

export const User = mongoose.model<IUserDocument>("user", userSchema);
export default User;
