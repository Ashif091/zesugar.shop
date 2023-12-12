const mongoose = require('mongoose')

const otpcollection = mongoose.Schema({
  email : {
    type : String ,
    required : [true, "please enter the mail"],
    unique : [true, "the mail already taken "]
  }, 
  
    otp: {
      type: Number
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: '60s' } 
    }
  
,


})

module.exports = mongoose.model("OTP",otpcollection)