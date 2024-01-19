const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    balance: {
        type: Number,
        default: 0,
        get: value => value.toFixed(2),
        set: value => parseFloat(value.toFixed(2)), 
    },
    transactions: [
        {   
            description: String,
            amount: {
                type: Number,
                default: 0
            },
            transaction_type: {
                type: Boolean,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

const Wallet = mongoose.model('wallet', walletSchema);

module.exports = Wallet;