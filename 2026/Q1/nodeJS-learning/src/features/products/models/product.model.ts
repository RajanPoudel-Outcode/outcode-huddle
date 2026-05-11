import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from '../types/products.types';
import { reviewSchema } from './review.model';

export interface IProductDocument extends IProduct, Document {}

const productSchema: Schema<IProductDocument> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    images: [{
        type: String
    }],
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 5
    },
    review: [reviewSchema],
    countInStock: {
        type: Number,
        required: true,
        default: 1,
        min: 0
    }
}, {
    timestamps: true
});

export const Product = mongoose.model<IProductDocument>("product", productSchema);
export { productSchema };
export default Product;
