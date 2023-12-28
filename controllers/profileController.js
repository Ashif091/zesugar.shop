const userdata = require("../models/userModel");
const addressCollections = require("../models/addressModel");
const UserOrder = require("../models/orderModel");
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');



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
       
            const orderData = await UserOrder.find({ userId: userData._id })
                .sort({ orderDate: -1 }) 
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .populate(['items.product', 'shippingAddress']);
       
            return res.render("./userSide/profileOrders", {
                user,
                userData,
                orderData,
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

            orderdata.status = 'cancelled';
            orderdata.balance_amount = 'Refund';
            orderdata.paymentMethod = 'Successful';
            await orderdata.save();
            //cart upadate 


            const orderDetail = await UserOrder.findById(orderid).populate(['items.product', 'shippingAddress']);

            return res.render("./userSide/orderDetailPage", { user, userData, orderDetail })

        } catch (error) {
            console.log(`server Error with (edit Address DELETE)${error} `);
            return res.render("404page", { error })
        }
    },





};