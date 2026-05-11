import mongoose, { Document, Schema } from 'mongoose';
import { IOrder } from '../types/orders.types';

export interface IOrderDocument extends IOrder, Document {}

const orderSchema: Schema<IOrderDocument> = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    orderItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    shippingAddress: {
        type: String,
        required: true,
        trim: true
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true,
        enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery']
    },
    totalTax: {
        type: Number,
        required: true,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

export const Order = mongoose.model<IOrderDocument>("order", orderSchema);
export default Order;
