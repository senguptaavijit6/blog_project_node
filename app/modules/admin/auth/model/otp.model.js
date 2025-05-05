const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const adminOTPSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: "First name of admin is required",
        minlength: [3, "First name of admin must be at least 3 characters long"]
    },
    lastName: {
        type: String,
        required: "Last name of admin is required",
        minlength: [3, "Last name of admin must be at least 3 characters long"]
    },
    email: {
        type: String,
        required: "Email of admin is required",
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email address should follow the format: abc@email.com']
    },
    password: {
        type: String,
        required: "password of admin is required",
        minlength: [8, "Password of admin must be at least 8 characters long"]
    },
    image: {
        type: String,
        required: "Image of admin is required",
    },
    role: {
        type: String,
        enum: ["admin", "instructor"],
        default: "instructor"
    },
    isEmailVerified: {
        type: Boolean,
        enum: [true, false],
        default: false
    },
    timezone: {
        type: String,
        required: "Timezone of admin otp is required"
    },
    otp: {
        type: String,
        required: "OTP of admin is required",
        length: [6, "OTP of admin must be of 6 characters"]
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

adminOTPSchema.methods.hashOTP = async (OTP) => {
    return await bcrypt.hash(OTP, await bcrypt.genSalt(10))
}

adminOTPSchema.methods.compareOTP = async (OTP, hash) => {
    return await bcrypt.compare(OTP, hash)
}

const AdminOTPModel = mongoose.model("Admin_OTP", adminOTPSchema)
module.exports = AdminOTPModel