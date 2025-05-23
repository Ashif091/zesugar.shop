const users = require("../models/userModel")
const OTP = require("../models/otpModel")
const asyncHandler = require("express-async-handler")
const nodemailer = require('nodemailer')
const bcrypt = require("bcrypt")
const Cart = require('../models/cartModel');
const wishlist = require("../models/wishlistModel");

// ================
const product = require("../models/productModel")
const category = require("../models/categoryModel")
// ============
module.exports = {
    login: ((req, res) => {

        try {
            res.status(208).redirect('/home');
        } catch (error) {
            console.log("server ERROR - page ", error);
            return res.render("404page", { error })
        }
    }),
    home: (async (req, res) => {
        try {
            const user = req.session.username;
            if (!user) {
                res.status(208).redirect('/');
            }
            let userData = await users.findById(user._id);
            // let categorylist = await category.aggregate([{ $lookup: { from: "products", localField: "category_name", foreignField: "product_category", as: "product_data" } }]).populate(['category_offer']);
            let categorylist = await category.aggregate([
                {
                    $lookup: {
                        from: "products",
                        localField: "category_name",
                        foreignField: "product_category",
                        as: "product_data"
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "category_offer",
                        foreignField: "_id",
                        as: "category_offer"
                    }
                }
            ]);

            let productlist = await product.find({})


            res.status(201).render("home.ejs", { userData, categorylist, productlist })

        } catch (error) {
            console.log("server ERROR - page ", error);
            return res.render("404page", { error })
        }

    }),
    landing: (async (req, res) => {
        try {
            let categorylist = await category.aggregate([
                {
                    $lookup: {
                        from: "products",
                        localField: "category_name",
                        foreignField: "product_category",
                        as: "product_data"
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "category_offer",
                        foreignField: "_id",
                        as: "category_offer"
                    }
                }
            ]);

            let productlist = await product.find({})


            res.status(201).render("landing.ejs", {categorylist, productlist })

        } catch (error) {
            console.log("server ERROR - page ", error);
            return res.render("404page", { error })
        }

    })
    ,
    registerpage: (async (req, res) => {
        try {
            const user = req.session.username;
            if (!user) {
                res.status(208).redirect('/');
            }
            let userData = await users.findById(user._id);
            let categorylist = await category.aggregate([{ $lookup: { from: "products", localField: "category_name", foreignField: "product_category", as: "product_data" } }]);

            let productlist = await product.find({})

            res.status(201).render("home.ejs", { userData, categorylist, productlist })
        } catch (error) {
            console.log("server ERROR - page ", error);
            return res.render("404page", { error })
        }


    })
    ,
    signup: asyncHandler(async (req, res) => {
        console.log("processing.. singup post");

        // =========original post===========
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).render("signup.ejs", { errmsg: "please fill all data" })
        }
        const userAvailability = await users.findOne({ email });
        if (userAvailability) {
            res.status(400).render("signup.ejs", { errmsg: "user already exist" })
        }
        //=========================
        req.session.signup_data = { name, email, password }
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fhyvhh091@gmail.com',
                pass: process.env.EMAIL_PASSWORD
            }
        });

        let otp = Math.random();
        otp = otp * 1000000;
        otp = parseInt(otp);

        let mailOptions = {
            from: 'fhyvhh091@gmail.com',
            to: email,
            subject: 'Welcome ZESUGAR PISTORS ',
            text: `Your OTP is: ${otp}`
        };
        console.log("connection otp ");
        // =========otp saving ...   
        try {
            const newOTP = new OTP({
                email,
                otp,
                createdAt: Date.now(),
            });

            await newOTP.save()

            console.log("saving... ", otp);


        } catch (err) {
            const otptime = await OTP.findOne({ email })
            const time = parseInt(60 - ((Date.now() - otptime.createdAt) / 1000))
            if (time >= 0) {
                res.render("confirmation_singup.ejs", { email, errmsg: "you have already a OTP", msg: ``, time })

            }

        }
        //=====sending...
        console.log("otp saved in db")
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                let time = 60;
                res.render("confirmation_singup.ejs", { email, errmsg: "", msg: `OTP succsesfully sented to ${email}`, time })
            }
        });




        //======================




    })


    ,
    check: asyncHandler(async (req, res) => {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                res.status(400).render("login.ejs", { errmsg: "emal and password are needed" })
            }
            const userCheck = await users.findOne({ email, user: 1 })
            if (userCheck) {
                const verify = await bcrypt.compare(password, userCheck.password)
                if (!verify) {
                    res.status(404).render("login.ejs", { errmsg: "password is wrong" })
                }
            }
            else {
                return res.status(404).render("login.ejs", { errmsg: "this user-Email does not exist " })
            }
            console.log(`${userCheck.name} entered`);
            req.session.username = userCheck
            return res.redirect("/home")
        } catch (error) {
            console.log("server ERROR - page ", error);
            return res.render("404page", { error })
        }





    }),
    forgotpassword: (async (req, res) => {
        try {
            let email = req.query.email;

            res.render("otppage.ejs", { email, errmsg: "", msg: "" })
        } catch (error) {
            console.log("server ERROR - page ", error);
            return res.render("404page", { error })
        }


    })
    ,
    otpsender: (async (req, res) => {
        console.log("processing");
        let email = req.body.email;


        const userCheck = await users.findOne({ email })
        if (!userCheck) {
            return res.status(400).render("otppage.ejs", { email, errmsg: "the email is wrong", msg: "" })
        }


        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fhyvhh091@gmail.com',
                pass: process.env.EMAIL_PASSWORD
            }
        });

        //   =================send=======================
        let otp = Math.random();
        otp = otp * 1000000;
        otp = parseInt(otp);

        let mailOptions = {
            from: 'fhyvhh091@gmail.com',
            to: email,
            subject: 'OTP for password reset',
            text: `Your OTP is: ${otp}`
        };
        console.log("connection otp ");

        try {
            const newOTP = new OTP({
                email,
                otp,
                createdAt: Date.now(),
            });

            await newOTP.save()

            console.log("saving... ", otp);


        } catch (err) {
            const otptime = await OTP.findOne({ email })
            const time = parseInt(60 - ((Date.now() - otptime.createdAt) / 1000))
            if (time >= 0) {
                res.render("otpsendpage.ejs", { email, errmsg: "you have already a OTP", msg: ``, time })

            }

        }

        //  await userCheck.createIndex({ createdAt: 1 }, { expireAfterSeconds: 10 });

        console.log("otp saved in db")
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                let time = 60;
                res.render("otpsendpage.ejs", { email, errmsg: "", msg: `OTP succsesfully sented to ${email}`, time })
            }
        });

    })
    ,
    confirmotp: (async (req, res) => {
        console.log("got requst");
        let { email, otp } = req.query

        try {
            const otp_db = await OTP.findOne({ email })

            if (!otp_db) {
                res.render("otpsendpage.ejs", { email, errmsg: "now your otp is invalid send again", msg: ``, time })
            }
            console.log("data from data base", otp_db)

            otp = parseInt(otp)
            console.log(otp, typeof (otp))

            if ((otp == otp_db.otp)) {
                console.log("password is  match");
                res.status(200).render("password.ejs", { errmsg: "", email })



            } else {
                console.log("password is not match")
                const otptime = await OTP.findOne({ email })
                const time = parseInt(60 - ((Date.now() - otptime.createdAt) / 1000))
                if (time >= 0) {
                    res.render("otpsendpage.ejs", { email, errmsg: "OTP is Wrong", msg: ``, time })

                }

            }
        } catch (err) {

            return res.render("404page", { error: err })

        }




    })

    ,
    confimpassword: ((req, res) => {
        try {
            res.status(200).render("password.ejs", { errmsg: "", email: "" })
        } catch (error) {
            console.log("server ERROR - confimpassword ", error);
            return res.render("404page", { error })
        }


    }),
    checkpassword: (async (req, res) => {
        console.log("password checking ");

        let { password, cpassword, email } = req.body;


        try {
            password = await bcrypt.hash(password, 10);
            const userCheck = await users.findOne({ email })
            userCheck.password = password
            await userCheck.save()
            console.log(userCheck.name, "password changed");
            res.status(208).redirect("/login")

        } catch (err) {
            console.log("err in  data base ")
            res.status(200).render("password.ejs", { errmsg: "error with data", email })


        }





    })
    ,


    logout: ((req, res) => {
        try {
            req.session.destroy();
            res.redirect('/');

        } catch (error) {
            console.log(`error with logout ${error}`);
            return res.render("404page", { error })

        }

    })

    ,
    singupconfirmation: (async (req, res) => {
        console.log("got requst");
        let { email, otp } = req.query

        try {
            const otp_db = await OTP.findOne({ email })

            if (!otp_db) {
                res.render("otpsendpage.ejs", { email, errmsg: "now your otp is invalid send again", msg: ``, time })
            }
            console.log("data from data base", otp_db)

            otp = parseInt(otp)

            if ((otp == otp_db.otp)) {
                console.log('otp is match');
                let { name, password } = req.session.signup_data


                const hashedPassword = await bcrypt.hash(password, 10);
                const newUser = await users.create({
                    name,
                    email,
                    password: hashedPassword,
                    user: 1,
                })
                let data = await users.findOne({ "email": email })
                if (newUser) {
                    console.log("new user created")
                }
                req.session.username = data;
                res.status(208).redirect("/signup")


            } else {
                console.log("password is not match")
                const otptime = await OTP.findOne({ email })
                const time = parseInt(60 - ((Date.now() - otptime.createdAt) / 1000))
                if (time >= 0) {
                    res.render("otpsendpage.ejs", { email, errmsg: "OTP is Wrong", msg: ``, time })

                }

            }
        } catch (err) {
            console.log("server ERROR - page ", err);
            return res.render("404page", { error: err })

        }




    })

    ,
    page: ((req, res) => {
        try {
            let productdata = {
                _id: "cxcxccxc"
            }
            res.render("product_detail_page ", { name: "ashif", productdata });
        } catch (error) {
            console.log("server ERROR - page ", error);
            return res.render("404page", { error })
        }

    })
    ,
    productGET: (async (req, res) => {
        console.log('req is get');
        try {
            const productId = req.params.id;
            const user = req.session.username;
            if (!user) {
                res.status(208).redirect('/');
            }
            let userData = await users.findById(user._id);
            console.log(`id is ${productId}`);

            let userCart = await Cart.findOne({ userId: user._id });
            let userWishlist = await wishlist.findOne({ userId: userData._id });
            let wishlistStatus = false;
            if (userWishlist) {
                wishlistStatus = userWishlist.items.some(item => item.product.toString() === productId);
            }
            let productdata = await product.findById(productId).populate(['offer', 'category_offer']);
            if (userCart) {
                let cartstatus = userCart.items.map(item => item.product.toString());
                res.render("product_detail_page ", { userData, productdata, cartstatus, productId, wishlistStatus });
            } else {
                let cartstatus = []
                res.render("product_detail_page ", { userData, productdata, cartstatus, productId, wishlistStatus });
            }

        } catch (error) {
            console.log(`server have trouble ${error}`);
        }

    }),







}

