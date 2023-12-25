const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  category_name: {
    type: String,
  },
  category_description: {
    type: String,
  },
  category_image_url: {
    type: String,
  },
  category_qty: {
    type: Number,
    default: 0,
  },
  category_publishDate: {
    type: Date,
    default: Date.now,
  },
});

category = mongoose.model('category', CategorySchema);

module.exports = category;
