const express = require("express")
const dotenv = require("dotenv/config")
const mongoose = require("mongoose")
const body_parser = require("body-parser")
const session = require("express-session")
const morgan = require("morgan")
const flash = require("express-flash")
const upload = require("express-fileupload")

// Express App
const app = express()

// Middlewares
app.use(morgan("tiny"))
app.use(session({
    secret: process.env.SECRET_KEY,
    saveUninitialized: true,
    resave: true
}))
app.use(body_parser.urlencoded({extended: true}))
app.use(body_parser.json())
app.use(flash())
// app.use(function(req, res, next) {
//     res.locals.name = req.session.name
//     res.locals.admin = req.session.admin
//     res.locals.lname = req.session.lname
//     res.locals.fname = req.session.fname
//     res.locals.username = req.session.username
//     res.locals.email = req.session.email
//     res.locals.budget = req.session.budget
//     res.locals.avatar = req.session.avatar
//     next()
// })
app.use(upload())

// DB Connection
mongoose.connect(process.env.DB_URI).then(
    () => console.log("DB Connected")
).catch(
    (error) => console.log(error)
)

// View Engine And Static Folder
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.static("img"))
app.use(express.static("css"))

// Routers
const productsRouter = require("./routes/products")
const categoriesRouter = require("./routes/categories")
const usersRouter = require("./routes/users")

// Routes
app.use("/", productsRouter)
app.use("/category", categoriesRouter)
app.use("/user", usersRouter)

// Listening App To Port
app.listen(process.env.PORT, () => {
    console.log(`Website Started on Port ${process.env.PORT}`)
})
