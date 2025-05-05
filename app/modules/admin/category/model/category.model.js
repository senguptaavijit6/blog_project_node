const mongoose = require("mongoose")

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: "Category Name is required"
    }, 
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    isDeleted: {
        type: Boolean,
        enum: [true, false],
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
})

const CategoryModel = mongoose.model("category", categorySchema)
module.exports = CategoryModel