const CommentRepo = require("../../../comments/repo/comment.repo");
const ReplyRepo = require("../../../commentReplies/repo/reply.repo");
const generalCMSRepo = require("../../../admin/cms/general/repo/generalCMS.repo");

class UserCommentsController {
    createComment = async (req, res) => {
        try {

            const user = req.user
            console.log("user from dashboard", user)
            if (!user) {
                req.flash("error", "You must be logged in to comment")
                return res.redirect("/loginPage")
            }
            
            const userId = user._id;
            const { blogId } = req.params;
            const { content } = req.body;

            if (!blogId) {
                req.flash("error", "Suspesious activity, please login again")
                return res.redirect("/loginPage")
            }

            if (!content) {
                req.flash("error", "Comment content is required")
                return res.redirect(`/blogDetails/${blogId}` )
            }

            const commentData = {
                content,
                blogId,
                userId,
            };

            const newComment = await CommentRepo.createComment(commentData);
            if (!newComment) {
                req.flash("error", "Comment cannot be created")
                return res.redirect(`/blogDetails/${blogId}` )
            }

            req.flash("success", "Comment created successfully")
            return res.redirect(`/blogDetails/${blogId}` )
        } catch (error) {
            console.error("Error in UserCommentsController -> createComment: ", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    removeComment = async (req, res) => {
        try {
            const user = req.user
            console.log("user from removeComment controller", user, req.params.commentId)
            if (!user) {
                req.flash("error", "You must be logged in to delete comment")
                return res.redirect("/loginPage")
            }

            let hasEligibility = false

            const checkUserEligibility = await CommentRepo.hasPermissionToDeleteComment(req.params.commentId, user._id)

            console.log('checkuserEligibility', checkUserEligibility);

            if (checkUserEligibility.length > 0) {
                if (checkUserEligibility[0].isAuthor || checkUserEligibility[0].isCommentOwner) {
                    hasEligibility = true
                }
            }
            if (user.role === "admin") {
                hasEligibility = true
            } 

            console.log("hasEligibility", hasEligibility);

            if (!hasEligibility) {
                req.flash("error", "You are not authorized to delete this comment")
                return res.redirect("/blogDetails/" + checkUserEligibility[0].blogDetails._id)
            }

            const deleteComment = await CommentRepo.deleteComment(req.params.commentId)
            if (!deleteComment) {
                req.flash("error", "Comment cannot be deleted")
                return res.redirect("/blogDetails/" + checkUserEligibility[0].blogDetails._id)
            }

            req.flash("success", "Comment deleted successfully")
            return res.redirect("/blogDetails/" + checkUserEligibility[0].blogDetails._id)
        } catch (error) {
            console.error("Error in UserCommentsController -> removeComment: ", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    replyComment = async (req, res) => {
        try {
            const user = req.user
            console.log("user from replyComment controller", user)
            if (!user) {
                req.flash("error", "You must be logged in to reply comment")
                return res.redirect("/loginPage")
            }

            console.log('req body and query from replyComment', req.body, req.query);

            const { content } = req.body
            const { blogId, commentId } = req.query
            if (!content) {
                req.flash("error", "Reply Content is required")
                return res.redirect("/blogDetails/" + blogId)
            }

            const replyData = {
                content,
                commentId,
                userId: user._id,
                blogId,
            };
            const reply = await ReplyRepo.createReply(replyData)
            if (!reply) {
                req.flash("error", "Cannot create reply")
                return res.redirect("/blogDetails/" + blogId)
            }

            const newReply = await CommentRepo.pushReplyId(commentId, reply._id);
            if (!newReply) {
                req.flash("error", "Reply cannot be created")
                return res.redirect("/blogDetails/" + blogId)
            }

            req.flash("success", "Reply created successfully")
            return res.redirect("/blogDetails/" + blogId)
        } catch (error) {
            console.error("Error in UserCommentsController -> replyComment: ", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    removeReply = async (req, res) => {
        try {
            const user = req.user
            console.log("user from removeReply controller", user)
            if (!user) {
                req.flash("error", "You must be logged in to reply comment")
                return res.redirect("/loginPage")
            }

            const { replyId, commentId, blogId } = req.query
            console.log('req query from removeReply', req.query);

            if (!replyId || !commentId || !blogId) {
                req.flash("error", "Suspesious activity, please login again")
                return res.redirect("/blogDetails/" + blogId)
            }

            let hasEligibility = false
            const checkUserEligibility = await ReplyRepo.hasPermissionToDeleteReply(user._id, replyId, blogId, commentId)
            console.log('checkuserEligibility', checkUserEligibility);
            
            if (checkUserEligibility.length > 0) {
                if (checkUserEligibility[0].isAuthor || checkUserEligibility[0].isCommentOwner || checkUserEligibility[0].isReplyOwner || user.role === "admin") {
                    hasEligibility = true
                }
            }

            console.log("hasEligibility", hasEligibility);

            if (!hasEligibility) {
                req.flash("error", "You are not authorized to delete this reply")
                return res.redirect("/blogDetails/" + blogId)
            }

            const deleteReply = await ReplyRepo.deleteReply(replyId)
            if (!deleteReply) {
                req.flash("error", "Reply cannot be deleted")
                return res.redirect("/blogDetails/" + blogId)
            }

            const deleteReplyFromComment = await CommentRepo.pullReplyId(commentId, replyId)
            if (!deleteReplyFromComment) {
                req.flash("error", "Reply cannot be deleted")
                return res.redirect("/blogDetails/" + blogId)
            }

            req.flash("success", "Reply deleted successfully")
            return res.redirect("/blogDetails/" + blogId)
            
        } catch (error) {
            console.error("Error in UserCommentsController -> removeReply: ", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    getUserComments = async (req, res) => {
        try {
            const user = req.user
            console.log("user from getAllComments controller", user)
            if (!user) {
                req.flash("error", "You must be logged in to see comments")
                return res.redirect("/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()
            const comments = await CommentRepo.getUserComments(user._id)
            if (!comments) {
                req.flash("error", "Comments cannot be retrieved")
                return res.redirect("/dashboard")
            }
            req.flash("success", "Comments retrieved successfully")
            console.log('comments from UserCommentsController -> getUserComments', comments, JSON.stringify(comments, null, 4));
            return res.render("pages/user/allCommentsByUserPage", { title: "Blogs that you commented", siteName: siteName?.title, favicon: siteName?.favicon, comments, user })
        } catch (error) {
            console.error("Error in UserCommentsController -> getAllComments: ", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new UserCommentsController