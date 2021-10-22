const express = require("express")
const router = express.Router()
const Category = require("../models/category")

router.post("/", (req, res) => {
    const category = new Category({
        name: req.body.name
    })
    
    category.save().then(
        () => res.json({msg: "Added New Category"})
    ).catch(
        (error) => res.json({error: error})
    )
})

module.exports = router