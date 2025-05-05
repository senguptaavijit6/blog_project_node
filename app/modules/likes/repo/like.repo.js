const LikeModel = require("../model/like.model")
const mongoose = require("mongoose")

class LikeRepo {
    async createLikeDislike(data) {
        try {
            console.log("data: ", data);

            const deleteLikeDislike = await LikeModel.findOneAndDelete({ blogId: data.blogId, userId: data.userId })
            console.log('^^^^^^^^^^^^^deleteLikeDislike', deleteLikeDislike);
            const like = await LikeModel.create(data)
            return like
        } catch (error) {
            throw error
        }
    }

    async getLikesByPostId(postId) {
        try {
            // const likes = await LikeModel.find({ postId })
            const likes = await LikeModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$blogId", postId] },
                                { $eq: ["$likeType", "like"] }
                            ]
                        }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $lookup: {
                        from: "admins",
                        localField: "adminId",
                        foreignField: "_id",
                        as: "admin"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        postId: 1,
                        likeType: 1,
                        user: 1,
                        admin: 1,
                    }
                }
            ])
            return likes
        } catch (error) {
            throw error
        }
    }

    async getDislikesByPostId(postId) {
        try {
            // const dislikes = await LikeModel.find({ postId })
            const dislikes = await LikeModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$blogId", postId] },
                                { $eq: ["$likeType", "dislike"] }
                            ]
                        }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $lookup: {
                        from: "admins",
                        localField: "adminId",
                        foreignField: "_id",
                        as: "admin"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        postId: 1,
                        likeType: 1,
                        user: 1,
                        admin: 1,
                    }
                }
            ])
            return dislikes
        } catch (error) {
            throw error
        }
    }

    async getLikeDislikeByBlogIdByUserId(blogId, userId) {
        try {

            console.log("****************blogId and userId from LikeRepo -> likeDislikeDetailsByUserId: \n", blogId, userId);

            const query = {
                blogId: new mongoose.Types.ObjectId(blogId),
                userId: new mongoose.Types.ObjectId(userId)
            }

            console.log("****************data from LikeRepo -> likeDislikeDetailsByUserId: \n", query);

            const likeDislike = await LikeModel.find(query)

            console.log("****************likedislike from LikeRepo -> likeDislikeDetailsByUserId: \n", likeDislike);
            return likeDislike
        } catch (error) {
            throw error
        }
    }

    async deleteLikeDislike(userId, blogId) {
        try {
            const like = await LikeModel.findOne({ blogId, userId: userId.toString() })
            if (!like) {
                console.error("Like not found")
                return
            }
            const deletedLike = await LikeModel.findByIdAndDelete(like._id)
            return deletedLike
        } catch (error) {
            throw error
        }
    }

    async updateLike(likeId, data) {
        try {
            const updatedLike = await LikeModel.findByIdAndUpdate(likeId, data, { new: true })
            return updatedLike
        } catch (error) {
            throw error

        }
    }

    async getUserLikes(userId) {
        try {
            const likes = await LikeModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] },
                                { $eq: ['$likeType', "like"] },
                            ],
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'blogs',
                        let: { blogId: '$blogId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$blogId'],
                                    },
                                },
                            },
                            {
                                $lookup: {
                                    from: 'categories',
                                    localField: 'category',
                                    foreignField: '_id',
                                    as: 'categoryDetails',
                                }
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'author',
                                    foreignField: '_id',
                                    as: 'authorDetails',
                                }
                            },
                            {
                                $unwind: { path: '$authorDetails', preserveNullAndEmptyArrays: true }
                            }
                        ],
                        as: 'blogDetails',
                    }
                },
                {
                    $unwind: { path: '$blogDetails', preserveNullAndEmptyArrays: true }
                },
            ])
            return likes
        } catch (error) {
            console.error("Error in LikeRepo -> getUserLikes: ", error);
            throw error
        }
    }
    
    async getUserDislikes(userId) {
        try {
            const likes = await LikeModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] },
                                { $eq: ['$likeType', "dislike"] },
                            ],
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'blogs',
                        let: { blogId: '$blogId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$blogId'],
                                    },
                                },
                            },
                            {
                                $lookup: {
                                    from: 'categories',
                                    localField: 'category',
                                    foreignField: '_id',
                                    as: 'categoryDetails',
                                }
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'author',
                                    foreignField: '_id',
                                    as: 'authorDetails',
                                }
                            },
                            {
                                $unwind: { path: '$authorDetails', preserveNullAndEmptyArrays: true }
                            }
                        ],
                        as: 'blogDetails',
                    }
                },
                {
                    $unwind: { path: '$blogDetails', preserveNullAndEmptyArrays: true }
                },
            ])
            return likes
        } catch (error) {
            console.error("Error in LikeRepo -> getUserLikes: ", error);
            throw error
        }
    }
}

module.exports = new LikeRepo()