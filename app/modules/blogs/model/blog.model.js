const mongoose = require("mongoose")

const blogsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: "Blog title is required",
    },
    content: {
        type: String,
        required: "Blog Content is required",
    },
    image: {
        type: String,
        required: "Blog Image is required",
    },
    publishAt: {
        type: Date,
        default: Date.now(),
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    authorRole: {
        type: String,
    },
    GMT: {
        type: String,
        required: "Author/admin GMT is required",
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
    },
    adminRole: {
        type: String,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "likes"
        }
    ],
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "likes"
        }
    ],
    category: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
        },
    ],
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tags",
        },
    ],
    views: [String],
    isPrivate: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
    },
    deleteReason: {
        type: String,
    },
}, {
    timestamps: true,
    versionKey: false,
})

const BlogModel = mongoose.model("blogs", blogsSchema)
module.exports = BlogModel