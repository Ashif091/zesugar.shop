const userdata = require("../models/userModel");
const addressCollections = require("../models/addressModel");
const UserOrder = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const wishlist = require("../models/wishlistModel");
const product = require("../models/productModel")
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const makePdf = require('../helpers/PdfGenerator.js') 




module.exports = {
    profile: async (req, res) => {
        try {
            const user = req.session.username;
            if (!user) {
                res.status(208).redirect('/');
            }
            let userData = await userdata.findById(user._id);
            const imgUrl = userData.imagePath
            if (imgUrl) {
                console.log("hi", userData);
                return res.render("./userSide/profilePage", { imgUrl, user, userData })
            } else {
                return res.render("./userSide/profilePage", { imgUrl: false, user, userData })
            }

        } catch (error) {
            console.log(`server Error with (profile GET) `);
            return res.render("404page", { error })
        }

    },
    createCode: async (req, res) => {
        try {
            console.log("req createCode");
            const user = req.session.username;
            if (!user) {
                res.status(208).redirect('/');
            }
            let userData = await userdata.findById(user._id);

            // Generate a unique six-digit number
            let referralCode;
            do {
                referralCode = parseInt(Math.random() * 900000) + 100000;
            } while (await userdata.exists({ referral_code: referralCode }));

            // Save the referral code to userData
            userData.referral_code = referralCode;
            await userData.save();

            res.json({ message: 'createCode successfully', status: true });

        } catch (error) {
            console.log(`server Error with (createCode GET) `);
            return res.json({ status: false, error, message: 'Fail to createCode, server Error !' });
        }

    },
    checkCode: async (req, res) => {
        try {
            console.log("req checkCode");
            const { code } = req.body
            console.log(code);
            const user = req.session.username;
            if (!user) {
                res.status(208).redirect('/');
            }
            let userData = await userdata.findById(user._id);

            // Generate a unique six-digit number
            let referralCode;
            do {
                referralCode = parseInt(Math.random() * 900000) + 100000;
            } while (await userdata.exists({ referral_code: referralCode }));

            // Save the referral code to userData
            userData.referral_code = referralCode;
            await userData.save();

            const referralUser = await userdata.findOne({ referral_code: code })

            if (!referralUser) {
                return res.json({ status: false, error, message: 'Enter valid code' });
            }
            let referralUserWallet = await Wallet.findOne({ userId: referralUser._id })
            if (!referralUserWallet) {
                console.log('no Wallet');
                referralUserWallet = new Wallet({
                    userId: referralUser._id,
                    transactions: [
                        {
                            description: `Referral amount of ${userData.name}`,
                            amount: 504,
                        },
                    ],

                    balance: 504,

                });
                await referralUserWallet.save();

            } else {

                await Wallet.updateOne(
                    { userId: referralUser._id },
                    {
                        $inc: { balance: 504 },
                        $push: {
                            transactions: {
                                description: `Referral amount of ${userData.name}`,
                                amount: 504,
                                transaction_type: true,
                                date: new Date(),
                            },
                        },
                    }
                );
            }

            let UserWallet = await Wallet.findOne({ userId: userData._id })
            if (!UserWallet) {
                console.log('no Wallet');
                UserWallet = new Wallet({
                    userId: userData._id,
                    transactions: [
                        {
                            description: `By using referral code of  ${referralUser.name}`,
                            amount: 504,
                        },
                    ],

                    balance: 504,

                });
                await UserWallet.save();

            } else {

                await Wallet.updateOne(
                    { userId: userData._id },
                    {
                        $inc: { balance: 204 },
                        $push: {
                            transactions: {
                                description: `By using referral code of  ${referralUser.name}`,
                                amount: 204,
                                transaction_type: true,
                                date: new Date(),
                            },
                        },
                    }
                );
            }



            res.json({ message: 'apply Code successfully', status: true, amount: 204, referralCode});

        } catch (error) {
            console.log(`server Error with (createCode GET) `);
            return res.json({ status: false, error, message: 'Fail to createCode, server Error !' });
        }

    },
    imgupload: async (req, res) => {
        try {
            const user = req.session.username;
            let userDocument = await userdata.findById(user._id);

            let imagePath = req.file.path
            if (imagePath.includes('public\\')) {
                imagePath = imagePath.replace('public\\', '');
            } else if (imagePath.includes('public/')) {
                imagePath = imagePath.replace('public/', '');
            }

            userDocument.imagePath = imagePath;
            const status = await userDocument.save();

            if (status) {
                res.json({ status: true })
            } else {
                res.json({ status: false })
            }



        } catch (error) {
            console.log(`server Error with (imgupload POST) ${error}`);
            res.json({ status: false })

        }
    }
    ,
    imgEdit: async (req, res) => {
        try {
            const user = req.session.username;
            let userDocument = await userdata.findById(user._id);
            let previousImg_path = userDocument.imagePath;
            let previousPath = path.join('public', previousImg_path);


            let imagePath = req.file.path

            if (imagePath.includes('public\\')) {
                imagePath = imagePath.replace('public\\', '');
            } else if (imagePath.includes('public/')) {
                imagePath = imagePath.replace('public/', '');
            }

            userDocument.imagePath = imagePath;
            const status = await userDocument.save();

            // ========croping===========

            // =========================

            fs.unlink(previousPath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${err}`);
                } else {
                    console.log('File deleted successfully');
                }
            });

            if (status) {
                res.json({ status: true })
            } else {
                res.json({ status: false })
            }



        } catch (error) {
            console.log(`server Error with (imgedit POST) ${error}`);
            res.json({ status: false })

        }
    }
    ,

    profileAddress: async (req, res) => {
        try {
            const user = req.session.username;
            if (!user) {
                res.status(208).redirect('/');
            }
            const userData = await userdata.findById(user._id);

            const Address = await addressCollections.find({ userId: userData._id });

            const userAddress = Address.map(address => address);

            console.log(`the address of user ${typeof (userAddress)}`);

            return res.render("./userSide/profileAddress", { user, userData, userAddress })


        } catch (error) {
            console.log(`server Error with (profile GET) `);
            return res.render("404page", { error })
        }

    },
    newAddress: async (req, res) => {
        try {
            const userData = req.session.username;
            const {
                name,
                phone_number,
                pincode,
                locality,
                address,
                city,
                state,
                landmark,
                alternate_phone,
                address_type
            } = req.body;

            if (!userData) {
                return res.redirect('/');
            }

            let addressData = await addressCollections.findOne({ userId: userData._id });
            addressData = new addressCollections({
                userId: userData._id,
                name,
                phone_number,
                pincode,
                locality,
                address,
                city,
                state,
                landmark,
                alternate_phone,
                address_type
            });
            await addressData.save();
            res.status(202).redirect("back")

        } catch (error) {
            console.log(`server Error with (newAddress POST) `);
            return res.render("404page", { error })
        }

    },
    editAddress: async (req, res) => {
        try {
            console.log(req.body);
            const {
                name,
                phone_number,
                pincode,
                locality,
                address,
                city,
                state,
                landmark,
                alternate_phone,
                address_type,
                id,
            } = req.body;
            console.log(`the id is ${id}`);
            const result = await addressCollections.findOneAndUpdate(
                { _id: id },
                {
                    name,
                    phone_number,
                    pincode,
                    locality,
                    address,
                    city,
                    state,
                    landmark,
                    alternate_phone,
                    address_type,
                }
            )
            if (result.matchedCount === 0) {
                res.json({ message: 'No document matches the provided query.', status: false });

            } else {
                res.json({ message: 'Address updated successfully', status: true, editedData: req.body });

            }


        } catch (error) {
            console.log(`server Error with (edit Address PUT) ${error} `);
            return res.json({ status: false, error, message: 'Fail to update, server Error !' });
        }
    },
    delete_address: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await addressCollections.findOneAndDelete({ _id: id });

            if (result.deletedCount === 0) {
                res.json({ message: 'No document matches the provided query.', status: false })
            }

            res.json({ message: 'Address deleted successfully', status: true });
        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.json({ status: false, error, message: 'Fail to Delete, server Error !' });
        }
    },


    // ======== order history ======

    orderHistory: async (req, res) => {
        try {
            const user = req.session.username;
            if (!user) {
                res.status(208).redirect('/');
            }
            let userData = await userdata.findById(user._id);

            const ITEMS_PER_PAGE = 3;
            const page = +req.query.page || 1;

            const totalOrders = await UserOrder.countDocuments({ userId: userData._id });
            const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

            const orderDataDOC = await UserOrder.find({ userId: userData._id })
                .sort({ orderDate: -1 })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .populate(['items.product', 'shippingAddress']);
            if (orderDataDOC.length === 0) {
                return res.render("./userSide/profileOrders", {
                    user,
                    userData,
                    orderData: false,
                    currentPage: page,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1
                });
            }


            return res.render("./userSide/profileOrders", {
                user,
                userData,
                orderData: orderDataDOC,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1
            });

        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }
    },


    orderdetails: async (req, res) => {
        try {
            const user = req.session.username;
            const orderid = req.params.id;
            if (!user) {
                res.status(208).redirect('/');
            }
            let userData = await userdata.findById(user._id);

            const orderDetail = await UserOrder.findById(orderid).populate(['items.product', 'shippingAddress']);

            console.log(orderDetail);
            return res.render("./userSide/orderDetailPage", { user, userData, orderDetail })

        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }
    },

    orderCancel: async (req, res) => {
        try {
            const user = req.session.username;
            const orderid = req.params.id;
            if (!user) {
                res.status(208).redirect('/');
            }
            let userData = await userdata.findById(user._id);

            const orderdata = await UserOrder.findById(orderid);
            if(orderdata.status==='cancelled'){
                console.log(true);
                return res.redirect('back')
            }
            if (orderdata.paymentMethod == 'UPI' || orderdata.paymentMethod == 'Wallet') {
                let userWallet = await Wallet.findOne({ userId: userData._id })
                //___________cash add to  Wallet______________ 
                if (!userWallet) {
                    console.log('no Wallet');
                    userWallet = new Wallet({
                        userId: userData._id,
                        transactions: [
                            {
                                description: `Refund of cancelled order (${orderid})`,
                                amount: orderdata.totalPrice,
                            },
                        ],

                        balance: orderdata.totalPrice,

                    });
                    await userWallet.save();

                } else {


                    await Wallet.updateOne(
                        { userId: userData._id },
                        {
                            $inc: { balance: orderdata.totalPrice },
                            $push: {
                                transactions: {
                                    description: `Refund of cancelled order (${orderid})`,
                                    amount: orderdata.totalPrice,
                                    transaction_type: true,
                                    date: new Date(),
                                },
                            },
                        }
                    );


                }

            }

            //__________________qty update in stock________________________

            for (const item of orderdata.items) {
                const productId = item.product;
                const productDb = await product.findById(productId);
                if (!productDb) {
                    console.error(`Product not found with id ${productId}`);
                    continue;
                }
                productDb.product_qty = productDb.product_qty + item.quantity
                if (productDb.product_status == false) {
                    productDb.product_status = true;
                }
                await productDb.save();
            }

            console.log('Product quantities updated successfully');

            // ____________________________________________________________


            orderdata.status = 'cancelled';
            orderdata.balance_amount = 'Refund';
            orderdata.paymentStatus = 'Processing';
            orderdata.check_status = false;
            await orderdata.save();
            //cart upadate 


            const orderDetail = await UserOrder.findById(orderid).populate(['items.product', 'shippingAddress']);

            return res.render("./userSide/orderDetailPage", { user, userData, orderDetail })

        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }
    },

    getWishlist: async (req, res) => {
        console.log("req wishlist");
        try {
            const user = req.session.username;
            if (!user) {
                res.status(208).redirect('/');
            }

            let userData = await userdata.findById(user._id);

            let userWishlist = await wishlist.findOne({ userId: userData._id }).populate(['items.product']);

            console.log(userWishlist);

            return res.render("./userSide/profileWishlist", { user, userData, userWishlist })

        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }
    },
    addWishlist: async (req, res) => {
        const productId = req.query.id;
        const user = req.session.username;

        try {
            let userDbData = await userdata.findById(user._id);
            if (!userDbData) {
                return res.redirect('/');
            }

            const productData = await product.findOne({ _id: productId });

            let userWishlist = await wishlist.findOne({ userId: userDbData._id });
            if (!userWishlist) {

                userWishlist = new wishlist({
                    userId: userDbData._id,
                    items: [
                        {
                            product: productData._id,
                        },
                    ],
                });
                await userWishlist.save();

            } else {
                // =================================
                console.log("ADDING......................");

                await wishlist.updateOne(
                    { userId: userDbData._id },
                    {
                        $push: { items: { product: productData._id } }

                    }
                )


            }

            return res.json({ status: true, errmsg: ` `, data: productId });
        } catch (error) {
            console.error('Error adding product to addWishlist:', error);
            return res.json({ status: false, errmsg: `'server ERROR ` });
        }
    },
    productDeleteFromTheWishlist: async (req, res) => {
        let user = req.session.username;
        const productId = req.query.id;
        console.log(`get the delete req ${productId}`);

        try {
            let userData = await userdata.findById(user._id);
            if (!userData) {
                return res.redirect('/');
            }
            const userWishlist = await wishlist.findOne({ userId: userData._id });
            if (!userWishlist) {
                return res.json({ status: false, errmsg: ` `, data: productId });

            }

            await wishlist.findOneAndUpdate(
                { userId: userData._id },
                { $pull: { items: { product: productId } } }
            )
            const WishlistItems = await wishlist.findOne({ userId: userData._id });
            return res.json({ status: true, errmsg: ` `, data: productId, itemsCount: WishlistItems.items.length });


        } catch (error) {
            console.error('Error adding product to Wishlist:', error);
            return res.json({ status: false, errmsg: `'server ERROR ` });
        }
    }
    ,
    orderReturn: async (req, res) => {
        try {
            const user = req.session.username;
            const { reason, orderId } = req.body;
            console.log(req.body);
            if (!user) {
                res.status(208).redirect('/');
            }
            const userData = await userdata.findById(user._id);
            const orderdata = await UserOrder.findById(orderId);

            console.log(orderdata);

            orderdata.status = 'Return';
            orderdata.balance_amount = orderdata.totalPrice;
            orderdata.paymentStatus = 'Processing';
            orderdata.check_status = false;
            orderdata.retun_reason = reason;

            await orderdata.save();

            return res.json({ status: true, errMsg: "" })



        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.json({ status: false, errMsg: "server Error" })
        }
    },


    invoice: (async (req, res) => {
        console.log('req is invoice');
        try { 
            const user = req.session.username;
            const orderid = req.query.data;
            console.log(orderid);
            if (!user) {
                res.status(208).redirect('/');
            }
            let userData = await userdata.findById(user._id);

            const orderDetail = await UserOrder.findById(orderid).populate(['items.product', 'shippingAddress']);
            console.log(orderDetail);
            const path = './z_p-invoice.pdf'; 
            makePdf(path,orderDetail); 
            setTimeout(() => {
                res.download(path, () => {
                    console.log("send success");
                    // fs.unlinkSync(path); // Delete the file after sending it
                });
            }, 1000);

        } catch (error) {
            console.log(`server have trouble ${error}`);
        }

    }),




};