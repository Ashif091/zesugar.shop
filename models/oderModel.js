const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userCollection',
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

    orderNumber: String,

    orderDate: {
        type: Date,
        default: Date.now,
    },


    totalPrice: {
        type: Number,
    },
    shippingAddress: {
        username: String,
        city: String,
        state: String,
        postalCode: String,
        address_tag: String,
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
