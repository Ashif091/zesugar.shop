const users = require("../models/userModel")
const product = require("../models/productModel")
const Cart = require('../models/cartModel');
const category = require("../models/categoryModel")
const asyncHandler = require("express-async-handler")
const fs = require('fs');
const path = require('path');
const Wallet = require("../models/walletModel");
const Offer = require("../models/offerModel");
const Coupons = require("../models/couponModel");

const bcrypt = require("bcrypt")
const moment = require('moment')

const addressCollections = require("../models/addressModel");
const UserOrder = require("../models/orderModel");
const makePdf = require('../helpers/ReportPDF')

// excel dependencies
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Sales Data');

module.exports = {


    admincheck: asyncHandler(async (req, res) => {

        const { email, password } = req.body
        if (!email || !password) {
            res.status(400).render("admin.ejs", { errmsg: "email and password are needed" })
        }
        const admindata = { email: "admin@gmail.com", password: "$2b$10$0t78yX4pp9TZBApiSmcaMOkC0UndIk/1drvxZzVxKLNuJzOL1OrOm" }
        if (email === admindata.email) {
            const verify = await bcrypt.compare(password, admindata.password)
            if (!verify) {
                res.status(404).render("admin.ejs", { errmsg: "password is wrong." })
            }
        }
        else {
            return res.status(404).render("admin.ejs", { errmsg: "this admin-Email does not exist" })
        }
        console.log(`${admindata.name} entered`);
        req.session.admin = admindata
        return res.redirect("/admin/adminDashboard")



    }),

    usermanagement: asyncHandler(async (req, res) => {
        try {
            const ITEMS_PER_PAGE = 5; // Define the number of items per page
            const page = +req.query.page || 1; // Get the current page number
            const totalDoc = await users.countDocuments();
            const totalPages = Math.ceil(totalDoc / ITEMS_PER_PAGE);


            const userslist = await users.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)




            res.render("./adminSide/adminUserManagement.ejs", {
                userslist,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
            })
        } catch (error) {
            console.log("server ERROR - orderSuccesspage ", error);
            return res.render("404page", { error })
        }


    }),

    userstatus: asyncHandler(async (req, res) => {
        const userId = req.query.id;
        console.log(userId);

        try {
            // Find the user by ID
            const existingUser = await users.findById(userId);

            if (!existingUser) {
                return res.status(404).json({ status: true, error: 'User not found' });
            }

            // Update the user's status
            if (existingUser.user == 0) {
                existingUser.user = 1;
            } else {
                existingUser.user = 0;
            }

            await existingUser.save();
            res.json({ status: true })


        } catch (error) {
            console.error(error);
            res.json({ status: false, error: 'Internal Server Error' });
        }
    })

    ,
    // =======================productmangement=======================

    productmangement: (async (req, res) => {
        console.log("productmangement requst got as the get");
        try {

            const ITEMS_PER_PAGE = 5; // Define the number of items per page
            const page = +req.query.page || 1; // Get the current page number
            const totalDoc = await product.countDocuments();
            const totalPages = Math.ceil(totalDoc / ITEMS_PER_PAGE);


            const productlist = await product.find()
                .sort({ product_publishDate: -1 })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)

            let result = await category.find()

            console.log(result);

            const countData = (page - 1) * ITEMS_PER_PAGE + 1;

            res.render("productmangement.ejs", {
                productlist, result, currentPage: page,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                countData,
            })
        } catch (error) {
            console.log(`server crash......due to productmangement ${error}`);
            res.status(404).render("404page", { error })
        }



    }),





    createProduct: async (req, res) => {
        console.log("enter prodecut creation ", req.body);
        const {
            productname,
            description,
            productprice,
            quantity,
            category,
        } = req.body;
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).send('No files uploaded.');
            }

            const imagePaths = req.files.map(file => {
                let imagePath = file.path;
                if (imagePath.includes('public\\')) {
                    imagePath = imagePath.replace('public\\', '');
                } else if (imagePath.includes('public/')) {
                    imagePath = imagePath.replace('public/', '');
                }
                return imagePath;
            });



            const productdata = await product.create({
                product_name: productname,
                product_description: description,
                product_price: productprice,
                product_category: category,
                product_qty: quantity,
                product_image_url: imagePaths,
                product_status: true,

            })

            if (productdata) {
                console.log("data will be saved in db", productdata);
            }
            const productlist = await product.findOne({ product_name: productname })


            res.redirect('back');
        } catch (error) {
            console.log(`server crash......due to createProduct ${error}`);
            res.status(404).render("404page", { error })
        }
    }
    ,
    // =========================================================
    usercls: asyncHandler(async (req, res) => {
        const user = await users.findById(req.params.userId)
        if (!user) {
            res.status(404)
            throw new Error("contact not fout ")
        }
        const datacls = await users.findByIdAndRemove(req.params.userId)
        if (datacls) {
            res.status(200).send('user deleted')
        } else {
            res.status(404)
        }
    })
    ,


    updateuser: asyncHandler(async (req, res) => {

        const userId = req.params.userId;
        console.log(req.body);
        const updatedData = req.body;
        console.log(userId);
        const updatedUser = await users.findByIdAndUpdate(
            userId,
            updatedData,
            { new: true });

        if (updatedUser) {
            return res.json(updatedUser);
        } else {
            console.log("error")
            res.status(404)
        }

    })
    ,
    createuser: asyncHandler(async (req, res) => {
        console.log("CREATION START");

        const { name, email, password } = req.body;

        const userAvailability = await users.findOne({ email });
        if (userAvailability) {

            res.status(208).redirect("/admin")
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await users.create({
            name,
            email,
            password: hashedPassword,
            user: 1

        })
        if (newUser) {
            console.log("new user created")
        }
        res.status(208).redirect("/admin")

    }),
    search: asyncHandler(async (req, res) => {
        const block = 0;
        console.log("inner search");
        const searchTerm = req.query.key;
        console.log(searchTerm);

        if (!searchTerm) {
            return res.redirect('admin')
        }
        const userslist = await users.find({ name: { $regex: searchTerm, $options: 'i' }, user: 1 }, { _id: 1, name: 1, email: 1 });
        console.log(`yes${userslist}`);
        res.render("admin-user-all.ejs", { userslist, block })



    })

    ,
    logout: ((req, res) => {
        req.session.destroy();
        res.redirect('/');

    })
    //    next 


    ,
    createProductDisplay: asyncHandler(async (req, res) => {

        const userId = req.params.userId;
        console.log(req.body);
        const updatedData = req.body;
        console.log(userId);
        const updatedUser = await users.findByIdAndUpdate(
            userId,
            updatedData,
            { new: true });

        if (updatedUser) {
            return res.json(updatedUser);
        } else {
            console.log("error")
            res.status(404)
        }

    })

    ,

    check: async (req, res) => {
        try {
            console.log(req.files);
            if (!req.files || req.files.length === 0) {
                return res.status(400).send('No files uploaded.');
            }

            const imagePaths = req.files.map(file => {
                let imagePath = file.path;
                if (imagePath.includes('public\\')) {
                    imagePath = imagePath.replace('public\\', '');
                } else if (imagePath.includes('public/')) {
                    imagePath = imagePath.replace('public/', '');
                }
                return imagePath;
            });




            const productdata = await product.findByIdAndUpdate(
                userId,
                updatedData,
                { new: true });

            if (productdata) {
                console.log("data will be saved in db", productdata);
            }
            const productlist = await product.findOne({ product_name: productname })


            let data = {
                "data": {
                    productname,
                    description,
                    quantity,
                    imagePaths,
                    _id: productlist._id


                },

            };
            res.json(data);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).send('Internal Server Error');
        }
    }


    ,
    deleteData: async function (req, res) {
        console.log("get the delete req");
        let productId = req.params.id
        try {
            const doc = await product.findById(productId);
            console.log(doc);

            console.log(doc.product_image_url[0]);
            try {
                doc.product_image_url.forEach(url => {

                    let newPath = url.replace(/\\/g, "/");
                    newPath = path.join("public", newPath);
                    console.log(newPath);
                    fs.unlinkSync(newPath)
                });
            } catch (error) {
                console.log(`can't track the given path`)
            }

            console.log("req is cuntinue");


            const status = await product.findByIdAndRemove(productId)
            if (status) {
                res.json({ st: true, id: productId });

            }
            else {
                res.json({ st: false });

            }

        } catch (err) {
            res.status(500).send({ st: false });
        }
    }

    ,
    editProduct: async (req, res) => {
        console.log("product  is start to edit ", req.body);
        const {
            productname,
            description,
            productprice,
            quantity,
            category,
            productid,
        } = req.body;

        try {


            let productdata = {}
            if (quantity <= 0) {
                productdata = {
                    product_name: productname,
                    product_description: description,
                    product_price: productprice,
                    product_category: category,
                    product_qty: quantity,
                    product_status: false,

                }
                let CartData = await Cart.find({ 'items.product': productid });
                for (const isCart of CartData) {
                    if (isCart) {
                        isCart.items.forEach((item) => {
                            console.log("price", item.product_price, "pricse");
                            if (item.product.toString() === productid && item.quantity > 0) {
                                isCart.totalQuantity = isCart.totalQuantity - item.quantity;
                                isCart.total = isCart.total - item.quantity * item.product_price;
                                item.quantity = 0;


                            }
                        });

                        await isCart.save();
                    }
                }


            } else {
                productdata = {
                    product_name: productname,
                    product_description: description,
                    product_price: productprice,
                    product_category: category,
                    product_qty: quantity,
                    product_status: true,

                }
                let CartData = await Cart.find({ 'items.product': productid });
                for (const isCart of CartData) {
                    if (isCart) {
                        isCart.items.forEach((item) => {
                            console.log("price", item.product_price, "pricse");
                            if (item.product.toString() === productid) {
                                isCart.totalQuantity = isCart.totalQuantity + 1;
                                isCart.total = isCart.total + item.product_price;
                                item.quantity = 1;


                            }
                        });

                        await isCart.save();
                    }
                    console.log(isCart);
                }
            }

            let data_status = await product.findByIdAndUpdate(
                productid,
                productdata,
                { new: true });

            if (productdata) {
                console.log("data will be saved in db", productdata);
            }


            let data = {
                "status": true

            };
            res.json(data);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    ,
    categoryGET: async (req, res) => {
        try {

            const categorylist = await category.find({})
            console.log(categorylist);

            return res.render("category_admin_management", { categorylist })
        } catch (error) {
            console.error(error); // Log the error for debugging
            res.status(500).send("Internal Server Error: " + error.message);
        }




    },

    categoryPOST: async (req, res) => {
        console.log(`post req (category_managment)`);
        const {
            categoryname,
            description,
        } = req.body;

        try {


            let imagePath = req.file.path
            if (imagePath.includes('public\\')) {
                imagePath = imagePath.replace('public\\', '');
            } else if (imagePath.includes('public/')) {
                imagePath = imagePath.replace('public/', '');
            }



            const categorydata = await category.create({
                category_name: categoryname,
                category_description: description,
                category_image_url: imagePath,
            })

            if (categorydata) {
                console.log("data will be saved in db");
            }
            return res.json({ status: true })

        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    editcategory: async (req, res) => {
        console.log("product  is start to edit ", req.body);


        try {
            const {
                categoryname,
                description,
                categoryid,
            } = req.body;

            await product.updateMany(
                { product_categoryId: categoryid },
                { $set: { product_category: categoryname } }
            );

            const categorydata = {
                category_name: categoryname,
                category_description: description,

            }

            let data_status = await category.findByIdAndUpdate(
                categoryid,
                categorydata,
                { new: true });

            if (data_status) {
                console.log("data will be saved in db", categorydata);
            }


            let data = {
                "status": true

            };
            res.json(data);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    ,
    productstatus: async function (req, res) {
        console.log("The status updation starting... ", req.body);
        let productId = req.body.id
        let msg = 'error'
        let current_st;
        try {
            const doc = await product.findById(productId);
            console.log('database connected');

            if (doc.product_qty === 0) {
                return;
            }

            if (req.body.current_status === 'true') {
                doc.set('product_status', false);
                msg = "unlist"
                current_st = false;
                // _______________________CART Update______________________________________-
                const carts = await Cart.find({ 'items.product': productId });

                for (let cart of carts) {
                    let productInCart = cart.items.find(item => item.product.toString() === productId);

                    if (productInCart) {
                        cart.total = cart.total - productInCart.product_price * productInCart.quantity
                        cart.totalQuantity = cart.totalQuantity - productInCart.quantity;
                        productInCart.quantity = 0;
                        await cart.save();
                    }
                }

                // _____________________________________________________________-

            } else {
                doc.set('product_status', true);
                msg = "list"
                current_st = true;

                // _______________________CART Update______________________________________-
                const carts = await Cart.find({ 'items.product': productId });

                for (let cart of carts) {
                    let productInCart = cart.items.find(item => item.product.toString() === productId);

                    if (productInCart) {
                        cart.total = cart.total + productInCart.product_price;
                        cart.totalQuantity = cart.totalQuantity + 1;
                        productInCart.quantity = 1;
                        await cart.save();
                    }
                }

                // _____________________________________________________________-
            }
            let status = await doc.save();

            if (status) {
                console.log('the code completed');
                res.json({ st: true, id: productId, msg, current_st });
            } else {
                res.json({ st: false });
            }
        } catch (err) {
            res.status(500).send("server error");
        }
    }

    ,
    productAvailability: async function (req, res) {
        try {
            const { productName } = req.body;
            const doc = await product.findOne({ product_name: productName });

            if (doc) {
                res.json({ status: true });
            } else {
                res.json({ status: false });
            }
        } catch (err) {
            res.status(500).send({ status: false });
        }
    },


    deletecategory: async function (req, res) {
        console.log("get the delete req");
        let categoryId = req.params.id
        try {
            const doc = await category.findById(categoryId);
            console.log(doc);

            console.log(doc.category_image_url);
            try {

                let newPath = doc.category_image_url.replace(/\\/g, "/");
                newPath = path.join("public", newPath);
                console.log(newPath);
                let del = await fs.unlinkSync(newPath)

            } catch (error) {
                console.log(`can't track the given path`)
            }

            console.log("req is cuntinue");


            const status = await category.findByIdAndRemove(categoryId)
            if (status) {
                res.json({ st: true, id: categoryId });

            }
            else {
                res.json({ st: false });

            }

        } catch (err) {
            res.status(500).send({ st: false });
        }
    },


    ordermanagement: (async (req, res) => {
        console.log("ordermanagement requst got as the get");
        try {

            // let searchData = .searchData;

            // console.log(searchData);
            console.log(req.query.page);


            const ITEMS_PER_PAGE = 4; // Define the number of items per page
            const page = +req.query.page || 1; // Get the current page number

            let searchData = req.query.searchData;
            if (searchData == undefined || (!searchData) || searchData == null || searchData == "All" || searchData == "all") {
                searchData = ""
            }

            console.log("Search Data:", searchData);
            console.log("Page:", page);
            let regex = new RegExp(searchData, 'i');


            const totalOrders = await UserOrder.countDocuments({ status: regex });
            const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
            const totalCheckedOrders = await UserOrder.countDocuments({ check_status: true });

            const orderData = await UserOrder.find({ status: regex })
                .sort({ orderDate: -1 })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .populate(['items.product', 'shippingAddress', 'userId']);

            return res.render("./adminSide/orderManagement", {
                orderData,
                totalCheckedOrders,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                searchData,
            });

        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }



    }),
    orderStatusUpdate: (async (req, res) => {
        console.log("orderStatusUpdate requst got as the get");
        try {
            const orderId = req.query.id;

            const orderData = await UserOrder.findById(orderId)
            const totalCheckedOrders = await UserOrder.countDocuments({ check_status: true });
            let orderStatus = "";
            if (orderData.status == "pending") {
                orderStatus = "Shipped";
            } else if (orderData.status == "Shipped") {
                orderStatus = "Out For Delivery";
            } else if (orderData.status == "Out For Delivery") {
                orderStatus = "Delivered";
            }
            orderData.status = orderStatus;
            orderData.check_status = false;

            await orderData.save()
            console.log({ status: true, msg: "", orderStatus, totalCheckedOrders });
            res.json({ status: true, msg: "", orderStatus, totalCheckedOrders })



        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            res.json({ status: false, msg: "server Error", orderStatus })
        }

    }),
    orderStatusSelect: (async (req, res) => {
        console.log("orderStatusSelect requst PATCH as the get");
        try {
            const orderId = req.query.id;
            const upDateData = req.query.data;

            const orderData = await UserOrder.findById(orderId)

            orderData.status = upDateData;
            orderData.check_status = false;

            await orderData.save()
            console.log({ status: true, msg: "" });
            res.json({ status: true, msg: "" })



        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            res.json({ status: false, msg: "server Error", orderStatus })
        }

    }),
    orderdetails: (async (req, res) => {
        console.log("orderdetails requst got as the get");
        try {

            const orderId = req.query.id;

            const orderData = await UserOrder.findById(orderId).populate(['items.product', 'shippingAddress', 'userId']);

            return res.render("./adminSide/orderdetails", {
                orderData,

            });
        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }



    }),
    orderReturn: (async (req, res) => {
        console.log("orderReturn requst got as the get");
        try {
            const { orderId, returnStatus } = req.body;
            const user = req.session.username;
            const userData = await users.findById(user._id);

            const orderdata = await UserOrder.findById(orderId);
            if (returnStatus === false) {
                orderdata.paymentStatus = "rejected";
                await orderdata.save();
            }
            else if (returnStatus === true) {
                // _______________if accept the return _______________

                let userWallet = await Wallet.findOne({ userId: userData._id })
                //___________cash add to  Wallet______________ 
                if (!userWallet) {
                    console.log('no Wallet');
                    userWallet = new Wallet({
                        userId: userData._id,
                        transactions: [
                            {
                                description: `Refund of return order (${orderId})`,
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
                                    description: `Refund of return order (${orderId})`,
                                    amount: orderdata.totalPrice,
                                    transaction_type: true,
                                    date: new Date(),
                                },
                            },
                        }
                    );


                }
                // _____________________________________
                if (req.body.restore) {
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

                }

                orderdata.status = 'Refund';
                orderdata.balance_amount = 'Refund';
                orderdata.paymentStatus = 'Successful';
                await orderdata.save();
                // ___________-if accept the return end__________---
            }

            return res.json({ status: true, errMsg: "" });


        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.json({ status: false, errMsg: "server Error" });

        }



    }),
    offermanagement: (async (req, res) => {
        console.log("offermanagement requst got as the get");
        try {
            let productsList = await product.find().populate(['offer']);



            return res.render("./adminSide/offerManagement", {
                productsList,
            });

        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }



    }),

    offerDetails: (async (req, res) => {
        console.log("offerDetails requst got as the get");
        try {
            const productId = req.query.id;
            const poductData = await product.findById(productId).populate(['offer']);
            return res.render("./adminSide/offerDetails", {
                poductData,
            });

        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }
    }),
    addOffer: (async (req, res) => {
        console.log("offerDetails requst POST");
        try {

            console.log(req.body);
            const { itemOffer, productId, offer_description } = req.body;
            const poductData = await product.findById(productId);

            const createOffer = new Offer({
                product: productId,
                itemOffer,
                offer_description,
            });
            await createOffer.save();
            let newPrice = 0;
            if (poductData.real_price) {
                newPrice = Math.round(poductData.real_price - (poductData.real_price * (itemOffer / 100)))

            } else {
                newPrice = Math.round(poductData.product_price - (poductData.product_price * (itemOffer / 100)))

            }
            const newOffer = await Offer.findOne({ product: productId });
            console.log(`the ${itemOffer} offer price ${newPrice} current price ${poductData.product_price}`);
            poductData.offer = newOffer._id;
            if (poductData.real_price && newPrice < poductData.product_price) {
                poductData.product_price = newPrice;
                poductData.product_off = itemOffer;
            }
            else if (!poductData.real_price) {
                poductData.real_price = poductData.product_price;
                poductData.product_price = newPrice;
                poductData.product_off = itemOffer
            }
            await poductData.save()
            res.json({ status: true })

        } catch (error) {
            console.log(`server Error with (addOffer)${error} `);
            return res.json({ status: false, errMsg: "server Error" });
        }
    }),

    removeOffer: (async (req, res) => {
        console.log("removeOffer requst POST");
        try {
            const { productId } = req.body;

            await Offer.deleteOne({ product: productId });

            const productdata = await product.findById(productId).populate(['category_offer']);
            if (productdata.category_offer) {
                productdata.product_price = Math.round(productdata.real_price - (productdata.real_price * (productdata.category_offer.itemOffer / 100)));
                productdata.product_off = productdata.category_offer.itemOffer;
                console.log(`the udated price ${Math.round(productdata.real_price - (productdata.real_price * (productdata.category_offer.itemOffer / 100)))}dhs ${productdata.category_offer.itemOffer}%`);
                await product.updateOne(
                    { _id: productId },
                    { $unset: { offer: "" } }
                );
            } else {
                productdata.product_price = productdata.real_price;

                await product.updateOne(
                    { _id: productId },
                    { $unset: { offer: "", real_price: "", product_off: "" } }
                );
            }
            await productdata.save();

            res.json({ status: true })
        } catch (error) {
            console.log(`server Error with (addOffer)${error} `);
            return res.json({ status: false, errMsg: "server Error" });
        }
    }),
    offermanagementCategory: (async (req, res) => {
        console.log("offermanagementCategory requst got as the get");
        try {
            let categoryList = await category.find().populate(['category_offer']);



            return res.render("./adminSide/offerCategory", {
                categoryList,
            });

        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }



    }),
    offerCategoryDetails: (async (req, res) => {
        console.log("offerDetails requst got as the get");
        try {
            const categoryId = req.query.id;
            const categoryData = await category.findById(categoryId).populate(['category_offer']);
            return res.render("./adminSide/offerCategoryDetail", {
                categoryData,
            });

        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }
    }),
    addCategoryOffer: (async (req, res) => {
        console.log("addCategoryOffer requst POST");
        try {
            console.log(req.body);
            const { itemOffer, categoryId, offer_description } = req.body;
            const categoryData = await category.findById(categoryId);

            const createOffer = new Offer({
                category: categoryId,
                itemOffer,
                offer_description,
            });
            await createOffer.save();

            const productsWithSameCategory = await product.find({ product_categoryId: categoryData._id }).populate(['offer']);

            const newOffer = await Offer.findOne({ category: categoryData._id });
            categoryData.category_offer = newOffer._id;
            await categoryData.save()
            for (const product of productsWithSameCategory) {
                console.log(`product updating ${product.category_name}`);
                product.category_offer = newOffer._id;
                if (product.offer && product.offer.itemOffer < itemOffer) {
                    console.log("product off exist");

                    product.product_price = Math.round(product.real_price - (product.real_price * (itemOffer / 100)));
                    product.product_off = itemOffer;

                } else if (!product.real_price) {
                    product.real_price = product.product_price;
                    product.product_price = Math.round(product.product_price - (product.product_price * (itemOffer / 100)));
                    product.product_off = itemOffer;

                }
                await product.save();
            }

            res.json({ status: true })

        } catch (error) {
            console.log(`server Error with (addOffer)${error} `);
            return res.json({ status: false, errMsg: "server Error" });
        }
    }),
    removeCategoryOffer: (async (req, res) => {
        console.log("removeCategoryOffer requst POST");
        try {
            const { categoryId } = req.body;

            await Offer.deleteOne({ category: categoryId });

            const poductDataCol = await product.find({ product_categoryId: categoryId }).populate(['offer']);
            for (const poductData of poductDataCol) {
                if (poductData.offer) {
                    poductData.product_price = Math.round(poductData.real_price - (poductData.real_price * (poductData.offer.itemOffer / 100)));
                    poductData.product_off = poductData.offer.itemOffer
                    await product.updateMany(
                        { product_categoryId: categoryId },
                        { $unset: { category_offer: "" } }
                    );
                } else {
                    poductData.product_price = poductData.real_price;

                    await product.updateOne(
                        { _id: poductData._id },
                        { $unset: { category_offer: "", real_price: "", product_off: "" } }
                    );
                }

                await poductData.save();

            }

            res.json({ status: true })
        } catch (error) {
            console.log(`server Error with (addOffer)${error} `);
            return res.json({ status: false, errMsg: "server Error" });
        }
    }),
    couponManagement: (async (req, res) => {
        console.log("offermanagement requst got as the get");
        try {
            let couponsList = await Coupons.find();


            return res.render("./adminSide/couponManagement", {
                couponsList,
            });

        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }



    }),
    addcoupon: (async (req, res) => {
        console.log("offerDetails requst POST");
        try {
            console.log(req.body);
            const { couponName, description, offerRate, validFrom, validTo, maxDiscount, minValue, usageCount } = req.body;

            const createCoupon = new Coupons({
                couponName,
                couponOff: offerRate,
                description,
                validFrom,
                validTo,
                maxDiscount,
                minValue,
                usageCount,
            });
            await createCoupon.save();


            res.json({ status: true })

        } catch (error) {
            console.log(`server Error with (addcoupon)${error} `);
            return res.json({ status: false, errMsg: "server Error" });
        }
    }),
    removeCoupon: (async (req, res) => {
        console.log("removeCoupon requst POST");
        try {
            const { id } = req.body;
            console.log(id);

            await Coupons.findOneAndDelete({ _id: id });




            res.json({ status: true })
        } catch (error) {
            console.log(`server Error with (addOffer)${error} `);
            return res.json({ status: false, errMsg: "server Error" });
        }
    }),
    couponAvailability: async function (req, res) {
        try {
            const { couponName } = req.body;
            const doc = await Coupons.findOne({ couponName: couponName });

            if (doc) {
                res.json({ status: true });
            } else {
                res.json({ status: false });
            }
        } catch (err) {
            res.status(500).send({ status: false });
        }
    },

    categorynameAvailability: async function (req, res) {

        try {
            let { categoryname } = req.body;
            categoryname = categoryname.toUpperCase();
            const doc = await category.findOne({ category_name: categoryname });
            if (doc) {
                res.json({ status: true });
            } else {
                res.json({ status: false });
            }
        } catch (err) {
            res.status(500).send({ status: false });
        }
    },



    getDashboard: asyncHandler(async (req, res) => {
        try {

            res.render("./adminSide/adminDashboard.ejs", {

            })
        } catch (error) {
            console.log("server ERROR - getDashboard ", error);
            return res.render("404page", { error })
        }


    }),

    chartData: asyncHandler(async (req, res) => {
        try {
            const dailyData = [];
            const monthData = [];
            const yearData = [];
            const hourData = [];


            const endDate = new Date(); // Current date
            for (let i = 0; i < 7; i++) {
                const currentStartDate = moment(endDate)
                    .subtract(i, 'days')
                    .startOf('day')
                    .toDate();
                const currentEndDate = moment(endDate)
                    .subtract(i, 'days')
                    .endOf('day')
                    .toDate();

                // Retrieve data for the current day
                const weekData = await UserOrder.find({
                    orderDate: {
                        $gte: currentStartDate,
                        $lte: currentEndDate,
                    },
                    status: { $nin: ['cancelled', 'Refund', 'Return', 'cancelled'] }
                })

                let orderCountWeek = weekData.length;

                const totalForDay = weekData.reduce((acc, order) => acc + order.totalPrice, 0);



                const currentDayData = {
                    date: moment(currentStartDate).format('DD/MM/YYYY'), // Store the start date of the current day
                    totalPrice: totalForDay,
                    count: orderCountWeek

                };





                dailyData.push(currentDayData);

            }
            // ___________________________________________________

            for (let i = 0; i < 30; i++) {
                const currentStartDate = moment(endDate)
                    .subtract(i, 'days')
                    .startOf('day')
                    .toDate();
                const currentEndDate = moment(endDate)
                    .subtract(i, 'days')
                    .endOf('day')
                    .toDate();

                // Retrieve data for the current day
                const oneMonthDta = await UserOrder.find({
                    orderDate: {
                        $gte: currentStartDate,
                        $lte: currentEndDate,
                    },
                    status: { $nin: ['cancelled', 'Refund', 'Return', 'cancelled'] }
                })

                let orderCount = oneMonthDta.length;

                const totalForDay = oneMonthDta.reduce((acc, order) => acc + order.totalPrice, 0);



                const currentDayData = {
                    date: moment(currentStartDate).format('DD/MM/YYYY'), // Store the start date of the current day
                    totalPrice: totalForDay,
                    count: orderCount

                };

                monthData.push(currentDayData);

            }
            // ___________________________________________________

            for (let i = 0; i < 12; i++) {
                const currentStartDate = moment(endDate)
                    .subtract(i, 'months')
                    .startOf('month')
                    .toDate();
                const currentEndDate = moment(endDate)
                    .subtract(i, 'months')
                    .endOf('month')
                    .toDate();

                // Retrieve data for the current month
                const monthData = await UserOrder.find({
                    orderDate: {
                        $gte: currentStartDate,
                        $lte: currentEndDate,
                    },
                    status: { $nin: ['cancelled', 'Refund', 'Return', 'cancelled'] }
                });

                let orderCount = monthData.length;

                const totalForMonth = monthData.reduce((acc, order) => acc + order.totalPrice, 0);

                const currentMonthData = {
                    date: moment(currentStartDate).format('DD/MM/YYYY'),
                    totalPrice: totalForMonth,
                    count: orderCount
                };

                yearData.push(currentMonthData);
            }

            for (let i = 0; i <12; i++) {
                const currentStartDate = moment(endDate)
                  .subtract(i, 'hours')
                  .startOf('hours')
                  .toDate();
                const currentEndDate = moment(endDate)
                  .subtract(i, 'hours')
                  .endOf('hours')
                  .toDate();
            
            
            
                // Retrieve data for the current day
                const hourSalesData = await UserOrder.find({
                  orderDate: {
                    $gte: currentStartDate,
                    $lte: currentEndDate,
                  }
                })
            
                let orderCount=hourSalesData.length;
            
                const totalForDay = hourSalesData.reduce((acc, order) => acc + order.totalPrice, 0);
            
            
            
                const currentDayData = {
                  date: moment(currentStartDate).format('HH:mm'), 
                  totalPrice: totalForDay,
                  count:orderCount
            
                };
            
                hourData.push(currentDayData);
                
              }

              console.log(hourData);

            


            res.json({ dailyData, monthData, yearData,hourData});



        } catch (error) {
            console.log("server ERROR - getDashboard ", error);
            return res.json({ error, status: false })
        }


    }),
    pdfReport: asyncHandler(async (req, res) => {
        try {
            const { fromDate, toDate } = req.query;

            const parsedFromDate = new Date(fromDate);
            const parsedToDate = new Date(toDate);
            
            // Use the dates in the query
            const orderDetail = await UserOrder.find({
             status: 'Delivered',
             orderDate: {
               $gte: parsedFromDate,
               $lte: parsedToDate
             }
            }).populate(['items.product', 'shippingAddress']);
            
            const path = './salesReport.pdf'; 
            makePdf(orderDetail,path); 
            setTimeout(() => {
                res.download(path, () => {
                    console.log("send success");
                    // fs.unlinkSync(path); // Delete the file after sending it
                });
            }, 1000);

        } catch (error) {
            console.log("server ERROR - pdfReport ", error);
            return res.render("404page", { error })  
        }



    }),
    excelReport: async (req, res) => {

        // Add Header Row
        worksheet.columns = [
          { header: 'Order ID', key: '_id', width: 30 },
          { header: 'User ID', key: 'userId', width: 30 },
          { header: 'Total Amount', key: 'total', width: 10 },
          { header: 'Payment ID', key: 'paymentId', width: 30 },
          { header: 'Date', key: 'createdAt', width: 30 },
          { header: 'Payment Mode', key: 'paymentMode', width: 15 },
          // Add other headers as needed
        ];

        const { fromDate, toDate } = req.query;

        const parsedFromDate = new Date(fromDate);
        const parsedToDate = new Date(toDate);
        
        // Use the dates in the query
        const result = await UserOrder.find({
         status: 'Delivered',
         orderDate: {
           $gte: parsedFromDate,
           $lte: parsedToDate
         }
        }).populate(['items.product', 'shippingAddress']);
    
    
        // Add Data Rows
        result.forEach(document => {
          worksheet.addRow(document);
        });
    
        // Write to File
    
        workbook.xlsx.writeFile(path.join(__dirname, `../public/Report/SalesData.xlsx`));
        setTimeout(() => {
    
          return res.redirect('/Report/SalesData.xlsx')
        }, 1000)
      },
 







    //====================EDNING OF EXPORT==================
}



