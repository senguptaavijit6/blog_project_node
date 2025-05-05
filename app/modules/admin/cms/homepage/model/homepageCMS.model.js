const mongoose = require("mongoose")

const homepageCMSSchema = mongoose.Schema({
    section2Brands: {
        type: Array,
        required: "section 2 brands are required"
    },

    section3Heading: {
        type: String,
        required: "section 3 Heading is required"
    },
    section3LinkText: {
        type: String,
        required: "section 3 link text is required"
    },
    section3BoldSubHeading: {
        type: String,
        required: "section 3 Bold Sub Heading is required"
    },
    section3SubHeading: {
        type: String,
        required: "section 3 Sub Heading is required"
    },
    section3facebook: {
        type: String,
        required: "section 3 facebook link is required"
    },
    section3instagram: {
        type: String,
        required: "section 3 instagram link is required"
    },
    section3x: {
        type: String,
        required: "section 3 X link is required"
    },
    section3threads: {
        type: String,
        required: "section 3 Threads link is required"
    },
    section3description: {
        type: String,
        required: "section 3 description is required"
    },
    section3image: {
        type: String,
        required: "section 3 image is required"
    },

    section4Heading: {
        type: String,
        required: "section 4 Heading is required"
    },

    section5Heading: {
        type: String,
        required: "section 5 Heading is required"
    },
    section5ButtonText: {
        type: String,
        required: "section 5 Button Text is required"
    },
    section5Description: {
        type: String,
        required: "section 5 Description is required"
    },
    
    section6Heading: {
        type: String,
        required: "section 6 Heading is required"
    },
    section6ButtonText: {
        type: String,
        required: "section 6 Button Text is required"
    },
    section6SubHeading: {
        type: String,
        required: "section 6 Sub Heading is required"
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

const homepageCMSModel = mongoose.model("homepage_cms", homepageCMSSchema)
module.exports = homepageCMSModel