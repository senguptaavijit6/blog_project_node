const ReplyModel = require("../model/reply.model");
const mongoose = require("mongoose");

class ReplyRepo {
    async createReply(replyData) {
        try {
            const newReply = await ReplyModel.create(replyData);
            return newReply;
        } catch (error) {
            console.error('Error in CommentRepo -> replyComment: ', error);
            throw error;
        }
    }

    async hasPermissionToDeleteReply(userId, replyId, blogId, commentId) {
        try {
            const permission = await ReplyModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(replyId),
                        isDeleted: false,
                    },
                },
                {
                    $lookup: {
                        from: 'blogs',
                        let: { blogId: blogId },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', '$$blogId'] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
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
                            },
                        ],
                        as: 'blogDetails',
                    }
                },
                {
                    $unwind: {  path: '$blogDetails', preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        from: 'comments',
                        localField: 'commentId',
                        foreignField: '_id',
                        as: 'commentDetails',
                    }
                },
                {
                    $unwind: {  path: '$commentDetails', preserveNullAndEmptyArrays: true }
                },
                {
                    $addFields: {
                        isAuthor: { $eq: ['$blogDetails.author', userId] },
                        isReplyOwner: { $eq: ['$userId', userId] },
                        isCommentOwner: { $eq: ['$commentDetails.userId', userId] },
                    }
                },
                {
                    $project: {
                        _id: 1,
                        isAuthor: 1,
                        isCommentOwner: 1,
                        isReplyOwner: 1,
                        blogDetails: 1
                    }
                },
            ])

            return permission
        } catch (error) {
            console.error('Error in ReplyRepo -> hasPermissionToDeleteReply: ', error);
            throw error;            
        }
    }

    async deleteReply(replyId) {
        try {
            const deletedReply = await ReplyModel.findByIdAndUpdate(
                replyId,
                { isDeleted: true },
                { new: true }
            );
            return deletedReply;
        } catch (error) {
            console.error('Error in ReplyRepo -> deleteReply: ', error);
            throw error;
        }
    }
}

module.exports = new ReplyRepo();