const users = require("../models/userModel");
const product = require("../models/productModel");
const Cart = require('../models/cartModel');



module.exports = {
    getcheckout:async (req,res)=>{
        try {
            const user = req.session.username;
            let userData = await users.findById(user._id);
            // cart removed count msg
            let cartclsCount;
            cartclsCount = req.session.removedCount ?? 0;
            if (!userData) {
                return res.redirect('/');
            }
            let isCart = await Cart.findOne({ userId: userData._id })


            console.log(`THE DATA OF COUNT ${cartclsCount}`);
            return res.status(202).render("checkOut",{userData,isCart,cartclsCount})

            
        } catch (error) {
            console.log("server ERROR - getcheckout ");
            return res.render("404page",{error})
        }
        
    }
    ,
    cls_removel_msg:async (req,res)=>{
        console.log(`req as GET - cls_removel_msg`);
        try {
            let data =  req.session.removedCount
            if (!data) {
                return res.json("no data")
            }else{
                req.session.removedCount = null;
                req.session.save();
            }        
            
        } catch (error) {
            console.log("server ERROR - cls_removel_msg ");
            return res.render("404page",{error})
            
        }
    }

};





