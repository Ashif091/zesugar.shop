const express = require("express");
const { authenticateUser, signupAuthenticateUser, adminAuthenticate, userstatus } = require("../middleware/athouction")
const router = express.Router();
const multer = require('multer');
const { login,
    check,
    home,
    logout,
    signup,
    registerpage,
    forgotpassword,
    otpsender,
    confirmotp,
    confimpassword,
    singupconfirmation,
    page,
    productGET,
    checkpassword } = require("../controllers/userController")
const { addToCart,
    getCart,
    cart_add,
    cart_drop,
    productDeleteFromTheCart,
    cartremove_outofstock,
} = require("../controllers/CartControllers")
const { getcheckout,

    cls_removel_msg, } = require("../controllers/checkOutController")

const {profile,
    imgupload,
    imgEdit,
        
      }= require("../controllers/profileController")


router.route('/login').get(authenticateUser, login).post(check)
router.route("/").get(userstatus, home)
router.route("/logout").get(logout)
router.route("/signup").get(signupAuthenticateUser, registerpage).post(signup)
router.route("/forgotpassword").get(forgotpassword).post(otpsender)
router.route("/singupconfirmation").get(singupconfirmation)
router.route("/confirmotp").get(confirmotp)
router.route("/checkpassword").post(checkpassword)
//===============PRODUCT=================
router.route('/product').get(page)
router.route('/products/:id').get(userstatus, productGET)
// ===========CART===========
router.route('/productaddtocart/:id').get(userstatus, addToCart)
router.route('/cart').get(userstatus, getCart)
router.route('/cart_add/:id').get(userstatus, cart_add)
router.route('/cart_drop/:id').get(userstatus, cart_drop)
router.route('/cartremove_outofstock').get(userstatus, cartremove_outofstock)
router.route('/cart_delete/:id').get(userstatus, productDeleteFromTheCart)
//=========profile================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    },
  });
  const single_upload = multer({ storage: storage }).single('image');

router.route('/getprofile').get(userstatus,profile).post(userstatus,single_upload,imgupload).patch(userstatus,single_upload,imgEdit)
//============CHECK OUT ===========
router.route('/getcheckout').get(userstatus, getcheckout)
router.route('/cls_removel_msg-checkout').get(cls_removel_msg)






module.exports = router;