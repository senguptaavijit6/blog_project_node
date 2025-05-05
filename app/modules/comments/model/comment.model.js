const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "blogs",
        required: "Blog ID is required",
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
    reply: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comments",
        }
    ]
}, {
    timestamps: true,
    versionKey: false,
})



const CommentModel = mongoose.model("comment", commentSchema)
module.exports = CommentModel