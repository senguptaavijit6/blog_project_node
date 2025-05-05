const mongoose = require("mongoose")

const likeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users",
    },
    adminId: {
        type: mongoose.Types.ObjectId,
        ref: "admins",
    },
    blogId: {
        type: mongoose.Types.ObjectId,
        ref: "blogs",
        required: true
    },
    likeType: {
        type: String,
        enum: ["like", "dislike"], // newtral is not needed because we can just remove the like by removing id
        required: true
    }
},{
    timestamps: true,
    versionKey: false
})

// likeSchema.pre("validate", (next) => {
//     if (!this.userId && !this.adminId) {
//         return next(new Error("Either userId or adminId must be provided."))        
//     }
// })

const LikeModel = mongoose.model("likes", likeSchema)
module.exports = LikeModel