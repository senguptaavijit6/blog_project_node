const CategoryRepo = require("../../../admin/category/repository/category.repo");
const TagsRepo = require("../../../admin/tags/repository/tags.repo");
const BlogsRepo = require("../../../blogs/repo/blog.repo")
const mongoose = require("mongoose");
const likeRepo = require("../../../likes/repo/like.repo");
const CommentRepo = require("../../../comments/repo/comment.repo");
const generalCMSRepo = require("../../cms/general/repo/generalCMS.repo");

class AdminBlogsController {
    convertToUserCurrentTime = (userTimezone) => {
        console.log("userTimezone from convertToUserTime:", userTimezone);


        const gmt = userTimezone.match(/\(GMT([+-]\d{2}:\d{2})\)/)[1];
        console.log("Extracted GMT from convertToUserTime:", gmt);

        // Current UTC time
        const nowUTC = new Date();

        // GMT offset into milliseconds
        const [hours, minutes] = gmt.split(":").map(time => Number(time));
        const userOffsetMilliseconds = (hours * 60 + minutes) * 60000;

        // user's local time
        const userCurrentTime = new Date(nowUTC.getTime() + userOffsetMilliseconds);
        console.log("Final userTime from convertToUserCurrentTime:", userCurrentTime);

        return userCurrentTime;
    }

    // for mongodb
    convertPublishATLocalToUTCTime = (publishAt, userTimezone) => {

        const localISODateTime = `${publishAt[0]}T${publishAt[1]}`;
        console.log("localISODateTime from convertPublishATLocalToUTCTime:", localISODateTime);
        console.log("userTimezone from convertPublishATLocalToUTCTime:", userTimezone);

        // Parse GMT offset
        const gmt = userTimezone.match(/\(GMT([+-]\d{2}:\d{2})\)/)[1];
        console.log("Extracted GMT from convertPublishATLocalToUTCTime:", gmt);
        const offsetSign = gmt.startsWith('-') ? -1 : 1;
        const [hours, minutes] = gmt.slice(1).split(':').map(Number);
        console.log("hours and minutes from convertPublishATLocalToUTCTime:", hours, minutes);
        const offsetInMinutes = offsetSign * (hours * 60 + minutes);

        // Date object from the local ISO string
        const localDateObj = new Date(localISODateTime);
        console.log("localDateObj from convertPublishATLocalToUTCTime:", localDateObj);

        // Converting to UTC
        const utcTime = new Date(localDateObj.getTime() - offsetInMinutes * 60000 - localDateObj.getTimezoneOffset() * 60000);

        console.log("UTC time from convertPublishATLocalToUTCTime:", utcTime);

        return utcTime;
    };

    // for comparison with the current time (NO LONGER NEEDED) 
    convertUTCTimeToLocal = (UTCTime, userGMT) => {
        const offsetSign = userGMT.startsWith('-') ? -1 : 1;
        const [hours, minutes] = userGMT.slice(1).split(':').map(Number);
        const offsetInMinutes = offsetSign * (hours * 60 + minutes);

        // Convert offset to milliseconds and adjust UTC time
        const localTime = new Date(UTCTime.getTime() + offsetInMinutes * 60000);
        console.log("localTime from convertUTCTimeToLocal:", localTime);

        return localTime;
    };

    // for comparison with the current time
    getCurrentUTCTime = () => {
        const currentUTC = new Date().toISOString();
        return currentUTC;
    }

