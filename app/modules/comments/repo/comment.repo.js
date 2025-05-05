const CommentModel = require("../model/comment.model")
const mongoose = require("mongoose")

class CommentRepo {
    async createComment(commentData) {
        try {
            const newComment = await CommentModel.create(commentData);
            return newComment;
        } catch (err) {
            console.error('Error in CommentRepo -> createComment: ', err);
            throw err;
        }
    };

    async getAllComments(skip, limit) {
        try {
            const comments = await CommentModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$isDeleted', false] },
                                { $eq: ['$approved', true] },
                            ],
                        },
                    },
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $lookup: {
                        from: 'blogs',
                        let: { "blogId": "$blogId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$isDeleted', false] },
                                            { $eq: ['$_id', "$$blogId"] },
                                        ],
                                    },
                                },
                            },
                        ]
                        , as: 'blogDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { "userId": "$userId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: [ "$isDeleted", false ] },
                                            { $eq: [ "$_id", "$$userId" ] },
                                        ]
                                    }
                                }
                            }, 
                        ],
                        as: "userDetails"
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        let: { "userId": "$userId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: [ "$isDeleted", false ] },
                                            { $eq: [ "$_id", "$$userId" ] },
                                        ]
                                    }
                                }
                            }, 
                        ],
                        as: "adminDetails"
                    }
                },
                {
                    $addFields: {
                        "commentOwner": {
                            $concatArrays: [ "$userDetails", "$adminDetails" ]
                        }
                    }
                },
                {
                    $unwind: {path: "$commentOwner", preserveNullAndEmptyArrays: true},
                },
                {
                    $unwind: {path: "$blogDetails", preserveNullAndEmptyArrays: true},
                },
                {$limit: limit},
                {$skip: skip},
                {
                    $project: {
                        content: 1,
                        blogDetails: 1,
                        commentOwner: 1
                    }
                }
            ]);
            return comments;
        } catch (err) {
            console.error('Error in CommentRepo -> getAllComments: ', err);
            throw err;
        }
    };

    async hasPermissionToDeleteComment(commentId, userId) {
        try {
            const permission = await CommentModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(commentId),
                        isDeleted: false,
                    },
                },
                {
                    $lookup: {
                        from: 'blogs',
                        localField: 'blogId',
                        foreignField: '_id',
                        as: 'blogDetails',
                    }
                },
                {
                    $unwind: { path: '$blogDetails', preserveNullAndEmptyArrays: true }
                },
                {
                    $addFields: {
                        isAuthor: { $eq: ['$blogDetails.author', userId] },
                        isCommentOwner: { $eq: ['$userId', userId] },
                    }
                },
                {
                    $project: {
                        _id: 1,
                        isAuthor: 1,
                        isCommentOwner: 1,
                        blogDetails: 1
                    }
                },
            ])

            return permission
        } catch (error) {
            console.error('Error in CommentRepo -> hasPermissionToDeleteComment: ', error);
            throw error;
        }
    }

    async deleteComment(commentId) {
        try {
            const deletedComment = await CommentModel.findByIdAndUpdate(
                commentId,
                { isDeleted: true },
                { new: true }
            );
            return deletedComment;
        } catch (err) {
            console.error('Error in CommentRepo -> deleteComment: ', err);
            throw err;
        }
    }

    async pushReplyId(commentId, newReplyId) {
        try {
            const pushNewReplyToComment = await CommentModel.findByIdAndUpdate(
                commentId,
                { $push: { reply: newReplyId } },
                { new: true }
            );
            return pushNewReplyToComment;
        } catch (error) {
            console.error('Error in CommentRepo -> replyComment: ', error);
            throw error;
        }
    }

    async pullReplyId(commentId, replyId) {
        try {
            const pullReplyFromComment = await CommentModel.findByIdAndUpdate(
                commentId,
                { $pull: { reply: replyId } },
                { new: true }
            );
            return pullReplyFromComment;
        } catch (error) {
            console.error('Error in CommentRepo -> pullReplyId: ', error);
            throw error;
        }
    }

    async getUserComments(userId) {
        try {
            const userComments = await CommentModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$isDeleted', false] },
                                { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] },
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
            ]);
            return userComments;
        } catch (err) {
            console.error('Error in CommentRepo -> getUserComments: ', err);
            throw err;
        }
    };

    async getCommentById(commentId) {
        try {
            const comment = await CommentModel.findById(commentId);
            return comment;
        } catch (err) {
            console.error('Error in CommentRepo -> getCommentById: ', err);
            throw err;
        }
    }
}

module.exports = new CommentRepo