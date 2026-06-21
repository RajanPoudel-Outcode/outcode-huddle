import mongoose, { Document, Schema } from 'mongoose';
import { IFaq } from '../types/faq.types';

export interface IFaqDocument extends IFaq, Document {}

const faqSchema: Schema<IFaqDocument> = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        default: "",
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const Faq = mongoose.model<IFaqDocument>("faq", faqSchema);
export default Faq;
