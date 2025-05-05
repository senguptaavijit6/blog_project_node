const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const adminSchema = mongoose.Schema({
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
    timezone: {
        type: String,
        required: "Timezone of admin is required"
    },
    otp: {
        type: String,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        enum: [true, false],
        default: true
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

adminSchema.methods.hashPassword = async (password) => {
    return await bcrypt.hash(password, await bcrypt.genSalt(10))
}

adminSchema.methods.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash)
}

const AdminModel = mongoose.model("Admin", adminSchema)
module.exports = AdminModel