const userdata = require("../models/userModel");
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');



module.exports = {
    profile: async (req, res) => {
        try {
            const user = req.session.username;
            if(!user){
             res.status(208).redirect('/');
            }
            let userData = await userdata.findById(user._id);
            const imgUrl = userData.imagePath
            if (imgUrl) {
                console.log("hi",userData);
                return res.render("./userSide/profilePage", { imgUrl,user,userData})
            } else {
                return res.render("./userSide/profilePage", { imgUrl: false,user,userData})
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


};