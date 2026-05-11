import mongoose, { Document, Schema } from 'mongoose';
import { IProductReview } from '../types/products.types';

export interface IReviewDocument extends IProductReview, Document {}

export const reviewSchema: Schema<IReviewDocument> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "Anonymous"
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default reviewSchema;
