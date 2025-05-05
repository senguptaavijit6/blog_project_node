const mongoose = require("mongoose")

const termsPageCMSSchema = mongoose.Schema({
    title: {
        type: String,
        required: "Terms of service Title is required"
    },

    content: {
        type: String,
        required: "Terms of service Content is required"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
})

const TermsPageCMSModel = new mongoose.model("terms_page_cms", termsPageCMSSchema)
module.exports = TermsPageCMSModel