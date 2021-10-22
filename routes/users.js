const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const User = require("../models/user")
const Product = require("../models/product")
const Order = require("../models/order")
const { isValidObjectId } = require("mongoose")

router.get("/login", (req, res) => {
    if(req.session.name) {
        res.redirect("/user/dashboard")
    }
    else if(req.session.admin) {
        res.redirect("/user/admin/dashboard")
    }
    else {
        res.render("user/login", {title: "Authentication Page"})
    }
})
router.get("/register", (req, res) => {
    if(req.session.name) {
        res.redirect("/user/dashboard")
    }
    else if(req.session.admin) {
        res.redirect("/user/admin/dashboard")
    }
    else {
        res.render("user/register", {title: "Registration Page"})
    }
})
router.get("/dashboard", (req, res) => {
    if(req.session.name) {
        res.render("user/dashboard", {title: `Welcome ${req.session.fname}`})
    }
    else if(req.session.admin) {
        res.redirect("/user/admin/dashboard")
    }
    else {
        req.flash("warning", "To Go To Dashboard, Firstly Please Sign In")
        res.redirect("/user/login")
    }
})
router.get("/logout", (req, res) => {
    if(req.session.name) {
        req.session.destroy(
            res.redirect("/user/login")
        )
    }
    else {
        res.redirect("/")
    }
})
router.get("/products", async (req, res) => {
    await Order.find({email: req.session.email}).then(
        (data) => {
            res.render("user/products", {title: `${req.session.name}'s Products`, data: data})
        }
    )
})
router.post("/register", async (req, res) => {
    const user = User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    })
    const foundUsername = await User.find({username: req.body.username})
    const foundEmail = await User.find({email: req.body.email})

    if(req.body.firstName.length < 4) {
        req.flash("warning", "First Name Must Be At Least 4 Characters Long")
        res.redirect("/user/register")
    }
    else if(req.body.lastName.length < 4) {
        req.flash("warning", "Last Name Must Be At Least 4 Characters Long")
        res.redirect("/user/register")
    }
    else if(req.body.username.length < 4) {
        req.flash("warning", "Username Must Be At Least 4 Characters Long")
        res.redirect("/user/register")
    }
    else if(req.body.password.length < 6) {
        req.flash("warning", "Password Must Be At Least 6 Characters Long")
        res.redirect("/user/register")
    }
    else if(foundUsername.length > 0) {
        req.flash("error", "Username Already Exists")
        res.redirect("/user/register")
    }
    else if(foundEmail.length > 0) {
        req.flash("error", "Email Address Already Exists")
        res.redirect("/user/register")
    }
    else {
        user.save().then(
            () => {
                console.log("User Registered")
                req.session.name = req.body.username
                req.session.fname = req.body.firstName
                req.session.lname = req.body.lastName
                req.session.username = req.body.username
                req.session.email = req.body.email
                req.session.budget = 999999
                req.session.avatar = "/img/users/avatar"
                
                req.flash("success", "Succesfully Registered")
                res.redirect("/user/dashboard")
            }
        ).catch(
            (error) => console.log(error)
        )
    }
})
router.post("/login", (req, res) => {
    const user = User.findOne({username: req.body.username}).then(
        (data) => {
            if(bcrypt.compareSync(req.body.password, data.password)) {
                if(data.isAdmin == true) {
                    req.session.admin = data.username
                    req.session.budget = data.budget
                    res.redirect("/user/admin/dashboard")
                }
                else {
                    req.session.name = req.body.username
                    req.session.fname = data.firstName
                    req.session.lname = data.lastName
                    req.session.email = data.email
                    req.session.budget = data.budget
                    req.session.avatar = data.avatar
                
                    res.redirect("/user/dashboard")
                }
            }
            else {
                req.flash("warning", "Wrong Credentials")
                res.redirect("/user/login")
            }
        }
    ).catch(
        (error) => {
            req.flash("warning", "Wrong Credentials")
            res.redirect("/user/login")
        }
    )
})
router.post("/update/fname", (req, res) => {
    const data = req.body.firstName
    const user = User.findOneAndUpdate({firstName: req.session.fname}, {firstName: data}).then(
        () => {
            req.flash("success", "Succesfully Updated First Name")
            req.session.fname = data
            res.redirect("/user/dashboard")
        }
    ).catch(
        (error) => console.log(error)
    )
})
router.post("/update/lname", (req, res) => {
    const data = req.body.lastName
    const user = User.findOneAndUpdate({lastName: req.session.lname}, {lastName: data}).then(
        () => {
            req.flash("success", "Succesfully Updated Username")
            req.session.lname = data
            res.redirect("/user/dashboard")
        }
    ).catch(
        (error) => console.log(error)
    )
})
router.post("/update/username", (req, res) => {
    const data = req.body.username
    const user = User.findOneAndUpdate({username: req.session.name}, {username: data}).then(
        () => {
            req.flash("success", "Succesfully Updated Username")
            req.session.name = data
            res.redirect("/user/dashboard")
        }
    ).catch(
        (error) => console.log(error)
    )
})
router.post("/update/email", (req, res) => {
    const data = req.body.email
    const user = User.findOneAndUpdate({email: req.session.email}, {email: data}).then(
        () => {
            req.flash("success", "Succesfully Updated Email Address")
            req.session.email = data
            res.redirect("/user/dashboard")
        }
    ).catch(
        (error) => console.log(error)
    )
})
router.post("/update/avatar", (req, res) => {
        const file = req.files.file
        const name = req.files.file.name.split(".")[0]   
        file.mv("public/img/users/"+req.session.name+".png", (error) => {
            if(error) {
                console.log(error)
            }
            else {
                User.findOneAndUpdate({username: req.session.name}, {avatar: `/img/users/${req.session.name}`}).then(
                    () => {
                        req.session.avatar = `/img/users/${req.session.name}`
                        req.flash("success", "Succesfully Updated Profile Picture")
                        res.redirect("/user/dashboard")
                    }
                ).catch(
                    (error) => res.json({error: error})
                )
            }
        })
})

