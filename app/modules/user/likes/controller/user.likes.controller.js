const generalCMSRepo = require("../../../admin/cms/general/repo/generalCMS.repo");
const BlogRepo = require("../../../blogs/repo/blog.repo");
const LikeRepo = require("../../../likes/repo/like.repo")


class UserLikesController {
    createLike = async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }
            const userId = user._id;
            const blogId = req.params.id;

            const like = await LikeRepo.createLikeDislike({
                userId,
                blogId,
                likeType: "like"
            })
            if (!like) {
                req.flash("error", "Unable to create like")
                return res.redirect(`/blogDetails/${blogId}`)
            }

            console.log("is Like created successfully: ", like);

            const likeDislikeDetailsByUserId = await LikeRepo.getLikeDislikeByBlogIdByUserId(blogId, userId)
            console.log("****************likeDislikeDetailsByUserId: \n", likeDislikeDetailsByUserId);

            // Add the like to the blog post
            const likeBlog = await BlogRepo.likeBlogPost(blogId, like._id, likeDislikeDetailsByUserId)
            if (!likeBlog) {
                req.flash("error", "Unable to like the blog")
                return res.redirect(`/blogDetails/${blogId}`)
            }
            console.log("is Like created in blog successfully: ", likeBlog);

            req.flash("success", "You successfully liked the blog")
            return res.redirect(`/blogDetails/${blogId}`)
        } catch (error) {
            console.error("Error in UserBlogsController -> getAllBlogsByUser: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    withdrawLike = async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }
            const userId = user._id;
            const blogId = req.params.id;

            const unlike = await LikeRepo.deleteLikeDislike(userId, blogId)
            console.log("is Like withdrawn successfully: ", unlike);

            if (!unlike) {
                req.flash("error", "Unable to withdraw like")
                return res.redirect(`/blogDetails/${blogId}`)
            }

            // Remove the like from the blog post
            const unlikeBlog = await BlogRepo.unlikeBlogPost(blogId, unlike._id)
            if (!unlikeBlog) {
                req.flash("error", "Unable to unlike the blog")
                return res.redirect(`/blogDetails/${blogId}`)
            }

            req.flash("success", "like withdrawn successfully")
            console.log("is Like withdrawn in blog successfully: ", unlikeBlog);
            return res.redirect(`/blogDetails/${blogId}`)

        } catch (error) {
            console.error("Error in UserBlogsController -> withdrawLike: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    createDislike = async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }
            const userId = user._id;
            const blogId = req.params.id;

            const dislike = await LikeRepo.createLikeDislike({
                userId,
                blogId,
                likeType: "dislike"
            })
            if (!dislike) {
                req.flash("error", "Unable to create dislike")
                return res.redirect(`/blogDetails/${blogId}`)
            }

            console.log("is Dislike created successfully: ", dislike);

            const likeDislikeDetailsByUserId = await LikeRepo.getLikeDislikeByBlogIdByUserId(blogId, userId)
            console.log("****************likeDislikeDetailsByUserId: \n", likeDislikeDetailsByUserId);

            // Add the like to the blog post
            const dislikeBlog = await BlogRepo.dislikeBlogPost(blogId, dislike._id, likeDislikeDetailsByUserId)
            if (!dislikeBlog) {
                req.flash("error", "Unable to dislike the blog")
                return res.redirect(`/blogDetails/${blogId}`)
            }
            console.log("is Dislike created in blog successfully: ", dislikeBlog);

            req.flash("success", "You successfully disliked the blog")
            return res.redirect(`/blogDetails/${blogId}`)
        } catch (error) {
            console.error("Error in UserBlogsController -> createDislike: ", error);
            res.status(500).json({ message: "Internal Server Error" });

        }
    }

    withdrawDislike = async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }
            const userId = user._id;
            const blogId = req.params.id;

            const unlike = await LikeRepo.deleteLikeDislike(userId, blogId)
            console.log("is Like withdrawn successfully: ", unlike);

            if (!unlike) {
                req.flash("error", "Unable to withdraw like")
                return res.redirect(`/blogDetails/${blogId}`)
            }

            // Remove the like from the blog post
            const unlikeBlog = await BlogRepo.undislikeBlogPost(blogId, unlike._id)
            if (!unlikeBlog) {
                req.flash("error", "Unable to unlike the blog")
                return res.redirect(`/blogDetails/${blogId}`)
            }

            req.flash("success", "dislike withdrawn successfully")
            console.log("is Like withdrawn in blog successfully: ", unlikeBlog);
            return res.redirect(`/blogDetails/${blogId}`)

        } catch (error) {
            console.error("Error in UserBlogsController -> withdrawLike: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    getUserLikes = async (req, res) => {
        try {
            const user = req.user
            console.log("user from getUserLikes controller", user)
            if (!user) {
                req.flash("error", "You must be logged in to see likes")
                return res.redirect("/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()
            const likes = await LikeRepo.getUserLikes(user._id)
            if (!likes) {
                req.flash("error", "likes cannot be retrieved")
                return res.redirect("/dashboard")
            }
            req.flash("success", "Likes retrieved successfully")
            console.log('likes from UserLikesController -> getUserLikes', likes, JSON.stringify(likes, null, 4));
            return res.render("pages/user/allLikesByUserPage", { title: "Blogs that you liked", siteName: siteName?.title, favicon: siteName?.favicon, likes, user })
        } catch (error) {
            console.error("Error in UserLikesController -> getUserLikes: ", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    getUserDislikes = async (req, res) => {
        try {
            const user = req.user
            console.log("user from getUserLikes controller", user)
            if (!user) {
                req.flash("error", "You must be logged in to see dislikes")
                return res.redirect("/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()
            const dislikes = await LikeRepo.getUserDislikes(user._id)
            if (!dislikes) {
                req.flash("error", "dislikes cannot be retrieved")
                return res.redirect("/dashboard")
            }
            req.flash("success", "dislikes retrieved successfully")
            console.log('dislikes from UserLikesController -> getUserLikes', dislikes, JSON.stringify(dislikes, null, 4));
            return res.render("pages/user/allDislikesByUserPage", { title: "Blogs that you disliked", siteName: siteName?.title, favicon: siteName?.favicon, dislikes, user })
        } catch (error) {
            console.error("Error in UserLikesController -> getUserLikes: ", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new UserLikesController()