const mongoose = require("mongoose");
const BlogModel = require("../model/blog.model");
const FutureBlogModel = require("../model/future.blog.model");
const cron = require("node-cron");
const CategoryRepo = require("../../admin/category/repository/category.repo");
const TagsRepo = require("../../admin/tags/repository/tags.repo");


class BlogRepo {
    // userTime = null;

    // convertToUserTime = () => {
    //     console.log("userTime from repo", this.userTime);

    //     if (this.userTime) {
    //         let gmt = userTime.split("(")[1].split(")")[0].slice(3)

    //         const date = new Date()
    //         const baseOffset = date.getTimezoneOffset()
    //         const [hours, minutes] = gmt.split(":").map(Number)
    //         const offsetMilliseconds = (hours * 60 + minutes) * 60000

    //         const userTime = new Date(date.getTime() - baseOffset + offsetMilliseconds)

    //         return userTime
    //     }
    // }

    getCurrentUTCTime = () => {
        const currentUTC = new Date().toISOString();
        return currentUTC;
    }

    async createBlog(blogData) {
        try {
            const newBlog = await BlogModel.create(blogData);
            return newBlog;
        } catch (err) {
            console.error('Error in BlogRepo -> createBlog: ', err);
            throw err;
        }
    };

    async getAllBlogsWithoutPagination() {
        try {
            const blogs = await BlogModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$isDeleted', false] },
                                { $eq: ['$isPrivate', false] },
                            ],
                        },
                    },
                },
                { $sort: { publishAt: -1 } },
                {
                    $lookup: {
                        from: 'tags',
                        localField: 'tags',
                        foreignField: '_id',
                        as: 'tagDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { authorId: "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'userDetails',
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        let: { authorId: "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'adminDetails',
                    }
                },
                {
                    $set: {
                        authorDetails: { $concatArrays: ["$userDetails", "$adminDetails"] }
                    }
                },
                {
                    $unwind: {
                        path: "$authorDetails",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]);

            return blogs;
        } catch (err) {
            console.error('Error in BlogRepo -> getAllBlogs: ', err);
            throw err;
        }
    };

    async getAllBlogs(skip, limit) {
        try {
            const blogs = {}
            blogs.documents = await BlogModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$isDeleted', false] },
                                { $eq: ['$isPrivate', false] },
                            ],
                        },
                    },
                },
                { $sort: { publishAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'tags',
                        localField: 'tags',
                        foreignField: '_id',
                        as: 'tagDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { authorId: "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'userDetails',
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        let: { authorId: "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'adminDetails',
                    }
                },
                {
                    $set: {
                        authorDetails: { $concatArrays: ["$userDetails", "$adminDetails"] }
                    }
                },
                {
                    $unwind: {
                        path: "$authorDetails",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]);
            blogs.count = await BlogModel.countDocuments({
                $expr: {
                    $and: [
                        { $eq: ['$isDeleted', false] },
                    ],
                },
            });
            return blogs;
        } catch (err) {
            console.error('Error in BlogRepo -> getAllBlogs: ', err);
            throw err;
        }
    };

    async getAllPrivateBlogs() {
        try {
            const blogs = await BlogModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$isDeleted', false] },
                                { $eq: ['$isPrivate', true] },
                            ],
                        },
                    },
                },
                { $sort: { publishAt: -1 } },
                {
                    $lookup: {
                        from: 'tags',
                        localField: 'tags',
                        foreignField: '_id',
                        as: 'tagDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { authorId: "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'userDetails',
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        let: { authorId: "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'adminDetails',
                    }
                },
                {
                    $set: {
                        authorDetails: { $concatArrays: ["$userDetails", "$adminDetails"] }
                    }
                },
                {
                    $unwind: {
                        path: "$authorDetails",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]);
            blogs.count = await BlogModel.countDocuments({
                $expr: {
                    $and: [
                        { $eq: ['$isDeleted', false] },
                        { $eq: ['$isPrivate', true] },
                    ],
                },
            });
            return blogs;
        } catch (error) {
            console.error('Error in BlogRepo -> getAllPrivateBlogs: ', err);
            throw err;            
        }
    }

    async getAllFutureBlogs() {
        try {
            const blogs = await BlogModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$isDeleted', false] },
                                { $eq: ['$isPublished', false] },
                            ],
                        },
                    },
                },
                { $sort: { publishAt: -1 } },
                {
                    $lookup: {
                        from: 'tags',
                        localField: 'tags',
                        foreignField: '_id',
                        as: 'tagDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { authorId: "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'userDetails',
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        let: { authorId: "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'adminDetails',
                    }
                },
                {
                    $set: {
                        authorDetails: { $concatArrays: ["$userDetails", "$adminDetails"] }
                    }
                },
                {
                    $unwind: {
                        path: "$authorDetails",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]);
            blogs.count = await BlogModel.countDocuments({
                $expr: {
                    $and: [
                        { $eq: ['$isDeleted', false] },
                        { $eq: ['$isPrivate', true] },
                    ],
                },
            });
            return blogs;
        } catch (err) {
            console.error('Error in BlogRepo -> getAllFutureBlog: ', err);
            throw err;            
        }
    }

    async getAllBlogsByUser(userId, userTime) {
        try {
            this.userTime = userTime
            let blogs = {}
            // get blogs by user only with likes, title, publishAt, isPublished, image
            blogs.published = await BlogModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$author', userId] },
                                { $eq: ['$isDeleted', false] },
                                { $eq: ['$isPublished', true] },
                            ],
                        },
                    },
                },
            ]);
            blogs.unpublished = await FutureBlogModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$author', userId] },
                                { $eq: ['$isDeleted', false] },
                            ],
                        },
                    },
                },
            ])
            return blogs;
        } catch (err) {
            console.error('Error in BlogRepo -> getAllBlogsByUser: ', err);
            throw err;
        }
    }

    async getBlogById(blogId) {
        try {
            const blog = await BlogModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$_id', new mongoose.Types.ObjectId(blogId)] },
                                { $eq: ['$isDeleted', false] },
                            ],
                        },
                    },
                },                
                {
                    $lookup: {
                        from: 'users',
                        let: { authorId: "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'userDetails',
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        let: { authorId: "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'adminDetails',
                    }
                },
                {
                    $set: {
                        authorName: { $concatArrays: ["$userDetails", "$adminDetails"] }
                    }
                },
                {
                    $unwind: {
                        path: "$authorName",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'likes',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$blogId', blogId] },
                                            { $eq: ['$likeType', "like"] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'totalLikes',
                    },
                },
                {
                    $lookup: {
                        from: 'likes',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$blogId', blogId] },
                                            { $eq: ['$likeType', "dislike"] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'totalDislikes',
                    },
                },
                {
                    $addFields: {
                        likedCount: { $size: "$totalLikes" },
                        dislikedCount: { $size: "$totalDislikes" },
                        // likedByAdminsCount: { $size: "$likedByAdmins" }
                    }
                },
                {
                    $lookup: {
                        from: "likes",
                        localField: "likes",
                        foreignField: "_id",
                        as: "likeDetails",
                    },
                },
                // Add fields for userLikes and adminLikes
                {
                    $addFields: {
                        userLikesDislikes: {
                            $filter: {
                                input: "$likeDetails",
                                as: "like",
                                cond: { $ifNull: ["$$like.userId", false] },
                            },
                        },
                        adminLikesDislikes: {
                            $filter: {
                                input: "$likeDetails",
                                as: "like",
                                cond: { $ifNull: ["$$like.adminId", false] },
                            },
                        },
                    },
                },

                {
                    $lookup: {
                        from: 'tags',
                        let: { "tagIds": "$tags" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', "$$tagIds"] },
                                            { $eq: ['$status', "active"] },
                                        ],
                                    },
                                },
                            },
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: 'tagDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        let: { "categoryIds": "$category" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', "$$categoryIds"] },
                                            { $eq: ['$status', "active"] },
                                        ],
                                    },
                                },
                            },
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: 'categoryDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'comments',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$blogId', blogId] },
                                            { $eq: ['$approved', true] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                            {
                                $sort: { createdAt: -1 },
                            },
                            {
                                $lookup: {
                                    from: "users",
                                    let: { "userId": "$userId" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $eq: ['$_id', "$$userId"] },
                                                        { $eq: ['$isDeleted', false] },
                                                    ],
                                                },
                                            },
                                        },
                                    ],
                                    as: 'commentOwner'
                                },
                            },
                            {
                                $lookup: {
                                    from: "replies",
                                    let: { "replyId": "$reply" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        { $in: ['$_id', "$$replyId"] },
                                                        { $eq: ['$isDeleted', false] },
                                                    ],
                                                },
                                            },
                                        },
                                        {
                                            $lookup: {
                                                from: "users",
                                                let: { "userId": "$userId" },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ['$_id', "$$userId"] },
                                                                    { $eq: ['$isDeleted', false] },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                ],
                                                as: 'replyOwnerUser'
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: "admins",
                                                let: { "userId": "$userId" },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ['$_id', "$$userId"] },
                                                                    { $eq: ['$isDeleted', false] },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                ],
                                                as: 'replyOwnerAdmin'
                                            }
                                        },
                                        {
                                            $addFields: {
                                                "replyOwner": {
                                                    $concatArrays: [ '$replyOwnerUser', '$replyOwnerAdmin' ]
                                                }
                                            }
                                        },
                                        {
                                            $unwind: "$replyOwner"
                                        },
                                    ],
                                    as: 'replies', 
                                },
                            },
                            {
                                $unwind: "$commentOwner"
                            },
                        ],
                        as: 'commentsDetails',
                    },
                },
                {
                    $project: {
                        title: 1,
                        isPublished: 1,
                        image: 1,
                        content: 1,
                        authorName: { firstName: 1, lastName: 1, _id: 1 },
                        totalLikes: 1,
                        totalDislikes: 1,
                        likedCount: 1,
                        dislikedCount: 1,
                        publishAt: 1,
                        commentsDetails: 1,
                        tagDetails: 1,
                        categoryDetails: 1,
                        userLikes: 1,
                        adminLikes: 1,
                        views: 1,
                    },
                },
            ]);
            return blog[0];
        } catch (err) {
            console.error('Error in BlogRepo -> getBlogById: ', err);
            throw err;
        }
    };

    async getBlogsByIds(blogIds) {
        try {
            const blogs = await BlogModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $in: ['$_id', blogIds] },
                                { $eq: ['$isDeleted', false] },
                            ],
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { "authorId": "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'authorDetails',
                    },
                },
                {
                    $unwind: "$authorDetails"
                },
                {
                    $lookup: {
                        from: 'likes',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$blogId', blogIds] },
                                            { $eq: ['$likeType', "like"] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'totalLikes',
                    },
                },
                {
                    $lookup: {
                        from: 'likes',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$blogId', blogIds] },
                                            { $eq: ['$likeType', "dislike"] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'totalDislikes',
                    },
                },
                

                {
                    $lookup: {
                        from: 'tags',
                        let: { "tagIds": "$tags" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', "$$tagIds"] },
                                            { $eq: ['$status', "active"] },
                                        ],
                                    },
                                },
                            },
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: 'tagDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        let: { "categoryIds": "$category" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', "$$categoryIds"] },
                                            { $eq: ['$status', "active"] },
                                        ],
                                    },
                                },
                            },
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: 'categoryDetails',
                    },
                },
                
                {
                    $project: {
                        title: 1,
                        isPublished: 1,
                        image: 1,
                        content: 1,
                        authorDetails: 1,
                        totalLikes: 1,
                        totalDislikes: 1,
                        publishAt: 1,
                        tagDetails: 1,
                        categoryDetails: 1,
                    },
                },
            ]);
            return blogs;
        } catch (err) {
            console.error('Error in BlogRepo -> getBlogById: ', err);
            throw err;
        }
    };

    async getBlogByCategory(categoryId, skip, limit) {
        try {
            let blogs = {}
            blogs.documents = await BlogModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $in: [categoryId, '$category'] },
                                { $eq: ['$isDeleted', false] },
                                { $eq: ['$isPrivate', false] },
                            ],
                        },
                    },
                },
                {
                    $sort: { publishAt: -1 },
                },
                {
                    $lookup: {
                        from: 'categories',
                        let: { "categoryIds": "$category" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', "$$categoryIds"] },
                                            { $eq: ['$isDeleted', false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    name: 1,
                                }
                            }
                        ],
                        as: 'categoryDetails'
                    },
                },
                {
                    $lookup: {
                        from: 'tags',
                        let: { "tagIds": "$tags" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', "$$tagIds"] },
                                            { $eq: ['$status', "active"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: 'tagDetails',
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { "authorId": "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'userDetails',
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        let: { "authorId": "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'adminDetails',
                    }
                },
                {
                    $addFields: {
                        "authorDetails" : {
                            $concatArrays: [ "$userDetails", "$adminDetails" ]
                        }
                    }
                },
                {
                    $unwind: { path: "$authorDetails", preserveNullAndEmptyArrays: true }
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                }
            ])

            blogs.count = await BlogModel.countDocuments({
                $expr: {
                    $and: [
                        { $in: [categoryId, '$category'] },
                        { $eq: ['$isDeleted', false] },
                    ],
                },
            });
            blogs.category = await CategoryRepo.retrieveSingleCategory(categoryId);
            return blogs;
        } catch (err) {
            console.error('Error in BlogRepo -> getBlogByCategory: ', err);
            throw err;
        }
    }

    async getBlogByTags(tagId, skip, limit) {
        try {
            let blogs = {}
            console.log('tagId', tagId);
            blogs.documents = await BlogModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $in: [tagId, '$tags'] },
                                { $eq: ['$isDeleted', false] },
                                { $eq: ['$isPrivate', false] },
                            ],
                        },
                    },
                },
                {
                    $sort: { publishAt: -1 },
                },
                {
                    $lookup: {
                        from: 'categories',
                        let: { "categoryIds": "$category" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', "$$categoryIds"] },
                                            { $eq: ['$isDeleted', false] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    name: 1,
                                }
                            }
                        ],
                        as: 'categoryDetails'
                    },
                },
                {
                    $lookup: {
                        from: 'tags',
                        let: { "tagIds": "$tags" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', "$$tagIds"] },
                                            { $eq: ['$status', "active"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: 'tagDetails',
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { "authorId": "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'userDetails',
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        let: { "authorId": "$author" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', "$$authorId"] },
                                            { $eq: ['$isDeleted', false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'adminDetails',
                    }
                },
                {
                    $addFields: {
                        "authorDetails" : {
                            $concatArrays: [ "$userDetails", "$adminDetails" ]
                        }
                    }
                },
                {
                    $unwind: { path: "$authorDetails", preserveNullAndEmptyArrays: true }
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                }
            ])

            blogs.count = await BlogModel.countDocuments({
                tags: { $in: [tagId] },
                isDeleted: false
            });
            blogs.tag = await TagsRepo.retrieveSingleTag(tagId);
            return blogs;
        } catch (err) {
            console.error('Error in BlogRepo -> getBlogByTags: ', err);
            throw err;
        }
    }

    async hasPermissionToEditOrDelete(blogId, userId) {
        try {
            const blog = await BlogModel.findOne({ _id: blogId, author: userId, isDeleted: false });
            if (blog) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error('Error in BlogRepo -> hasPermissionToEditOrDelete: ', err);
            throw err;
        }
    }

    async updateBlog(blogId, updatedData) {
        try {
            const updateBlog = await BlogModel.findOneAndUpdate({ _id: blogId }, updatedData,);
            return updateBlog;
        } catch (err) {
            console.error('Error in BlogRepo -> updateBlog: ', err);
            throw err;
        }
    }

    async deleteBlog(blogId, accountHolder) {
        try {
            const deleteBlog = await BlogModel.findOneAndUpdate({ _id: blogId }, { isDeleted: true, deletedBy: accountHolder }, { new: true });
            return deleteBlog;
        } catch (err) {
            console.error('Error in BlogRepo -> deleteBlog: ', err);
            throw err;
        }
    }

    async permanentDeleteBlog(blogId) {
        try {
            const deleteBlog = await BlogModel.deleteOne({ _id: blogId });
            return deleteBlog;
        } catch (err) {
            console.error('Error in BlogRepo -> permanentDeleteBlog: ', err);
            throw err;
        }
    }

    async getBlogTitleForSearch(serachKeyword, skip, limit) {
        try {
            const blogTitle = await BlogModel.find({ isDeleted: false, title: { $regex: serachKeyword, $options: 'i' } }, { title: 1, _id: 1 }).limit(limit).skip(skip);
            return blogTitle;
        } catch (err) {
            console.error('Error in BlogRepo -> getBlogTitleForSearch: ', err);
            throw err;
            
        }
    }

    async likeBlogPost(blogId, likeId, likesDislikesToDelete) {
        try {
            console.log("Like ID: ", likeId);
            console.log("Blog ID: ", blogId);
            const deleteLike = await BlogModel.findByIdAndUpdate(blogId, { $pull: { likes: { $in: likesDislikesToDelete }, dislikes: { $in: likesDislikesToDelete } } });
            console.log("deleteLike: ", deleteLike);
            const createLike = await BlogModel.findByIdAndUpdate(blogId, { $push: { likes: likeId } }, { new: true });
            console.log("createLike: ", createLike);
            return createLike;
        } catch (error) {
            console.error('Error in BlogRepo -> likeBlogPost: ', err);
            throw err;
        }
    }

    async dislikeBlogPost(blogId, dislikeId, likesDislikesToDelete) {
        try {
            console.log("Dislike ID: ", dislikeId);
            console.log("Blog ID: ", blogId);
            const deleteDislike = await BlogModel.findByIdAndUpdate(blogId, { $pull: { likes: { $in: likesDislikesToDelete }, dislikes: { $in: likesDislikesToDelete } } });
            console.log("deleteDislike: ", deleteDislike);
            const createLike = await BlogModel.findByIdAndUpdate(blogId, { $push: { dislikes: dislikeId } }, { new: true });
            console.log("createLike: ", createLike);
            return createLike;
        } catch (error) {
            console.error('Error in BlogRepo -> dislikeBlogPost: ', err);
            throw err;
        }
    }

    // Withdraw like from blog post
    async unlikeBlogPost(blogId, likeId) {
        try {
            console.log("Like ID: ", likeId);
            console.log("Blog ID: ", blogId);
            const unlikeBlog = BlogModel.findByIdAndUpdate(blogId, { $pull: { likes: likeId } }, { new: true })
            return unlikeBlog;
        } catch (error) {
            console.error('Error in BlogRepo -> unlikeBlogPost: ', err);
            throw err;
        }
    }

    //withdraw dislike from blog post
    async undislikeBlogPost(blogId, dislikeId) {
        try {
            console.log("Dislike ID: ", dislikeId);
            console.log("Blog ID: ", blogId);
            const undislikeBlog = await BlogModel.findByIdAndUpdate(blogId, { $pull: { dislikes: dislikeId } }, { new: true })
            console.log("undislikeBlog: ", undislikeBlog);
            return undislikeBlog;
        } catch (error) {
            console.error('Error in BlogRepo -> undislikeBlogPost: ', err);
            throw err;
        }
    }

    // Get likes per blog post of user for dashboard
    async getLikesPerBlogByUser(userId) {
        try {
            const likes = await BlogModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$author', userId] },
                                { $eq: ['$isDeleted', false] },
                            ],
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'likes',
                        let: { "likesIds": "$likes" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', "$$likesIds"] },
                                            { $eq: ['$likeType', "like"] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'likesDetails',
                    },
                },
                {
                    $lookup: {
                        from: 'likes',
                        let: { "dislikesIds": "$dislikes" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', "$$dislikesIds"] },
                                            { $eq: ['$likeType', "dislike"] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'dislikesDetails',
                    },
                },
                {
                    $project: {
                        likesDetails: 1,
                        dislikesDetails: 1,
                        likedCount: { $size: "$likesDetails" },
                        dislikedCount: { $size: "$dislikesDetails" },
                    },
                }
            ]);
            return likes;
        } catch (err) {
            console.error('Error in BlogRepo -> getLikesByBlogId: ', err);
            throw err;
        }
    };




    createFutureBlog = async (blogData) => {
        try {
            console.log("-----------------createFutureBlog From Repo---------------", blogData);

            const newFutureBlog = await FutureBlogModel.create(blogData);
            return newFutureBlog;
        } catch (err) {
            console.error('Error in BlogRepo -> createFutureBlog: ', err);
            throw err;
        }
    }

    async updateFutureBlog(blogId, updatedData) {
        try {
            const updateFutureBlog = await FutureBlogModel.findOneAndUpdate({ _id: blogId }, updatedData,);
            return updateFutureBlog;
        } catch (err) {
            console.error('Error in BlogRepo -> updateFutureBlog: ', err);
            throw err;
        }
    }

    async deleteFutureBlog(blogId) {
        try {
            const deleteFutureBlog = await FutureBlogModel.deleteOne({ _id: blogId });
            return deleteFutureBlog;
        } catch (err) {
            console.error('Error in BlogRepo -> deleteFutureBlog: ', err);
            throw err;
        }
    }

    // cron job to publish future blogs
    publishFutureBlogs = async () => {

        cron.schedule('* * * * *', async () => {
            console.log("hello, I'm cron");
            console.log("----------current time from Repo----------", new Date().toISOString());

            const futureBlogs = await FutureBlogModel.find({ publishAt: { $lte: new Date() }, isPublished: false, isDeleted: false });

            console.log("Future blogs", futureBlogs);

            if (futureBlogs.length > 0) {
                await Promise.all(futureBlogs.map(async (blog) => {
                    try {
                        const freshBlog = blog.toObject();
                        delete freshBlog._id;
                        freshBlog.isPublished = true;

                        const blogData = await this.createBlog(freshBlog);
                        console.log("Blog Data:", blogData);

                        if (blogData) {
                            console.log("1 Future Blog published successfully", blogData);
                        } else {
                            console.log("Failed to publish 1 blog", blogData);
                        }

                        await this.deleteFutureBlog(blog._id);
                    } catch (error) {
                        console.error("Error processing blog:", error);
                    }
                }));

            } else {
                console.log("No future blogs to publish");
            }
        });
    }
}

module.exports = new BlogRepo