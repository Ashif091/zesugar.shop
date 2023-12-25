const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    name: {
        type: String,
    },
    phone_number: {
        type: Number,
    },
    pincode: {
        type: Number,
    },

    locality: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    landmark: {
        type: String,
    },
    alternate_phone: {
        type: Number,
    },
    address_type: {
        type: String,
        default: 'home',
    },
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;