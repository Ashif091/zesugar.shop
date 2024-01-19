const users = require("../models/userModel");
const product = require("../models/productModel");
const Cart = require('../models/cartModel');
const addressCollections = require("../models/addressModel");
const UserOrder = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const Razorpay = require("razorpay");
const Coupons = require("../models/couponModel");
const { render } = require("ejs");

module.exports = {
    checkOutreq: async (req, res) => {
        try {
            req.session.checkPage = true;
            const user = req.session.username;
            let userData = await users.findById(user._id);
            let cartCheckoutData = await Cart.findOne({ userId: userData._id }).populate(['items.product']);
            req.session.cartCheckoutData = cartCheckoutData;

            res.redirect("/getcheckout")

        } catch (error) {
            console.log("server ERROR - cls_removel_msg ");
            return res.render("404page", { error })

        }
    },
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
            let userAddress;
            if (!(Address == '')) {
                console.log(`user have address doc ${Address}`);
                userAddress = Address.map(address => address);
            } else {
                console.log("else condition");
                userAddress = false;
            }

            // ___________________________
            //             cart product    

            let productIds = isCart.items.map(product => product.product);
            const itemCount = productIds.length;
            let cart_items = isCart.items.map(product => product);

            const products_data = await product.find({
                _id: {
                    $in: productIds.map(id => id)
                }
            }).sort({ _id: -1 });



            // ____________________________
            // ________romoving coupons____
            if (req.session.couponCode) {
                req.session.couponCode = false;
                req.session.save();
            }
            // ___________________________


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
                await req.session.save();
            }

            req.session.checkOutValidation = false;
            await req.session.save();
        } catch (error) {
            console.log("server ERROR - cls_removel_msg ");
            return res.render("404page", { error })
        }
    },
    cls_removel_OUTOFSTOCKmsg: async (req, res) => {
        console.log(`req as GET - cls_removel_msg`);
        try {
            req.session.checkOutValidation = false;
            await req.session.save();
        } catch (error) {
            console.log("server ERROR - cls_removel_msg ");
            return res.render("404page", { error })
        }
    },

    razorpay_payment_req: async (req, res) => {
        console.log(`req as GET - razorpay_payment_req`);
        try {
            //_____validatation _____________ 

            let cartSessionData = req.session.cartCheckoutData;

            let cartValidation = cartSessionData.items
            for (let itemData of cartValidation) {

                const productDta = await product.findById(itemData.product._id)

                console.log(itemData.product.product_qty);
                if (productDta.product_qty - itemData.product.product_qty < 0 || (productDta.product_qty === 0)) {
                    req.session.checkOutValidation = true;
                    return res.json({ status: false, cartErr: true })

                }
            }


            // _____________________
            const user = req.session.username;
            let userData = await users.findById(user._id);
            if (!userData) {
                return res.redirect('/');
            }
            const isCart = await Cart.findOne({ userId: userData._id })
            let totalPrice = isCart.total;
            console.log(`the session data ${req.session.couponCode}`);
            if (req.session.couponCode) {
                let CouponsData = await Coupons.findOne({ couponName: req.session.couponCode })
                totalPrice = isCart.total - (isCart.total * (CouponsData.couponOff / 100))
            }

            var razorpay = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET })

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
            console.log("server ERROR - razorpay_payment_req ", error);
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
            //_____validatation _____________ 

            let cartSessionData = req.session.cartCheckoutData;

            let cartValidation = cartSessionData.items
            for (let itemData of cartValidation) {

                const productDta = await product.findById(itemData.product._id)

                console.log(itemData.product.product_qty);
                if (productDta.product_qty - itemData.product.product_qty < 0 || (productDta.product_qty === 0)) {
                    req.session.checkOutValidation = true;
                    return res.json({ status: false, cartErr: true })

                }
            }


            // _____________________


            let totalPrice = isCart.total;
            if (req.session.couponCode) {
                let CouponsData = await Coupons.findOne({ couponName: req.session.couponCode })
                totalPrice = Math.round(isCart.total - (isCart.total * (CouponsData.couponOff / 100)))// price round here 
                // coupon distroing and saving 

                let userInfo = await users.findById(user._id);

                let couponIndex = userInfo.usedCoupons.findIndex(coupon => coupon.couponName === req.session.couponCode);

                if (couponIndex !== -1) {
                    userInfo.usedCoupons[couponIndex].usageCount++;
                } else {
                    userInfo.usedCoupons.push({ couponName: req.session.couponCode, usageCount: 1 });
                }

                await userInfo.save();


                req.session.couponCode = false;
                await req.session.save()

            }
            //address
            const Address = await addressCollections.findById(id_address);
            //_______
            let balance_amount = "";
            if (payment_method == "UPI" || payment_method == "Wallet") {
                balance_amount = "Paid"
            } else {
                balance_amount = `${totalPrice}`
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
                const WalletBalance = userWallet.balance - totalPrice;
                if (WalletBalance < 0) {
                    return res.json({ orderdata: "", status: false, errMsg: `You have only ${userWallet.balance},DHS in your wallet,Choose another option` })
                }
                await Wallet.updateOne(
                    { userId: userData._id },
                    {
                        $inc: { balance: -totalPrice },
                        $push: {
                            transactions: {
                                description: `To purchase the order (${orderRandomId})`,
                                amount: totalPrice,
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
                totalPrice: totalPrice,
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

                    // ____________
                    // const isCart = await Cart.find({ 'items.product': productItem._id });

                    // if (isCart) {
                    //     isCart.items.forEach((item) => {
                    //         console.log("price",item.product_price,"pricse");
                    //         if (item.product.toString() === productItem._id &&item.quantity >0) {
                    //             isCart.totalQuantity = isCart.totalQuantity-item.quantity;
                    //             isCart.total = isCart.total - item.quantity*item.product_price;
                    //             item.quantity = 0;


                    //         }
                    //     });

                    //     await isCart.save();
                    // }

                    // _____________

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
            if (diffInSeconds >= 2) {
                res.redirect("/")
            }
            res.render('./userSide/orderSuccessPage.ejs', { orderId })
        } catch (error) {
            console.log("server ERROR - orderSuccesspage ", error);
            return res.render("404page", { error })
        }
    },
    applyCoupon: async (req, res) => {
        try {
            const { couponName } = req.body;
            const user = req.session.username;
            let userData = await users.findById(user._id);
            if (!userData) {
                return res.redirect('/');
            }
            let isCart = await Cart.findOne({ userId: userData._id })

            let CouponsData = await Coupons.findOne({ couponName: couponName })
            if (!CouponsData) {
                return res.json({ status: false, errMsg: `invalid coupon code` })
            }


            let currentDate = new Date();
            if (CouponsData.validTo <= currentDate) {
                return res.json({ status: false, errMsg: `coupon expired` })
            }
            if (CouponsData.validFrom >= currentDate) {
                return res.json({ status: false, errMsg: `coupon is valid From ${CouponsData.validFrom}` })
            }
            if (CouponsData.minValue > isCart.total) {
                return res.json({ status: false, errMsg: `the coupon is applicable only if the total is above  ${CouponsData.minValue}` })
            }

            if (CouponsData.maxDiscount < isCart.total) {
                return res.json({ status: false, errMsg: `the coupon is applicable only if the total is below  ${CouponsData.maxDiscount}` })
            }

            let userInfo = await users.findById(user._id);

            // Check if the coupon is already in the usedCoupons array
            let couponIndex = userInfo.usedCoupons.findIndex(coupon => coupon.couponName === CouponsData.couponName);
            
            if (couponIndex !== -1 && userInfo.usedCoupons[couponIndex].usageCount >= CouponsData.usageCount) {
               return res.json({ status: false, errMsg: `coupon maximum limit reached` });
            }
            

            // for true coupons
            req.session.couponCode = CouponsData.couponName;
            const offerPrice = Math.round(isCart.total - (isCart.total * (CouponsData.couponOff / 100)))

            return res.json({ status: true, errMsg: ``, offerPrice, couponName })

        } catch (error) {
            console.log("server ERROR - orderConfirm ", error);
            return res.json({ status: false, errMsg: `server error ${error}` })
        }
    },


};


