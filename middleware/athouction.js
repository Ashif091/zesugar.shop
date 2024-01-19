const users = require("../models/userModel")
module.exports = {

    authenticateUser: (req, res, next) => {
        if (req.session.username) {
            next();
        }
        else {
            res.render('login.ejs', { errmsg: "" })
        }
    },
    signupAuthenticateUser: (req, res, next) => {
        if (req.session.username) {
            next();
        }
        else {
            return res.render("signup.ejs", { errmsg: "" })
        }
    }
    ,
    adminAuthenticate: (req, res, next) => {
        if (req.session.admin) {
            next();
        }
        else {
            res.render('admin.ejs', { errmsg: "" })
        }
    }
    ,
    userstatus: async (req, res, next) => {
        console.log("req get for home");


        try {
            if(req.session.username){
                let data = req.session.username
                let user = await users.findOne({"email":data.email})
                if (user.user == 1) {
                 req.session.data=user
    
                    next();
                }
                else {
                    return res.status(202).render("login.ejs", { errmsg: "Sorry  you are banned" })
                }  
            }else{
                return res.status(202).render("login.ejs", { errmsg: "" }) 
            }
            
        } catch (err) {
            console.error(err);
            return res.status(202).render("login.ejs", { errmsg: "please login again " })
        }
    },
    checkOutStatus: (req, res, next) => {
        if (req.session.checkPage) {
            next();
        }
        else {
            res.redirect("/cart")
        }
    }

}

