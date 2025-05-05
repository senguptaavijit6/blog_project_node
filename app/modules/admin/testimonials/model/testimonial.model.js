const mongoose = require("mongoose")

const testimonialSchema = mongoose.Schema({
    clientName: {
        type: String,
        required: "Client image is required"
    },

    clientRating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: "Client Rating is required"
    },

    clientDesignation: {
        type: String,
        required: "Client designation is required"
    }, 

    clientImage: {
        type: String,
        required: "Client image is required"
    },

    clientMessage: {
        type: String,
        required: "Client Message is required"
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
},{
    versionKey: false,
    timestamps: true
})

const TestimonialsModel = mongoose.model("testimonial", testimonialSchema)
module.exports = TestimonialsModel