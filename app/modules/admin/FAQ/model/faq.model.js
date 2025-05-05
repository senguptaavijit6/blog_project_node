const mongoose = require("mongoose")

const faqSchema = mongoose.Schema({
    question: {
        type: String,
        required: "FAQ question is required"
    },
    answer: {
        type: String,
        required: "FAQ answer is required"
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
    versionKey: false,
    timestamps: true
})

const FAQModel = mongoose.model("FAQ", faqSchema)
module.exports = FAQModel