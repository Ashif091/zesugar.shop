const express = require("express");
const { authenticateUser, signupAuthenticateUser, adminAuthenticate, userstatus,checkOutStatus } = require("../middleware/athouction")
const router = express.Router();
const multer = require('multer');
//_____________________usercontroller_____________________
const { login,
  check,
  home,
  logout,
  signup,
  registerpage,
  forgotpassword,
  otpsender,
  confirmotp,
  singupconfirmation,
  page,
  productGET,
  checkpassword, 
  landing} = require("../controllers/userController")
//_____________________cart controller_____________________
const { addToCart,
  getCart,
  cart_add,
  cart_drop,
  productDeleteFromTheCart,
  cartremove_outofstock,
} = require("../controllers/CartControllers")
//_____________________checkout controller_____________________
const {checkOutreq,
   getcheckout,
  cls_removel_msg,
  cls_removel_OUTOFSTOCKmsg,
  razorpay_payment_req,
  confirmOrder,
  orderSuccesspage,
  applyCoupon} = require("../controllers/checkOutController")
//_____________________profile controller_____________________
const { profile,
  imgupload,
  createCode,
  checkCode,
  imgEdit,
  newAddress,
  profileAddress,
  editAddress,
  delete_address,
  orderHistory,
  orderdetails,
  orderCancel,
  getWishlist,
addWishlist,
productDeleteFromTheWishlist,
invoice,
orderdata,
orderReturn} = require("../controllers/profileController")
//_____________________Wallet controller_____________________
const {getWallet,
  } = require("../controllers/walletController")

  // _____________________SEARCH Controller___________________
  const {getSearchPage, getPublicSearchPage,
  } = require("../controllers/searchController")

  // ________________________________________________________


router.route('/login').get(authenticateUser, login).post(check)
router.route("/home").get(userstatus, home)
router.route("/").get(landing)
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

router.route('/getprofile').get(userstatus, profile).post(userstatus, single_upload, imgupload).patch(userstatus, single_upload, imgEdit)
router.route('/referralCode').get(createCode).post(checkCode)
router.route('/getprofile_address').get(userstatus,profileAddress).post(newAddress)
router.route('/edit_address').put(userstatus,editAddress)
router.route('/edit_address/:id').delete(userstatus,delete_address)
router.route('/getprofile_order').get(userstatus,orderHistory)
router.route('/orderdetails/:id').get(userstatus,orderdetails)

router.route('/invoice').get(userstatus,invoice)

router.route('/myWishlist').get(userstatus,getWishlist).post(addWishlist).delete(productDeleteFromTheWishlist)


//============CHECK OUT ===========
router.route('/checkOutreq').get(userstatus, checkOutreq)

router.route('/getcheckout').get(userstatus,checkOutStatus, getcheckout)
router.route('/cls_removel_msg-checkout').get(userstatus,cls_removel_msg)
router.route('/cls_removel_OUTOFSTOCKmsg').get(cls_removel_OUTOFSTOCKmsg)
router.route('/razorpay_payment_req').post(userstatus,razorpay_payment_req)
router.route('/confirmOrder').post(userstatus,confirmOrder)
router.route('/orderSuccess/:id').get(userstatus,orderSuccesspage)
router.route('/orderCancel/:id').get(userstatus,orderCancel)
router.route('/orderReturn').post(orderReturn)
router.route('/applyCoupon').post(applyCoupon)

//================== Wallet =====================

router.route('/getprofile_wallet').get(userstatus,getWallet)


//=================SEARCH PAGE======================


router.route('/search').get(userstatus,getSearchPage)
router.route('/search_public').get(getPublicSearchPage)


//=================================================





module.exports = router;