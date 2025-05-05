const mongoose = require("mongoose")

const aboutUsCMSSchema = mongoose.Schema({
    section1BoldHeading: {
        type: String,
        required: "Bold Heading of section 1 is required"
    },
    section1Heading: {
        type: String,
        required: "Heading of section 1 is required"
    },
    section1Image: {
        type: String,
        required: "Image for section 1 is required"
    },
    section2Heading: {
        type: String,
        required: "Heading of section 2 is required"
    },
    section2SubHeading: {
        type: String,
        required: "Sub-heading of section 2 is required"
    },
    section2Description: {
        type: String,
        required: "Description of section 2 is required"
    },
    section3Heading: {
        type: String,
        required: "Heading of section 3 is required"
    },
    section3SubHeading: {
        type: String,
        required: "Sub-heading of section 3 is required"
    },
    section3Description: {
        type: String,
        required: "Description of section 3 is required"
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

const AboutUsCMSModel = mongoose.model("about_us_cms", aboutUsCMSSchema)
module.exports = AboutUsCMSModel