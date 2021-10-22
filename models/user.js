const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        require: true,
    },
    lastName: {
        type: String,
        require: true,
    },
    username: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    budget: {
        type: Number,
        default: 999999
    },
    products: [{
        name: String,
        price: Number,
        quantity: {
            type: Number,
            default: 0
        },
        email: String
    }],
    avatar: {
        type: String,
        default: "/img/users/avatar"
    }
})

const User = mongoose.model("User", userSchema)

module.exports = User