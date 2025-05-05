const mongoose = require("mongoose")

const tagSchema = mongoose.Schema({
    name: {
        type: String,
        required: "Tag Name is required"
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

const TagModel = mongoose.model("tag", tagSchema)
module.exports = TagModel