const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({
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
    timezone: {
        type: String,
        required: "Timezone of user is required"
    },
    otp: {
        type: String,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: true
    },
    isDisabled: {
        type: Boolean,
        default: false
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

userSchema.methods.hashPassword = async (password) => {
    return await bcrypt.hash(password, await bcrypt.genSalt(10))
}

userSchema.methods.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash)
}

const UserModel = mongoose.model("User", userSchema)
module.exports = UserModel