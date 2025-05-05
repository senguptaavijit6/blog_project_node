const mongoose = require("mongoose")

const homeSliderSchema = mongoose.Schema({
    sliderBoldHeading: {
        type: String,
        required: "Slider Bold Heading 1 is required"
    },
    sliderHeading: {
        type: String,
        required: "Slider Heading is required"
    },
    sliderButtonText: {
        type: String,
        required: "Slider Button Text is required"
    },
    sliderButtonColor: {
        type: String,
        required: "Slider Button Text is required"
    },
    sliderImage: {
        type: String,
        required: "Slider Image is required"
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false,
    timestamps: true
})

const HomeSliderModel = mongoose.model("home_slider_model", homeSliderSchema)
module.exports = HomeSliderModel