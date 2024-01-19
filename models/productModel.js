const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  product_name: {
    type: String,
  },
  product_description: {
    type: String,
  },
  product_price: {
    type: Number,

    min: 0,
  },
  real_price: {
    type: Number,
  },
  brand: {
    type: String,
  },
  product_qty: {
    type: Number,
    default: 0,
  },
  product_image_url: [
    {
      type: String,
      default: Date.now,
    },
  ],

  product_off: {
    type: Number,
  },
  product_category: {
    type: String,
  },
  product_categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
  },
  product_publishDate: {
    type: Date,
    default: Date.now,
  },
  product_status: {
    type: Boolean,
    default: true,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'offer',
  },
  category_offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'offer',
  },
});

product = mongoose.model('product', ProductSchema);

module.exports = product;