// Admin Routes
router.get("/admin/login", (req, res) => {
    if(req.session.name) {
        req.flash("warning", "Already Logged In")
        res.redirect("/user/dashboard")
    }
    else {
        res.render("user/admin/login", {title: "Login In As Admin"})
    }
})
router.post("/admin/login", (req, res) => {
    if(req.session.name) {
        req.flash("warning", "Already Logged In")
        res.redirect("/user/dashboard")
    }
    else {
        const user = User.findOne({username: req.body.username, isAdmin: "true"}).then(
            (data) => {
                if(bcrypt.compareSync(req.body.password, data.password)) {
                    req.session.admin = req.body.username
                    
                    res.redirect("/user/admin/dashboard")
                }
                else {
                    req.flash("warning", "Wrong Credentials")
                    res.redirect("/user/admin/login")
                }
            }
        ).catch(
            (error) => {
                req.flash("warning", "Wrong Credentials Or You Are Not Admin")
                res.redirect("/user/admin/login")
            }
        )
    }
})
router.get("/admin/dashboard", (req, res) => {
    if(req.session.admin) {
        User.count((error, user) => {
            Product.count((error, product) => {
                Order.count((error, order) => {
                    res.render("user/admin/dashboard", {title: "Admin Dashboard", user: user, product: product, order: order})
                })      
            })
        })
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.get("/admin/products", async (req, res) => {
    if(req.session.admin) {
        await Product.find().then(
            (data) => {
                res.render("user/admin/pages/products", {title: "All Products", data: data})
            }
        ).catch(
            (error) => {
                res.render("user/admin/pages/products", {title: "All Products", data: []})
            }
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.get("/admin/users", async (req, res) => {
    if(req.session.admin) {
        await User.find().then(
            (data) => {
                res.render("user/admin/pages/users", {title: "All Users", data: data})
            }
        ).catch(
            (error) => {
                res.render("user/admin/pages/users", {title: "All Users", data: []})
            }
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.get("/admin/orders", async (req, res) => {
    if(req.session.admin) {
        await Order.find().then(
            (data) => {
                Product.find({name: data[0].name}).then(
                    (product) => {
                        res.render("user/admin/pages/orders", {title: "All Orders", data: data, price: product.price})
                    }
                )
            }
        ).catch(
            (error) => {
                res.render("user/admin/pages/orders", {title: "All Orders", data: []})
            }
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.get("/admin/logout", (req, res) => {
    if(req.session.admin) {
        req.session.destroy((error) => {
            if(error) {
                console.log(error)
            }
            else {
                res.redirect("/")
            }
        })
    }
})

// Edit Product Info
router.get("/admin/edit_product", async (req, res) => {
    if(req.session.admin) {
        await Product.find({name: req.query.name}).then(
            (data) => {
                res.render("user/admin/edits/edit_product", {title: "Edit Product", name: data[0].name, price: data[0].price, in_stock: data[0].in_stock})
            }
        ).catch(
            (error) => res.json({error: error})
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/edit_product/name", async (req, res) => {
    if(req.session.admin) {
        const data = req.body.name
        const product = Product.findOneAndUpdate({name: req.query.name}, {name: data}).then(
            () => {
                req.flash("success", "Succesfully Updated Product Name")
                res.redirect("/user/admin/products")
            }
        ).catch(
            (error) => {
                res.json({error: error})
            }
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/edit_product/price", async (req, res) => {
    if(req.session.admin) {
        const data = req.body.price
        const product = Product.findOneAndUpdate({name: req.query.name}, {price: data}).then(
            () => {
                req.flash("success", "Succesfully Updated Product Price")
                res.redirect("/user/admin/products")
            }
        ).catch(
            (error) => {
                res.json({error: error})
            }
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/edit_product/in_stock", async (req, res) => {
    if(req.session.admin) {
        const data = req.body.in_stock
        const product = Product.findOneAndUpdate({name: req.query.name}, {in_stock: data}).then(
            () => {
                req.flash("success", "Succesfully Updated Product In Stock")
                res.redirect("/user/admin/products")
            }
        ).catch(
            (error) => {
                res.json({error: error})
            }
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.get("/admin/remove_product", (req, res) => {
    if(req.session.admin) {
        const product = req.query.name

        Product.findOneAndRemove({name: product}).then(
            () => {
                req.flash("success", `Succesfully Removed Product ${product}`)
                res.redirect("/user/admin/products")
            }
        ).catch(
            (error) => {
                res.json({error: error})
            }
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.get("/admin/add_product", (req, res) => {
    if(req.session.admin) {
        res.render("user/admin/adds/add_product", {title: "Add New Product"})
    }
    else {
        req.flash("error", "You Have No Permission To Access This Route")
        res.redirect("/")
    }
})
router.post("/admin/add_product", (req, res) => {
    if(req.session.admin) {
        const product = Product({
            name: req.body.prod_name,
            price: req.body.prod_price,
            in_stock: req.body.prod_in_stock
        })
    
        product.save().then(
            () => {
                const file = req.files.prod_avatar
                file.mv("public/img/products/"+req.body.prod_name+".png", (error) => {
                    if(error) {
                        console.log(error)
                    }
                    else {
                        req.flash("success", "Succesfully Added New Product")
                        res.redirect("/user/admin/products")
                    }
                })
            }
        ).catch(
            (error) => res.json({error: error})
        )
    }
    else {
        req.flash("error", "You Have No Permission To Access This Route")
        res.redirect("/")
    }
})

// Edit User Info
router.get("/admin/edit_user", async (req, res) => {
    if(req.session.admin) {
        await User.find({email: req.query.email}).then(
            (data) => {
                res.render("user/admin/edits/edit_user", {title: "Edit User", fname: data[0].firstName, lname: data[0].lastName, username: data[0].username, email: data[0].email, data: data})
            }
        ).catch(
            (error) => res.json({error: error})
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/edit_user/firstname", async (req, res) => {
    if(req.session.admin) {
        const data = req.body.firstName
        if(parseInt(data.length) < 4) {
            req.flash("warning", "First Name Must Be At Least 4 Characters Long")
            res.redirect(`/user/admin/edit_user?email=${req.query.email}`)
        }
        else {
            const user = User.findOneAndUpdate({email: req.query.email}, {firstName: data}).then(
                () => {
                    req.flash("success", "Succesfully Updated First Name")
                    res.redirect("/user/admin/users")
                }
            ).catch(
                (error) => console.log(error)
            )
        }
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/edit_user/lastname", async (req, res) => {
    if(req.session.admin) {
        const data = req.body.lastName
        if(parseInt(data.length) < 4) {
            req.flash("warning", "Last Name Must Be At Least 4 Characters Long")
            res.redirect(`/user/admin/edit_user?email=${req.query.email}`)
        }
        else {
            const user = User.findOneAndUpdate({email: req.query.email}, {lastName: data}).then(
                () => {
                    req.flash("success", "Succesfully Updated Last Name")
                    res.redirect("/user/admin/users")
                }
            ).catch(
                (error) => console.log(error)
            )
        }
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/edit_user/username", async (req, res) => {
    if(req.session.admin) {
        const data = req.body.username
        const foundUsername = await User.find({username: req.body.username})
        if(foundUsername.length > 0) {
            req.flash("error", "Username Already Exists")
            res.redirect(`/user/admin/edit_user?email=${req.query.email}`)
        }
        else {
            const user = User.findOneAndUpdate({email: req.query.email}, {username: data}).then(
                () => {
                    req.flash("success", "Succesfully Updated Username")
                    res.redirect("/user/admin/users")
                }
            ).catch(
                (error) => console.log(error)
            )
        }
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/edit_user/email", async (req, res) => {
    if(req.session.admin) {
        const data = req.body.email
        const foundEmail = await User.find({email: req.body.email})
        if(foundEmail.length > 0) {
            req.flash("error", "Email Address Already Exists")
            res.redirect(`/user/admin/edit_user?email=${req.query.email}`)
        }
        else {
            const user = User.findOneAndUpdate({email: req.query.email}, {email: data}).then(
                () => {
                    req.flash("success", "Succesfully Updated Email Address")
                    res.redirect("/user/admin/users")
                }
            ).catch(
                (error) => console.log(error)
            )
        }
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/edit_user/password", async (req, res) => {
    if(req.session.admin) {
        const data = req.body.password
        if(data.length < 6) {
            req.flash("warning", "Password Must Be At Least 6 Characters Long")
            res.redirect(`/user/admin/edit_user?email=${req.query.email}`)
        }
        else {
            const new_password = bcrypt.hashSync(data, 10)
            const user = User.findOneAndUpdate({email: req.query.email}, {password: new_password}).then(
                () => {
                    req.flash("success", "Succesfully Updated Password")
                    res.redirect("/user/admin/users")
                }
            ).catch(
                (error) => console.log(error)
            )
        }
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/edit_user/avatar", async (req, res) => {
    if(req.session.admin) {
        const file = req.files.file
        const name = req.files.file.name.split(".")[0]   
        file.mv("public/img/users/"+req.query.name+".png", (error) => {
            if(error) {
                console.log(error)
            }
            else {
                User.findOneAndUpdate({email: req.query.email}, {avatar: `/img/users/${req.query.name}`}).then(
                    () => {
                        req.flash("success", "Succesfully Updated Profile Picture")
                        res.redirect("/user/admin/users")
                    }
                ).catch(
                    (error) => res.json({error: error})
                )
            }
        })
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.get("/admin/remove_user", (req, res) => {
    if(req.session.admin) {
        User.findOne({email: req.query.email}).then(
            (user) => {
                if(user.isAdmin == true) {
                    req.flash("error", "You Have Not Permission To Remove Admin User")
                    res.redirect("/user/admin/users")
                }
                else {
                    User.findOneAndRemove({email: req.query.email}).then(
                        () => {
                            Order.findOneAndRemove({email: req.query.email}).then(
                                () => {
                                    req.flash("success", "Succesfully Removed User")
                                    res.redirect("/user/admin/users")
                                }
                            ).catch(
                                (error) => res.json({error: error})
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
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.get("/admin/add_user", (req, res) => {
    if(req.session.admin) {
        res.render("user/admin/adds/add_user", {title: "Add New User"})
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/add_user", async (req, res) => {
    if(req.session.admin) {
        const user = User({
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10)
        })
        const foundUsername = await User.find({username: req.body.username})
        const foundEmail = await User.find({email: req.body.email})
    
        if(req.body.first_name.length < 4) {
            req.flash("warning", "First Name Must Be At Least 4 Characters Long")
            res.redirect("/user/admin/add_user")
        }
        else if(req.body.last_name.length < 4) {
            req.flash("warning", "Last Name Must Be At Least 4 Characters Long")
            res.redirect("/user/admin/add_user")
        }
        else if(req.body.username.length < 4) {
            req.flash("warning", "Username Must Be At Least 4 Characters Long")
            res.redirect("/user/admin/add_user")
        }
        else if(req.body.password.length < 6) {
            req.flash("warning", "Password Must Be At Least 6 Characters Long")
            res.redirect("/user/admin/add_user")
        }
        else if(foundUsername.length > 0) {
            req.flash("error", "Username Already Exists")
            res.redirect("/user/admin/add_user")
        }
        else if(foundEmail.length > 0) {
            req.flash("error", "Email Address Already Exists")
            res.redirect("/user/admin/add_user")
        }
        else {
            user.save().then(
                () => {
                    req.flash("success", "Succesfully Added New User")
                    res.redirect("/user/admin/users")
                }
            ).catch(
                (error) => console.log(error)
            )
        }
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})

// Edit Order Info
router.get("/admin/edit_order", async (req, res) => {
    if(req.session.admin) {
        await Order.find({name: req.query.name}).then(
            (order) => {
                Product.find({name: order[0].name}).then(
                    (product) => {
                        res.render("user/admin/edits/edit_order", {title: "Edit Order", name: order[0].name, total: order[0].price, quantity: order[0].quantity, email: order[0].email, price: product[0].price})
                    }
                ).catch(
                    (error) => {
                        res.json({error: error})
                    }
                )
            }
        ).catch(
            (error) => {
                res.json({error: error})
            }
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/edit_order/name", (req, res) => {
    if(req.session.admin) {
        const data = req.body.name
        Order.findOneAndUpdate({name: req.query.name}, {name: data}).then(
            () => {
                User.findOneAndUpdate({"products.name": req.query.name}, {$set: {"products.$.name": data}}).then(
                    () => {
                        req.flash("success", "Succesfully Updated Order Name")
                        res.redirect("/user/admin/orders")
                    }
                )
            }
        ).catch(
            (error) => res.json({error: error})
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.post("/admin/edit_order/quantity", (req, res) => {
    if(req.session.admin) {
        const data = req.body.quantity
        Order.findOneAndUpdate({name: req.query.name}, {quantity: data}).then(
            () => {
                Order.findOneAndUpdate({name: req.query.name}, {price: parseInt(data * req.query.price)}).then(
                    async () => {
                        await Product.find({name: req.query.name}).then(
                            (product) => {
                                if(data > product[0].in_stock) {
                                    req.flash("warning", "The Order Quantity Is Greater Than The Quantity Of The Product")
                                    res.redirect(`/user/admin/edit_order?name=${req.query.name}`)
                                }
                                else {
                                    User.findOneAndUpdate({"products.email": req.query.email}, {$set: {"products.$.quantity": data}}).then(
                                        () => {
                                            User.findOneAndUpdate({"products.email": req.query.email}, {$set: {"products.$.price": parseInt(data * req.query.price)}}).then(
                                                () => {
                                                    req.flash("success", "Succesfully Updated Order Quantity")
                                                    res.redirect("/user/admin/orders")
                                                }
                                            ).catch(
                                                (error) => res.json({error: error})
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
        ).catch(
            (error) => res.json({error: error})
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})
router.get("/admin/remove_order", (req, res) => {
    if(req.session.admin) {
        User.findOneAndUpdate({email: req.query.email}, {$pull: {"products": req.query.name}}).then(
            () => {
                Order.findOne({name: req.query.name}).then(
                    (order) => {
                        User.findOne({email: req.query.email}).then(
                            (user) => {
                                let budget = user.budget
                                let new_budget = budget + order.price
                                User.findOneAndUpdate({email: req.query.email}, {budget: new_budget}).then(
                                    () => {
                                        Order.findOneAndRemove({name: req.query.name}).then(
                                            () => {
                                                req.flash("success", "Succesfully Removed Order")
                                                res.redirect("/user/admin/orders")
                                            }
                                        ).catch(
                                            (error) => res.json({error: error})
                                        )
                                    }
                                ).catch(
                                    (error) => res.json({error: error})
                                )
                            }
                        ).catch(
                            (error) => res.json({error: error})
                        )
                    }
                ).catch(
                    (error) => res.json({error: error})
                )
            }
        ).catch(
            (error) => res.json({error: error})
        )
    }
    else {
        req.flash("warning", "Wrong Credentials Or You Are Not Admin")
        res.redirect("/")
    }
})

module.exports = router