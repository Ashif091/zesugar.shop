const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
 couponName: {
    type: String,
  },
  couponOff: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: 0,
  },
  minValue: {
    type: Number,
    default: 0,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
  },
  validFrom: {
    type: Date,
  },
  validTo: {
    type: Date,                                
  }, 
  createdAt: {
    type: Date,
    default: Date.now,
},
});

const couponModel =  mongoose.model('coupon', couponSchema);
module.exports = couponModel; 