import mongoose, { Document, Schema } from 'mongoose';
import { ISupportRequest, SUPPORT_STATUSES } from '../types/support.types';

export interface ISupportRequestDocument extends Omit<ISupportRequest, 'user'>, Document {
  user: mongoose.Types.ObjectId;
}

const supportRequestSchema: Schema<ISupportRequestDocument> = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: SUPPORT_STATUSES,
        default: "open"
    },
    response: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

export const SupportRequest = mongoose.model<ISupportRequestDocument>("supportRequest", supportRequestSchema);
export default SupportRequest;
