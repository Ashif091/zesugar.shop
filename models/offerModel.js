const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
    },
    itemOffer: {
        type: Number,
        default: 0,
    },
    offer_description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

const Offer = mongoose.model('offer', offerSchema);
module.exports = Offer;