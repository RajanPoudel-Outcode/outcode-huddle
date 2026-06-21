import mongoose, { Document, Schema } from 'mongoose';
import { ICategory } from '../types/categories.types';

export interface ICategoryDocument extends ICategory, Document {}

const categorySchema: Schema<ICategoryDocument> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    image: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export const Category = mongoose.model<ICategoryDocument>("category", categorySchema);
export default Category;
