const userdata = require("../models/userModel");
const UserOrder = require("../models/orderModel");
const Wallet = require("../models/walletModel");


module.exports = {
    getWallet: async (req, res) => {
        try {
            const user = req.session.username;
            if (!user) {
                res.status(208).redirect('/');
            }
            let userData = await userdata.findById(user._id);
            let userWallet = await Wallet.findOne({ userId: userData._id })
            .sort({ 'transactions.date': -1 })  // Use an object for sorting
            .populate(['userId']);
            userWallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            return res.render("./userSide/wallet", { user, userData,userWallet})

        } catch (error) {
            console.log(`server Error with (profile GET) `);
            return res.render("404page", { error })
        }

    },




};