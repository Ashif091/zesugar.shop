let isCartArray = await Cart.find({ 'items.product': productId });

for (let isCart of isCartArray) {
    console.log("CART OK");
    isCart.items.forEach((item) => {
        console.log(item);
        console.log("price",item.product_price,"pricse");
        if (item.product.toString() === productId) {
            isCart.totalQuantity = isCart.totalQuantity-item.quantity;
            isCart.total = isCart.total - item.quantity*item.product_price;
            item.quantity = 0;



        }
    });

    console.log(isCart);

}

await isCartArray.save()




// _________________________________________________________________________________


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