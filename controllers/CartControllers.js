const Cart = require('../models/cartSchema');
const users = require("../models/userModel")
const product = require("../models/productSchema")


module.exports = {
    addToCart: async (req, res) => {
        console.log("add to cart");
        const productId = req.params.id;
        let user = req.session.username;
        console.log("add to id", productId);

        try {
            let userData = await users.findById(user._id);
            if (!userData) {
                return res.redirect('/');
            }

            const productData = await product.findOne({ _id: productId });

            let userCart = await Cart.findOne({ userId: userData._id });
            if (!userCart) {
                console.log('no cart');
                // =================================
                let value = 1;
                console.log(productData.product_status);
                if (productData.product_status === false) {
                    value = 0;
                }
                // =================================
                userCart = new Cart({
                    userId: userData._id,
                    items: [
                        {
                            product: productId,
                            quantity: value,
                            product_price: productData.product_price,
                        },
                    ],

                    total: productData.product_price * value,
                    totalQuantity: value,
                });
                await userCart.save();

            } else {
                // =================================
                console.log("ADDING......................");
                let value = 1;
                console.log(productData.product_status);
                console.log(`serching id ${productId}`);
                if (productData.product_status === false) {
                    value = 0;
                } else {
                    value = 1;
                }
                // =================================
                // userCart.items.push({
                //     product: productId,
                //     quantity: value,
                //     product_price: productData.product_price,
                // });
                // if(value== 1){
                //     userCart.total += productData.product_price;
                //     userCart.totalQuantity += 1;
                // }
                await Cart.updateOne(
                    { userId: userData._id },
                    {
                        $push: { items: { product: productId, quantity: value, product_price: productData.product_price } }

                    }
                )

                if (value == 1) {
                    let cartdata = await Cart.findOne({ userId: userData._id });
                    const productIn_items = cartdata.items.find(
                        (item) => item.product.toString() === productId,
                    );
                    console.log(`product st true ?:id ${productIn_items.product}`);


                    cartdata.total += productIn_items.product_price;
                    cartdata.totalQuantity += 1;
                    await cartdata.save();

                }



            }

            console.log("data saved");


            let data = productId;
            console.log("res send ", data);

            res.json(data);
        } catch (error) {
            console.error('Error adding product to cart:', error);
            return res.status(500).send('Internal Server Error');
        }
    }
    ,
    getCart: async (req, res) => {
        console.log("get cart");
        const user = req.session.username;

        try {
            let userData = await users.findById(user._id);
            if (!userData) {
                return res.redirect('/');
            }

            let isCart = await Cart.findOne({ userId: userData._id })
            if (isCart) {
                let productIds = isCart.items.map(product => product.product);
                console.log(productIds);
                let cart_items = isCart.items.map(product => product);
                console.log(cart_items);

                const products_data = await product.find({
                    _id: {
                        $in: productIds.map(id => id)
                    }
                }).sort({ _id: -1 });

                let outOfStock = 0;
                cart_items.forEach((items)=>{
                   if (items.quantity==0) {
                    outOfStock++;
                   }
                })





                return res.render("cartPage", { userData, isCart, products_data, cart_items,outOfStock})
            } else {
                isCart = []
                let products_data = []
                let cart_items = []

                return res.render("cartPage", { userData, isCart, products_data, cart_items })
            }


        } catch (error) {
            console.error('Error adding product to cart:', error);
            return res.status(500).send('Internal Server Error');
        }
    }
    ,
    // ======add qty======
    cart_add: async (req, res) => {
        console.log("get cart_add");
        console.log("get cart_drop id ", req.params.id);
        let user = req.session.username;
        let id = req.params.id

        try {
            let userData = await users.findById(user._id);
            if (!userData) {
                return res.redirect('/');
            }

            const isCart = await Cart.findOne({ userId: userData._id })
            const productIn_items = isCart.items.find(
                item => item._id.toString() === id,
            );
            console.log(`data flow ${productIn_items}`);
            productIn_items.quantity += 1;
            isCart.total += productIn_items.product_price;
            isCart.totalQuantity += 1;
            let save = await isCart.save()
            if (save) {
                let data = { productIn_items, isCart };
                res.json(data);
            } else {
                let data = { error: "error with saving" };
                res.json(data);
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
            return res.status(500).send('Internal Server Error');
        }
    }
    ,
    cart_drop: async (req, res) => {
        console.log("get cart_drop id ", req.params.id);
        let user = req.session.username;
        let id = req.params.id

        try {
            let userData = await users.findById(user._id);
            if (!userData) {
                return res.redirect('/');
            }

            const isCart = await Cart.findOne({ userId: userData._id })
            const productIn_items = isCart.items.find(
                item => item._id.toString() === id,
            );
            console.log(`data flow ${productIn_items}`);
            productIn_items.quantity -= 1;
            isCart.total -= productIn_items.product_price;
            isCart.totalQuantity -= 1;
            let save = await isCart.save()
            if (save) {
                let data = { productIn_items, isCart };
                res.json(data);
            } else {
                let data = { error: "error with saving" };
                res.json(data);
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
            return res.status(500).send('Internal Server Error');
        }
    }
    ,
    productDeleteFromTheCart: async (req, res) => {
        let user = req.session.username;
        let id = req.params.id
        console.log(`get the delete req ${id}`);

        try {
            let userData = await users.findById(user._id);
            if (!userData) {
                return res.redirect('/');
            }
            const cart = await Cart.findOne({ userId: userData._id });
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            const productInCart = cart.items.find(
                item => item._id.toString() === id,
            );

            console.log('data is', productInCart);
            await Cart.findOneAndUpdate(
                { userId: userData._id },
                { $pull: { items: { _id: id } } }
            )



            // cart.items.splice(productInCart, 1);
            // console.log('data id of product',productInCart.product );
            // console.log('price of data',productInCart.product_price );
            cart.total -= productInCart.product_price * productInCart.quantity;
            cart.totalQuantity -= productInCart.quantity;


            cart.save();

            let data = { productInCart, cart };
            res.json(data);

        } catch (error) {
            console.log(error);
        }
    }
    ,
    cartremove_outofstock: async (req, res) => {
        console.log("GET req 'cartremove_outofstock'");
        try {
            const userid = req.session.username._id
            if (!userid) {
                res.redirect("/");
            }
            // get cart from data base
            let cartitems = await Cart.findOne({ userId: userid });
            
            let cart = await Cart.updateOne({ userId: userid }, { $pull: { items: { quantity: 0 } } });

            let removeditems = cartitems.items
            let removedCount = removeditems.filter(item => item.quantity === 0).length
            if(cart && removedCount){
                req.session.removedCount=removedCount
                res.status(202).json({cart,removedCount,status:true})

            }else{
                res.status(202).json({status:false})
                
            }

            
        } catch (error) {
            console.log(`server crash......due to cartremove_outofstock ${error}`);
            res.status(404).render("404page",{error})
        }
    }




};





