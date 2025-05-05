const mongoose = require("mongoose")

const generalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: "Site title is required"
    },
    description: {
        type: String,
        required: "Site description is required"
    },
    favicon: {
        type: String,
        required: "Site favicon is required"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},{
    versionKey: false,
    timestamps: true
})

const GeneralModel = new mongoose.model("general_setting", generalSchema)
module.exports = GeneralModel