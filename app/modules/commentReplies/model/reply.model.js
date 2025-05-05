const mongoose = require("mongoose")

const replySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
    },
    content: {
        type: String,
        required: "Blog Content is required",
    },
    approved: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedBy: {
        type: String,
    },
}, {
    timestamps: true,
    versionKey: false,
})



const ReplyModel = mongoose.model("reply", replySchema)
module.exports = ReplyModel