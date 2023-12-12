const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name : {
    type: String,
    required : [true,"please enter the name "]

  },
  email : {
    type : String ,
    required : [true, "please enter the mail"],
    unique : [true, "the mail already taken "]
  },
  password:{
    type : String,
    required :  [true,"please enter the password"]

  },
  user :{
    type:Number
  },
  imagePath:{
    type:String
  }

})

module.exports = mongoose.model("users",userSchema)