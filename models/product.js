const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    in_stock: {
        type: Number,
        default: 0,
        require: true
    }
})

const Product = mongoose.model("Product", productSchema)

module.exports = Product