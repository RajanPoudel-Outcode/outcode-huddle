import mongoose, { Document, Schema } from 'mongoose';
import { IWishlist } from '../types/wishlist.types';

export interface IWishlistDocument extends Omit<IWishlist, 'products'>, Document {
  products: mongoose.Types.ObjectId[];
}

const wishlistSchema: Schema<IWishlistDocument> = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }]
}, {
    timestamps: true
});

export const Wishlist = mongoose.model<IWishlistDocument>("wishlist", wishlistSchema);
export default Wishlist;
