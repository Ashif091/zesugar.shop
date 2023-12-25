const users = require("../models/userModel");
const product = require("../models/productModel");
const Cart = require('../models/cartModel');
const addressCollections = require("../models/addressModel");
const Razorpay = require("razorpay")

module.exports = {
    getcheckout: async (req, res) => {
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

            // ________Address data_______

            const Address = await addressCollections.find({ userId: userData._id });

            const userAddress = Address.map(address => address);

            // ___________________________
            //             cart product    

            let productIds = isCart.items.map(product => product.product);
            const itemCount = productIds.length;
            let cart_items = isCart.items.map(product => product);
            console.log(cart_items);

            const products_data = await product.find({
                _id: {
                    $in: productIds.map(id => id)
                }
            }).sort({ _id: -1 });



            // ____________________________


            console.log(`THE DATA OF COUNT ${cartclsCount}`);
            return res.status(202).render("checkOut", { userData, isCart, cartclsCount, userAddress, products_data, cart_items, itemCount })


        } catch (error) {
            console.log("server ERROR - getcheckout ");
            return res.render("404page", { error })
        }

    }
    ,
    cls_removel_msg: async (req, res) => {
        console.log(`req as GET - cls_removel_msg`);
        try {
            let data = req.session.removedCount
            if (!data) {
                return res.json("no data")
            } else {
                req.session.removedCount = null;
                req.session.save();
            }

        } catch (error) {
            console.log("server ERROR - cls_removel_msg ");
            return res.render("404page", { error })

        }
    },
    razorpay_payment_req: async (req, res) => {
        console.log(`req as GET - razorpay_payment_req`);
        try {
            const user = req.session.username;
            let userData = await users.findById(user._id);
            if (!userData) {
                return res.redirect('/');
            }
            const isCart = await Cart.findOne({ userId: userData._id })
            const totalPrice = isCart.total;

            var razorpay = new Razorpay({ key_id: 'rzp_test_DMGbn7AEeBDC31', key_secret: 'GxY6aoUnZ3ZLMZ4AW3z7wZkH' })

            const options = {
                amount: totalPrice * 100,
                currency: 'INR',
                receipt: 'order_receipt_1',
            };

            razorpay.orders.create(options, (err, order) => {
                if (err) {
                    return res.status(500).json({ error: 'Error creating order' });
                }
                const orderDetails = {
                    order: order,
                    userData,
                };
                
                console.log(`the order data ${JSON.stringify(orderDetails)}`);
                res.json(orderDetails);
            });

        } catch (error) {
            console.log("server ERROR - cls_removel_msg ", error);
            return res.render("404page", { error })

        }
    },
    confirmOrder:async (req,res)=>{
        try {
            console.log("req :(fetch post) for confirmOder");
            const {id_address,payment_method} =req.body;
            const user = req.session.username;

            let userData = await users.findById(user._id);
            if (!userData) {
                return res.redirect('/');
            }
            
            const isCart = await Cart.findOne({ userId: userData._id })


        } catch (error) {
            console.log("server ERROR - cls_removel_msg ", error);
            return res.render("404page", { error })
        }
        
    }
};





