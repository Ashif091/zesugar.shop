const users = require("../models/userModel")
const product = require("../models/productModel")
const Cart = require('../models/cartModel');
const category = require("../models/categoryModel")
const asyncHandler = require("express-async-handler")
const fs = require('fs');
const path = require('path');

const bcrypt = require("bcrypt")

const addressCollections = require("../models/addressModel");
const UserOrder = require("../models/orderModel");

module.exports = {


    admincheck: asyncHandler(async (req, res) => {

        const { email, password } = req.body
        if (!email || !password) {
            res.status(400).render("admin.ejs", { errmsg: "email and password are needed" })
        }
        const admindata = { email: "admin@gmail.com", password: "$2b$10$SssWwngf/45KrjTokeXvMOEKQ7WtI1xld218JX22eIVz7CUE09Xnm" }
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
        return res.redirect("/admin")



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

            let result = await category.aggregate([{ $group: { _id: "$category_name" } }, { $project: { _id: 1 } }])

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



            const productdata = {
                product_name: productname,
                product_description: description,
                product_price: productprice,
                product_category: category,
                product_qty: quantity,

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
            quantity,
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
                category_qty: parseInt(quantity),
                category_image_url: imagePath,

            })

            if (categorydata) {
                console.log("data will be saved in db");
            }
            res.redirect('back');

        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    editcategory: async (req, res) => {
        console.log("product  is start to edit ", req.body);
        const {
            categoryname,
            description,
            quantity,
            categoryid,
        } = req.body;

        try {



            const categorydata = {
                category_name: categoryname,
                category_description: description,
                category_qty: quantity,

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
        console.log("The status upadation starting... ", req.body);
        let productId = req.body.id
        let msg = 'error'
        let current_st;
        try {
            const doc = await product.findById(productId);
            console.log('data base connecter');

            if (req.body.current_status === 'true') {
                doc.set('product_status', false);
                msg = "unlist"
                current_st = false;
                // ====================================================
                try {
                    const isCart = await Cart.findOne({})
                    const productInCart = isCart.items.find(
                        item => item.product.toString() === productId,
                    );
                    console.log(isCart._id);
                    console.log(productInCart);
                    await Cart.findOneAndUpdate(
                        { 'items': { '$elemMatch': { 'product': productId } } },
                        { '$set': { 'items.$.quantity': 0 } },
                        { 'multi': true }
                    )
                    isCart.total -= productInCart.product_price * productInCart.quantity;
                    isCart.totalQuantity -= productInCart.quantity;
                    await isCart.save()

                } catch (error) {
                    console.log(`error with cart line 576 ${error}`);

                }

                // ===================================================
            } else {
                doc.set('product_status', true);
                // ====================================================
                try {
                    const isCart = await Cart.findOne({})
                    const productInCart = isCart.items.find(
                        item => item.product.toString() === productId,
                    );
                    console.log(isCart._id);
                    console.log(productInCart);
                    await Cart.findOneAndUpdate(
                        { 'items': { '$elemMatch': { 'product': productId } } },
                        { '$set': { 'items.$.quantity': 1 } },
                        { 'multi': true }
                    )
                    isCart.total += productInCart.product_price;
                    isCart.totalQuantity += 1;
                    await isCart.save()

                } catch (error) {
                    console.log(`error with cart line 576 ${error}`);

                }

                // ===================================================
                msg = "list"
                current_st = true;
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


            const ITEMS_PER_PAGE = 4; // Define the number of items per page
            const page = +req.query.page || 1; // Get the current page number

            const totalOrders = await UserOrder.countDocuments();
            const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
            const totalCheckedOrders = await UserOrder.countDocuments({ check_status: true });

            const orderData = await UserOrder.find()
                .sort({ check_status: -1, orderDate: -1 }) 
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
            }else if(orderData.status == "Shipped"){
                orderStatus = "Out For Delivery";
            }else if(orderData.status == "Out For Delivery"){
                orderStatus = "Delivered";
            }
            orderData.status=orderStatus;
            orderData.check_status=false;

            await orderData.save()
            console.log({status:true,msg:"",orderStatus,totalCheckedOrders});
            res.json({status:true,msg:"",orderStatus,totalCheckedOrders})



        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            res.json({status:false,msg:"server Error",orderStatus})
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
    






    //====================EDNING OF EXPORT==================
}



