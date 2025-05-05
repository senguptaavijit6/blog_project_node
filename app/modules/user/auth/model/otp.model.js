const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userOTPSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: "First name of user is required",
        minlength: [3, "First name of user must be at least 3 characters long"]
    },
    lastName: {
        type: String,
        required: "Last name of user is required",
        minlength: [3, "Last name of user must be at least 3 characters long"]
    },
    email: {
        type: String,
        required: "Email of user is required",
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email address should follow the format: abc@email.com']
    },
    password: {
        type: String,
        required: "password of user is required",
        minlength: [8, "Password of user must be at least 8 characters long"]
    },
    avatar: {
        type: String,
        required: "Avatar of user is required",
    },
    role: {
        type: String,
        enum: ["author", "editor"],
        default: "author"
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    timezone: {
        type: String,
        required: "Timezone of user otp is required"
    },
    otp: {
        type: String,
        required: "OTP of user is required",
        length: [6, "OTP of user must be of 6 characters"]
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

userOTPSchema.methods.hashOTP = async (OTP) => {
    return await bcrypt.hash(OTP, await bcrypt.genSalt(10))
}

userOTPSchema.methods.compareOTP = async (OTP, hash) => {
    return await bcrypt.compare(OTP, hash)
}

const UserOTPModel = mongoose.model("User_OTP", userOTPSchema)
module.exports = UserOTPModel