import mongoose, { Document, Schema } from 'mongoose';
import { CONTENT_PAGE_TYPES, IContentPage } from '../types/content.types';

export interface IContentPageDocument extends IContentPage, Document {}

const contentPageSchema: Schema<IContentPageDocument> = new mongoose.Schema({
    type: {
        type: String,
        enum: CONTENT_PAGE_TYPES,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export const ContentPage = mongoose.model<IContentPageDocument>("contentPage", contentPageSchema);
export default ContentPage;
