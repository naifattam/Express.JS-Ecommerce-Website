const express = require("express")
const router = express.Router()
const Product = require("../models/product")
const User = require("../models/user")
const Order = require("../models/order")

const cart = [

]

router.get("/", async (req, res) => {
    const data = await Product.find()
    res.render("index", {title: "Main Page", data: data})
})
router.get("/add", (req, res) => {
    if(req.session.admin) {
        res.redirect("/user/admin/dashboard")
    }
    else {
        const name = req.query.prod_name
        const price = parseInt(req.query.prod_price) * parseInt(req.query.quantity)
        const quantity = parseInt(req.query.quantity)
        let data = {
            name: name,
            price: price,
            quantity: quantity
        }

        let check = () => {
            for(let i = 0; i < cart.length; i++) {
                if(data.name == cart[i].name) {
                    return true
                }
            }
        }

        if(check() == true) {
            req.flash("warning", "Product Already Added In Your Cart")
            res.redirect("/")
        }
        else {
            cart.push(data)
            res.redirect("/cart")
        }
    }
    
})
router.get("/remove", (req, res) => {
    if(req.session.admin) {
        res.redirect("/user/admin/dashboard")
    }
    else {
        let data = {
            name: req.query.name,
            price: parseInt(req.query.price)
        }
    
        const check = () => {
            for(let i = 0; i < cart.length; i++) {
                if(cart[i].name == data.name) {
                    cart.splice(i, 1)
                    res.redirect("/cart")
                }
            }
        }
    
        check()
    }
})
router.get("/cart", (req, res) => {
    if(req.session.admin) {
        res.redirect("/user/admin/dashboard")
    }
    else {
        res.render("cart", {title: "My Cart", data: cart})
    }
})
router.get("/order", (req, res) => {
    if(req.session.name) {
        let total = 0
        let name = ""

        for(let i = 0; i < cart.length; i++) {
            name += cart[i].name
            total += cart[i].price
        }
        res.render("order", {title: "Make Order", data: cart, total: total, name: name})
    }
    else if(req.session.admin) {
        res.redirect("/user/admin/dashboard")
    }
    else {
        res.redirect("/user/login")
    }
})
router.get("/pay", (req, res) => {
    if(req.session.name) {
        const name = req.query.name
        const total = req.query.total

        User.findOne({username: req.session.name}).then(
            (user) => {
                const new_budget = parseInt(user.budget - total)
                User.findOneAndUpdate({username: req.session.name}, {budget: new_budget}).then(
                    () => {
                        req.session.budget = new_budget
                        let insert = null

                        for(let i = 0; i < cart.length; i++) {
                            insert = {
                                name: cart[i].name,
                                price: parseInt(cart[i].price),
                                quantity: parseInt(cart[i].quantity),
                                email: user.email
                            }
                            User.findOneAndUpdate({username: req.session.name}, {$push: {"products": insert}}).then(
                                () => {
                                    Order({
                                        name: cart[i].name,
                                        price: cart[i].price,
                                        quantity: cart[i].quantity,
                                        user: user._id,
                                        email: user.email
                                    }).save().then(
                                        () => {
                                            res.redirect("/user/products")
                                        }
                                    ).catch(
                                        (error) => res.json({errror: error})
                                    )
                                }
                            ).catch(
                                (error) => res.json({error: error})
                            )
                        }
                    }
                ).catch(
                    (error) => res.json({error: error})
                )
            }
        ).catch(
            (error) => res.json({error: error})
        )
    }
    else if(req.session.admin) {
        res.redirect("/user/admin/dashboard")
    }
    else {
        res.redirect("/user/login")
    }
})
router.get("/cancel", (req, res) => {
    if(req.session.name) {
        User.findOneAndUpdate({username: req.session.name}, {$pull: {"products": req.query.name}}).then(
            () => {
                Order.findOneAndRemove({name: req.query.name}).then(
                    () => {
                        res.redirect("/user/products")
                    }
                ).catch(
                    (error) => res.json({error: error})
                )
            }
        ).catch(
            (error) => res.json({error: error})
        )
    }
    else if(req.session.admin) {
        res.redirect("/user/admin/dashboard")
    }
    else {
        res.redirect("/user/login")
    }
})

module.exports = router