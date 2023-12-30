const users = require("../models/userModel");
const product = require("../models/productModel");
const Cart = require('../models/cartModel');
const addressCollections = require("../models/addressModel");
const UserOrder = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const Razorpay = require("razorpay");
const { render } = require("ejs");

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
    confirmOrder: async (req, res) => {
        try {
            console.log("req :(fetch post) for confirmOder");
            const { id_address, payment_method } = req.body;
            const user = req.session.username;

            let userData = await users.findById(user._id);
            if (!userData) {
                return res.redirect('/');
            }

            const isCart = await Cart.findOne({ userId: userData._id })
            let cartitems = isCart.items
            //address
            const Address = await addressCollections.findById(id_address);
            //_______
            let balance_amount = "";
            if (payment_method == "UPI" || payment_method == "Wallet") {
                balance_amount = "Paid"
            } else {
                balance_amount = `${isCart.total}`
            }

            // ===============order Random ID ==============
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let orderRandomId = '';
            for (var i = 0; i < 24; i++) {
                var randomIndex = Math.floor(Math.random() * chars.length);
                orderRandomId += chars[randomIndex];
            }
            // =============================================
            // ________________if USE WALLET _______________________________  
            if (payment_method == "Wallet") {
                let userWallet = await Wallet.findOne({ userId: userData._id })
                if (!userWallet) {
                    return res.json({ orderdata: "", status: false, errMsg: "The Wallet is empty,Choose another option" })
                }
                const WalletBalance = userWallet.balance - isCart.total;
                if (WalletBalance < 0) {
                    return res.json({ orderdata: "", status: false, errMsg: `You have only ${userWallet.balance},DHS in your wallet,Choose another option` })
                }
                await Wallet.updateOne(
                    { userId: userData._id },
                    {
                        $inc: { balance: -isCart.total },
                        $push: {
                            transactions: {
                                description: `To purchase the order (${orderRandomId})`,
                                amount: isCart.total,
                                transaction_type: false,
                                date: new Date(),
                            },
                        },
                    }
                );

            }
            // ____________________________________________________________

            let newOrderItems = cartitems.map(item => ({
                product: item.product,
                orderPrice: item.product_price,
                quantity: item.quantity,
                priceOfTotalQTy: item.quantity * item.product_price
            }));

            let newOrder = new UserOrder({
                userId: userData._id,
                items: newOrderItems,
                shippingAddress: id_address,
                phoneNumber: Address.phone_number,
                email: userData.email,
                paymentMethod: payment_method,
                balance_amount: balance_amount,
                totalPrice: isCart.total,
                check_status: true,
            });

            await newOrder.save();
            // make cart empty.
            await Cart.updateOne(
                { userId: userData._id },
                { $set: { items: [], total: 0, totalQuantity: 0 } }
            );
            //remove qty from product manegment
            const productIds = newOrderItems.map(item => item.product);
            console.log(`the ids of items ${productIds}`);


            for (let item of newOrderItems) {
                console.log(`the upadata data :- ${item.quantity}`);

                await product.updateOne(
                    { "_id": item.product },
                    { $inc: { product_qty: - item.quantity } }
                );


            }
            // upadating stock 
            const productCollection = await product.find({ "_id": { $in: productIds } }).exec();
            console.log(`ITEMS:-${productCollection}`);
            for (const productItem of productCollection) {
                if (productItem.product_qty === 0) {
                    productItem.product_status = false;
                    await productItem.save();
                }

            }
            // sort last doc from order collection
            const latestDoc = await UserOrder.findOne().sort({ _id: -1 }).exec();



            res.json({ orderdata: latestDoc, status: true })

        } catch (error) {
            console.log("server ERROR - orderConfirm ", error);
            res.json({ orderdata: "", status: false, errMsg: `server error ${error}` })
        }

    },

    orderSuccesspage: async (req, res) => {
        try {
            const orderId = req.params.id;
            const orderDoc = await UserOrder.findById(orderId)
            if (!orderDoc) {
                res.redirect("/")
            }

            const now = new Date();
            const orderDate = new Date(orderDoc.orderDate);
            const diffInSeconds = Math.abs((now.getTime() - orderDate.getTime()) / 1000);
            console.log("time:", diffInSeconds);
            if (diffInSeconds >= 5) {
                res.redirect("/")
            }
            res.render('./userSide/orderSuccessPage.ejs', { orderId })
        } catch (error) {
            console.log("server ERROR - orderSuccesspage ", error);
            return res.render("404page", { error })
        }
    }

};


