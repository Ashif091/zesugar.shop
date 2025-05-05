const userdata = require("../models/userModel");
const product = require("../models/productModel")


module.exports = {


    getSearchPage: async (req, res) => {
        console.log("req getSearch ");
        try {
            const user = req.session.username;
            const searchData = req.query.q;
            const priceFlow = req.query.pf;
            let priceRange = req.query.pr;
            let maxProductPrice = req.query.mp;
            let checkedCategories = req.query.cc;


            if (!user) {
                res.status(208).redirect('/');
            }
            const userData = await userdata.findById(user._id);

            let regex = new RegExp(searchData, 'i');

            let productlist = await product.find({
                $or: [
                    { product_name: regex },
                    { product_category: regex }
                ]
            })
            
            if(productlist.length===0){
                return res.render("./userSide/zeroSearchPage", {
                    user,
                    userData,
                    searchData,
                });
            }

            const Categories = [...new Set(productlist.map(product => product.product_category))];
            let priceSort = '';
            if (priceFlow) {
                if (priceFlow === 'low') {
                    productlist.sort((a, b) => a.product_price - b.product_price);
                    priceSort = 'low';
                } else if (priceFlow === 'high') {
                    productlist.sort((a, b) => b.product_price - a.product_price);
                    priceSort = 'high';
                }
            }
            if (priceRange) {
                productlist = productlist.filter(product => product.product_price <= priceRange);
            }
            // maximum price rage set
            if (!maxProductPrice) {
                maxProductPrice = Math.max(...productlist.map(product => product.product_price));
            }
            if (!priceRange) {
                priceRange = maxProductPrice;
            }
            // Convert checkedCategories string into an array
            let checkedCategoriesArray = Categories;
            if (checkedCategories) {
                checkedCategoriesArray = checkedCategories ? checkedCategories.split(',') : [];
                productlist = productlist.filter(product => checkedCategoriesArray.includes(product.product_category));
            }
            productlist.sort((a, b) => b.product_status - a.product_status);
            return res.render("./userSide/searchPage", {
                user,
                userData,
                searchData,
                productlist,
                priceSort,
                priceRange,
                maxProductPrice,
                Categories,
                checkedCategoriesArray,
            });

        } catch (error) {
            console.log(`server Error with (getSearchPage GET) ${error}`);
            return res.render("404page", { error });
        }
    },
    getPublicSearchPage: async (req, res) => {
        console.log("req getSearch ");
        try {
            const searchData = req.query.q;
            const priceFlow = req.query.pf;
            let priceRange = req.query.pr;
            let maxProductPrice = req.query.mp;
            let checkedCategories = req.query.cc;


            let regex = new RegExp(searchData, 'i');

            let productlist = await product.find({
                $or: [
                    { product_name: regex },
                    { product_category: regex }
                ]
            })
            
            if(productlist.length===0){
                return res.render("./userSide/zeroPublicSearchPage", {
                    searchData,
                });
            }

            const Categories = [...new Set(productlist.map(product => product.product_category))];
            let priceSort = '';
            if (priceFlow) {
                if (priceFlow === 'low') {
                    productlist.sort((a, b) => a.product_price - b.product_price);
                    priceSort = 'low';
                } else if (priceFlow === 'high') {
                    productlist.sort((a, b) => b.product_price - a.product_price);
                    priceSort = 'high';
                }
            }
            if (priceRange) {
                productlist = productlist.filter(product => product.product_price <= priceRange);
            }
            // maximum price rage set
            if (!maxProductPrice) {
                maxProductPrice = Math.max(...productlist.map(product => product.product_price));
            }
            if (!priceRange) {
                priceRange = maxProductPrice;
            }
            // Convert checkedCategories string into an array
            let checkedCategoriesArray = Categories;
            if (checkedCategories) {
                checkedCategoriesArray = checkedCategories ? checkedCategories.split(',') : [];
                productlist = productlist.filter(product => checkedCategoriesArray.includes(product.product_category));
            }
            productlist.sort((a, b) => b.product_status - a.product_status);
            return res.render("./userSide/publicSearchPage", {
                searchData,
                productlist,
                priceSort,
                priceRange,
                maxProductPrice,
                Categories,
                checkedCategoriesArray,
            });

        } catch (error) {
            console.log(`server Error with (getSearchPage GET) ${error}`);
            return res.render("404page", { error });
        }
    },






};