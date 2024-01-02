const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

});

const wishlist = mongoose.model('wishlist', wishlistSchema);
module.exports = wishlist;