    createBlogPage = async (req, res) => {
        try {
            const user = req.user;
            if (!user || user.role !== "admin") {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }
            console.log("admin from createBlogPage", user);
            const siteName = await generalCMSRepo.retrieve()

            let gmt = user.timezone.split("~")[0].slice(1)

            const date = new Date()
            const utc = date.getTime() + date.getTimezoneOffset() * 60000

            const [hours, minutes] = gmt.split(":").map(Number)
            const offsetMilliseconds = (hours * 60 + minutes) * 60000


            const userTime = new Date(utc + offsetMilliseconds)
            console.log("userTime from createBlogPage", userTime);

            const categories = await CategoryRepo.retrieveAllCategories()
            const tags = await TagsRepo.retrieveAllTags()

            return res.render("pages/admin/blog/createBlogPage", {
                title: "Create Blog",
                user,
                categories,
                siteName: siteName?.title, favicon: siteName?.favicon, 
                tags,
                userTime,
            })
        } catch (error) {
            console.error("Error in AdminBlogsController -> createBlogPage: ", error);
            res.status(500).json({ message: "Internal Server Error" });

        }
    }

    createBlog = async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }

            req.body.GMT = user.timezone.match(/\(GMT([+-]\d{2}:\d{2})\)/)[1]


            console.log("req.body: ", req.body);
            console.log("req.file: ", req.file);

            if (!req.file) {
                req.flash("error", "Blog image is required")
                return res.redirect("/admin/createBlogPage")
            }

            req.body.image = req.file.filename

            if (!req.body.title) {
                req.flash("error", "Blog title is required")
                return res.redirect("/admin/createBlogPage")
            }

            if (!req.body.content) {
                req.flash("error", "Blog content is required")
                return res.redirect("/admin/createBlogPage")
            }

            if (!req.body.author) {
                req.flash("error", "unauthorized access, please login to create blog")
                return res.redirect("/admin/createBlogPage")
            }

            if (!req.body.authorRole) {
                req.flash("error", "unauthorized access, please login to create blog")
                return res.redirect("/admin/createBlogPage")
            }

            if (!req.body.category) {
                req.flash("error", "Blog category is required")
                return res.redirect("/admin/createBlogPage")
            }

            if (!req.body.tags) {
                req.flash("error", "Blog tags is required")
                return res.redirect("/admin/createBlogPage")
            }

            // convert the published at input into a valid date object
            if (req.body.isFuturePublish) {
                const UTCTime = this.convertPublishATLocalToUTCTime(req.body.publishAt, req.user.timezone)
                console.log("publishAt", UTCTime);

                req.body.publishAt = UTCTime
            }

            // const userTime = this.convertToUserCurrentTime(user.timezone)
            const currentUTCTime = this.getCurrentUTCTime()

            console.log("everything is ok", req.body);
            console.log("===========================================", req.body.category)

            if (Array.isArray(req.body.category)) {
                req.body.category = req.body.category.map(id => new mongoose.Types.ObjectId(id))
            }

            if (Array.isArray(req.body.tags)) {
                req.body.tags = req.body.tags.map(id => new mongoose.Types.ObjectId(id))
            }

            console.log("request body after parsing", req.body, "publish time and user's current time", req.body.publishAt, new Date(currentUTCTime));

            if (req.body.publishAt > new Date(currentUTCTime)) {
                console.log("future blog creation")
                req.body.isPublished = false
                const blog = await BlogsRepo.createFutureBlog(req.body, user.timezone)
                if (blog) {
                    req.flash("success", "Blog for future created successfully")
                    return res.redirect("/admin/")
                } else {
                    req.flash("error", "Failed to create blog for future")
                    return res.redirect("/admin/createBlogPage")
                }
            } else {
                console.log("normal blog creation")
                req.body.isPublished = true
                const blog = await BlogsRepo.createBlog(req.body)
                if (blog) {
                    req.flash("success", "Blog created successfully")
                    return res.redirect("/admin/")
                } else {
                    req.flash("error", "Failed to create blog")
                    return res.redirect("/admin/createBlogPage")
                }
            }
        } catch (error) {
            console.error("Error in AdminBlogsController -> createBlog: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    dashboard = async (req, res) => {
        try {
            const user = req.user
            console.log("user from dashboard", user)
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")

            }
            const siteName = await generalCMSRepo.retrieve()

            let gmt = user.timezone.split("~")[0].slice(1)

            const date = new Date()
            const utc = date.getTime() + date.getTimezoneOffset() * 60000

            const [hours, minutes] = gmt.split(":").map(Number)
            const offsetMilliseconds = (hours * 60 + minutes) * 60000


            const userTime = new Date(utc + offsetMilliseconds)

            const blogsData = await BlogsRepo.getAllBlogsWithoutPagination()
            console.log("=======getAllBlogsForAdminDashboard=======\n", blogsData, "\n", JSON.stringify(blogsData, null, 4), "\n===================================");

            // const likes = await BlogsRepo.getLikesPerBlogByUser(user._id)
            // console.log("likes", likes, JSON.stringify(likes, null, 4));

            // return res.send({
            //     user, userTime, blogsData,
            // })

            return res.render("pages/admin/dashboard", { title: "Admin Dashboard", siteName: siteName?.title, favicon: siteName?.favicon, user, userTime, blogsData })

        } catch (error) {
            console.error("Error in AdminBlogsController -> getAllBlogsByUser: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async deleteBlogById(req, res) {
        try {
            const user = req.user;
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }
            const isBlogAvaiable = await BlogsRepo.getBlogById(req.params.id)
            if (!isBlogAvaiable) {
                req.flash("error", "Invalid blog details, Blog may be deleted")
                return res.redirect("/admin/getAllBlogsByUserPage")
            }
            const hasPermission = false
            if (user.role === "admin") {
                hasPermission = true
            } else if (user.role !== "admin") {
                hasPermission = await BlogsRepo.hasPermissionToEditOrDelete(req.params.id, user._id)
            }

            if (!hasPermission) {
                req.flash("error", "you don't have permission to delete this blog")
                return res.redirect("/admin/getAllBlogsByUserPage")
            }


            const deleteBlogResponse = await BlogsRepo.deleteBlog(req.params.id, user._id)
            if (!deleteBlogResponse) {
                req.flash("error", "Blog couldn't be deleted, try again")
                return res.redirect("/admin/getAllBlogsByUserPage")
            }
            req.flash("success", "Blog deleted successfully")
            return res.redirect("/admin/getAllBlogsByUserPage")
        } catch (error) {
            console.error("Error in AdminBlogsController -> deleteBlogById: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async editBlogPage(req, res) {
        try {
            const user = req.user;
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            let gmt = user.timezone.split("~")[0].slice(1)

            const date = new Date()
            const utc = date.getTime() + date.getTimezoneOffset() * 60000
            const [hours, minutes] = gmt.split(":").map(Number)
            const offsetMilliseconds = (hours * 60 + minutes) * 60000
            const userTime = new Date(utc + offsetMilliseconds)



            const categories = await CategoryRepo.retrieveAllCategories()
            const tags = await TagsRepo.retrieveAllTags()


            const isBlogAvaiable = await BlogsRepo.getBlogById(req.params.id)
            console.log("isBlogAvaiable from AdminBlogsController -> editBlogPage", isBlogAvaiable, categories, tags);
            if (!isBlogAvaiable) {
                req.flash("error", "Invalid blog details, Blog may be deleted")
                return res.redirect("/admin/")
            }
            let hasPermission = false
            if (user.role === "admin") {
                hasPermission = true
            } else if (user.role !== "admin") {
                hasPermission = await BlogsRepo.hasPermissionToEditOrDelete(req.params.id, user._id)
            }

            if (!hasPermission) {
                req.flash("error", "you don't have permission to delete this blog")
                return res.redirect("/admin/")
            }


            return res.render("pages/admin/blog/editBlogPage", { title: "Edit Blog Page", siteName: siteName?.title, favicon: siteName?.favicon, user, userTime, categories, tags, blogData: isBlogAvaiable })
        } catch (error) {
            console.error("Error in AdminBlogsController -> editBlogPage: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
    
    editBlog = async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }

            req.body.GMT = user.timezone.match(/\(GMT([+-]\d{2}:\d{2})\)/)[1]


            console.log("req.body: ", req.body);
            console.log("req.file: ", req.file);

            if (!req.file) {
                req.flash("error", "Blog image is required")
                return res.redirect("/admin/createBlogPage")
            }

            req.body.image = req.file.filename

            if (!req.body.title) {
                req.flash("error", "Blog title is required")
                return res.redirect("/admin/createBlogPage")
            }

            if (!req.body.content) {
                req.flash("error", "Blog content is required")
                return res.redirect("/admin/createBlogPage")
            }

            if (!req.body.author) {
                req.flash("error", "unauthorized access, please login to create blog")
                return res.redirect("/admin/createBlogPage")
            }

            if (!req.body.authorRole) {
                req.flash("error", "unauthorized access, please login to create blog")
                return res.redirect("/admin/createBlogPage")
            }

            if (!req.body.category) {
                req.flash("error", "Blog category is required")
                return res.redirect("/admin/createBlogPage")
            }

            if (!req.body.tags) {
                req.flash("error", "Blog tags is required")
                return res.redirect("/admin/createBlogPage")
            }

            // convert the published at input into a valid date object
            if (req.body.isFuturePublish) {
                const UTCTime = this.convertPublishATLocalToUTCTime(req.body.publishAt, req.user.timezone)
                console.log("publishAt", UTCTime);

                req.body.publishAt = UTCTime
            }

            // const userTime = this.convertToUserCurrentTime(user.timezone)
            const currentUTCTime = this.getCurrentUTCTime()

            console.log("everything is ok", req.body);
            console.log("===========================================", req.body.category)

            if (Array.isArray(req.body.category)) {
                req.body.category = req.body.category.map(id => new mongoose.Types.ObjectId(id))
            }

            if (Array.isArray(req.body.tags)) {
                req.body.tags = req.body.tags.map(id => new mongoose.Types.ObjectId(id))
            }

            console.log("request body after parsing", req.body, "publish time and user's current time", req.body.publishAt, new Date(currentUTCTime));

            if (req.body.publishAt > new Date(currentUTCTime)) {
                console.log("future blog creation")
                req.body.isPublished = false
                const blog = await BlogsRepo.createFutureBlog(req.body, user.timezone)
                if (blog) {
                    req.flash("success", "Blog for future created successfully")
                    return res.redirect("/admin/")
                } else {
                    req.flash("error", "Failed to create blog for future")
                    return res.redirect("/admin/createBlogPage")
                }
            } else {
                console.log("normal blog creation")
                req.body.isPublished = true
                const blog = await BlogsRepo.createBlog(req.body)
                if (blog) {
                    req.flash("success", "Blog created successfully")
                    return res.redirect("/admin/")
                } else {
                    req.flash("error", "Failed to create blog")
                    return res.redirect("/admin/createBlogPage")
                }
            }
        } catch (error) {
            console.error("Error in AdminBlogsController -> createBlog: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async singleBlog(req, res) {
        try {
            const user = req.user || false;
            const siteName = await generalCMSRepo.retrieve()
            // if (!user) {
            //     req.flash("error", "Unauthorized access, please login")
            //     return res.redirect("/loginPage")
            // }

            console.log("req.params.id for singleBlog", req.params.id);

            let id = req.params.id

            id = new mongoose.Types.ObjectId(id)

            const blogResponse = await BlogsRepo.getBlogById(id)
            if (!blogResponse) {
                req.flash("error", "Blog not found, may be deleted by admin")
                return res.redirect("/admin/")
            }

            console.log("blogResponse from signleBlog", JSON.stringify(blogResponse, null, 4));
            let isLikedByThisUser = undefined
            let isDislikedByThisUser = undefined

            if (user) {
                isLikedByThisUser = blogResponse.totalLikes.find(like => like.userId.toString() === user._id.toString() && like.likeType === "like")
                console.log("isLikedByThisUser", isLikedByThisUser);
                isDislikedByThisUser = blogResponse.totalDislikes.find(dislike => dislike.userId.toString() === user._id.toString() && dislike.likeType === "dislike")
                console.log("isDislikedByThisUser", isDislikedByThisUser);
            }

            // const likes = await likeRepo.getLikesByPostId(id)
            // console.log("likes", likes);

            // return res.send({
            //     blogResponse
            // })

            return res.render("pages/user/blog/singleBlogPage", { title: "Blog Details", siteName: siteName?.title, favicon: siteName?.favicon, user, blogResponse, isLikedByThisUser, isDislikedByThisUser })

        } catch (error) {
            console.error("Error in AdminBlogsController -> singleBlog: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async getAllPrivateBlogs(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== "admin") {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            let gmt = user.timezone.split("~")[0].slice(1)

            const date = new Date()
            const utc = date.getTime() + date.getTimezoneOffset() * 60000

            const [hours, minutes] = gmt.split(":").map(Number)
            const offsetMilliseconds = (hours * 60 + minutes) * 60000


            const userTime = new Date(utc + offsetMilliseconds)

            const blogsData = await BlogsRepo.getAllPrivateBlogs(user._id)
            console.log("blogsData from getAllPrivateBlogs", JSON.stringify(blogsData, null, 4));
            if (!blogsData) {
                req.flash("error", "No private blogs found")
                return res.redirect("/admin/")                
            }

            return res.render("pages/admin/dashboard", { title: "Private Blogs", siteName: siteName?.title, favicon: siteName?.favicon, user, userTime, blogsData })
        } catch (error) {
            console.error("Error in AdminBlogsController -> getAllPrivateBlogs: ", error);
            res.status(500).json({ message: "Internal Server Error" });            
        }
    }

    async getAllFutureBlogs(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== "admin") {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            let gmt = user.timezone.split("~")[0].slice(1)

            const date = new Date()
            const utc = date.getTime() + date.getTimezoneOffset() * 60000

            const [hours, minutes] = gmt.split(":").map(Number)
            const offsetMilliseconds = (hours * 60 + minutes) * 60000


            const userTime = new Date(utc + offsetMilliseconds)

            const blogsData = await BlogsRepo.getAllFutureBlogs()
            console.log("blogsData from getAllPrivateBlogs", JSON.stringify(blogsData, null, 4));
            if (!blogsData) {
                req.flash("error", "No private blogs found")
                return res.redirect("/admin/")                
            }

            return res.render("pages/admin/dashboard", { title: "Private Blogs", siteName: siteName?.title, favicon: siteName?.favicon, user, userTime, blogsData })
        } catch (error) {
            console.error("Error in AdminBlogsController -> getAllPrivateBlogs: ", error);
            res.status(500).json({ message: "Internal Server Error" });            
        }
    }

    async getBlogsByCategory(req, res) {
        try {
            const user = req.user || false;
            const siteName = await generalCMSRepo.retrieve()
            console.log('req params from UserBlogController -> getBlogsByCategory', req.params);

            let { categoryId } = req.params
            categoryId = new mongoose.Types.ObjectId(categoryId)
            const { page, limit } = req.query.page && req.query.limit ? req.query : { page: 1, limit: 10 }
            console.log('page and limit', page, limit);
            let skip = (page - 1) * limit


            const blogs = await BlogsRepo.getBlogByCategory(categoryId, skip, limit)
            console.log("blogs by category", JSON.stringify(blogs, null, 4));

            if (!blogs) {
                req.flash("error", "No blogs found for this category, may be deleted by admin")
                return res.redirect("/")
            }

            return res.render("pages/user/blog/blogListPage", { title: "Blogs By Category", siteName: siteName?.title, favicon: siteName?.favicon, user, blogs, categoryId, page, limit, skip })
        } catch (error) {
            console.error("Error in AdminBlogsController -> getBlogsByCategory: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async getBlogsByTag(req, res) {
        try {
            const user = req.user || false;
            const siteName = await generalCMSRepo.retrieve()
            console.log('req params from UserBlogController -> getBlogsByTag', req.params);

            let { tagId } = req.params
            tagId = new mongoose.Types.ObjectId(tagId)
            const { page, limit } = req.query.page && req.query.limit ? req.query : { page: 1, limit: 10 }
            console.log('page and limit', page, limit);
            let skip = (page - 1) * limit


            const blogs = await BlogsRepo.getBlogByTags(tagId, skip, limit)
            console.log("blogs by tags", JSON.stringify(blogs, null, 4));

            if (!blogs) {
                req.flash("error", "No blogs found for this category, may be deleted by admin")
                return res.redirect("/")
            }

            return res.render("pages/user/blog/blogListPage", { title: "Blogs By Category", siteName: siteName?.title, favicon: siteName?.favicon, user, blogs, tagId, page, limit, skip })
        } catch (error) {
            console.error("Error in AdminBlogsController -> getBlogsByTag: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async searchBlog(req, res) {
        try {
            const user = req.user || false;
            const siteName = await generalCMSRepo.retrieve()

            const searchSlug = req.body.searchSlug
            console.log("searchSlug from searchBlog", searchSlug);
            if (!searchSlug) {
                req.flash("error", "Search keyword is required")
                return res.redirect("/")
            }
            const { page, limit } = req.query.page && req.query.limit ? req.query : { page: 1, limit: 10 }
            console.log('page and limit', page, limit);
            let skip = (page - 1) * limit

            const searchKeywords = searchSlug.split(" ").join("|")
            console.log("search from searchBlog", searchKeywords);


            const data = {}
            data.blogTitles = await BlogsRepo.getBlogTitleForSearch(searchKeywords, skip, limit)
            data.blogCategories = await CategoryRepo.retrieveCategoriesForSearchWithPagination(searchKeywords, skip, limit)
            data.blogTags = await TagsRepo.retrieveTagsForSearchWithPagination(searchKeywords, skip, limit)
            console.log("blogs from searchBlog", JSON.stringify(data, null, 4));

            if (data.blogTitles.length === 0 && data.blogCategories.length === 0 && data.blogTags.length === 0) {
                req.flash("error", "No blogs found for this search")
                return res.redirect("/")
            }

            let blogs = []
            let categories = []
            let tags = []

            if (data.blogTitles.length > 0) {
                blogs = await BlogsRepo.getBlogsByIds(data.blogTitles.map(blog => blog._id))
                console.log("blogs from searchBlog", JSON.stringify(blogs, null, 4));
            }
            if (data.blogCategories.length > 0) {
                categories = await CategoryRepo.getCategoriesByIds(data.blogCategories.map(category => category._id))
                console.log("categories from searchBlog", JSON.stringify(categories, null, 4));
            }
            if (data.blogTags.length > 0) {
                tags = await TagsRepo.getTagsByIds(data.blogTags.map(tag => tag._id))
                console.log("tags from searchBlog", JSON.stringify(tags, null, 4));
            }

            return res.render("pages/user/blog/searchResultPage", { title: "Search Blog", siteName: siteName?.title, favicon: siteName?.favicon, user, blogs, categories, tags, searchSlug, page, limit, skip })


        } catch (error) {
            console.error("Error in AdminBlogsController -> searchBlog: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async getAllComments(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                req.flash("error", "Unauthorize access, please login")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()
            const page = req.query.page || 1
            const limit = req.query.limit || 10
            const skip = (page - 1) * limit
            const blogs = await CommentRepo.getAllComments(skip, limit)
            if (!blogs) {
                req.flash("error", "Could not get comments, try again")
                return res.redirect("/admin/")
            }

            // return res.send({
            //     data: blogs
            // })

            return res.render("pages/admin/allCommentsPage", {title: "All Comments Page", siteName: siteName?.title, favicon: siteName?.favicon, user, blogs, page, limit})
            
        } catch (error) {
            console.error("Error in AdminBlogsController -> getAllComments: ", error);
            res.status(500).json({ message: "Internal Server Error" });            
        }
    }
}

module.exports = new AdminBlogsController