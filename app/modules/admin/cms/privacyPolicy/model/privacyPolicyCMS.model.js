const mongoose = require("mongoose")

const privacyPolicyPageCMSSchema = mongoose.Schema({
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

const PrivacyPolicyCMSModel = new mongoose.model("privacy_policy_cms", privacyPolicyPageCMSSchema)
module.exports = PrivacyPolicyCMSModel