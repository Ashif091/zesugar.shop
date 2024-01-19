const express = require("express");
const {adminAuthenticate} = require("../middleware/athouction")
const router = express.Router();
const multer = require('multer');

// multer

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    },
  });

  
  const upload = multer({ storage: storage });
  

const {logout,
    usercls,
    updateuser,
    createuser,
    search,
    admincheck,
    usermanagement,
    userstatus,
    createProduct,
    createProductDisplay,
    productmangement,
    check,
    deleteData,
    editProduct,
    categoryGET,
    categoryPOST,
    editcategory,
    productstatus,
    deletecategory,
    ordermanagement,
    orderStatusUpdate,
    orderStatusSelect,
    orderdetails,
    orderReturn,
    offermanagement,
    offerDetails,
    addOffer,
    removeOffer,
    couponManagement,
    addcoupon,
    removeCoupon,
    productAvailability,
    couponAvailability,
    categorynameAvailability,
    offermanagementCategory,
    offerCategoryDetails,
    addCategoryOffer,
    removeCategoryOffer,
    getDashboard,
    chartData,
    pdfReport,
    excelReport,
}=require("../controllers/adminController")
router.route("/logout").get(logout)
router.route("/").get( adminAuthenticate,getDashboard).post(admincheck)

// _______________________Dashboard___________________________-    

router.route('/adminDashboard').get(adminAuthenticate,getDashboard).post(chartData)
router.route('/getPdf').get(adminAuthenticate,pdfReport)
router.route('/getExel').get(adminAuthenticate,excelReport)


// ___________________User Management_______________________-    

router.route('/usermanagement').get(adminAuthenticate,usermanagement).post(userstatus)
router.route("/usermanagement/search").get(search)
router.route("/usermanagementcreate").post(createuser)
router.route("/usermanagement/:userId").put(updateuser).delete(usercls)

//_____________________product Management__________________

router.route('/productmangement').get(adminAuthenticate,productmangement).post(upload.array('image', 4),createProduct )
router.route('/productmangement/edit').get(productmangement).post(editProduct)
router.route('/deleteProduct/:id').delete(deleteData)
router.route('/productstatus').post(productstatus)
router.route('/img_edit').get(productmangement).post(upload.array('image', 4),check )
router.route('/productAvailability').post(productAvailability)


// ______________check__________________
router.route("/check").post(check)


// _____________________category_admin_management________________________

const single_upload = multer({ storage: storage }).single('image');


router.route("/categorymanagement").get(adminAuthenticate,categoryGET).post(single_upload,categoryPOST)
router.route('/categorymanagement/edit').get(categoryGET).post(editcategory)
router.route('/deletecategory/:id').delete(deletecategory)
router.route('/categorynameAvailability').post(categorynameAvailability)


// _____________________orderManagment_admin_management________________________

router.route("/ordermanagement").get(adminAuthenticate,ordermanagement).patch(orderStatusUpdate)
router.route("/orderdetails").get(orderdetails).patch(orderStatusSelect)
router.route("/orderReturn").post(orderReturn)

// _____________________offermanagement_admin_management________________________


router.route("/offermanagement/product").get(adminAuthenticate,offermanagement)
router.route("/offerdetails/product").get(offerDetails).post(addOffer).delete(removeOffer)

router.route("/offermanagement/category").get(adminAuthenticate,offermanagementCategory)
router.route("/offerdetails/category").get(offerCategoryDetails).post(addCategoryOffer).delete(removeCategoryOffer)


// _____________________couponmanagement_admin_management________________________
router.route("/couponmanagement").get(adminAuthenticate,couponManagement).post(addcoupon).delete(removeCoupon);
router.route('/couponAvailability').post(couponAvailability)




 
module.exports=router;