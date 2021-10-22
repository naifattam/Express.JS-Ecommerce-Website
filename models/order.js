const mongoose = require("mongoose")

const orderSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    quantity: {
        type: Number,
        require: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    email: {
        type: String,
        require: true
    }
})

const Order = mongoose.model("Order", orderSchema)

module.exports = Order