const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
            },
            orderPrice: Number,
            quantity: Number,
            priceOfTotalQTy: Number,
        },
    ],


    orderDate: {
        type: Date,
        default: Date.now,
    },


    totalPrice: {
        type: Number,
    },
    balance_amount:{
        type: String,
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },
    phoneNumber: String,
    email: String,
    paymentMethod: String,
    status: {
        type: String,
        default: 'pending',
    },
});

module.exports = mongoose.model('UserOrder', orderSchema);
