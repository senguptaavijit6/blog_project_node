const router = require("express").Router()
const FileUploader = require("../../helper/fileUploader")
const fileUploader = new FileUploader({folderName: "public/uploads/profile_picture/admin", supportedFiles: ["image/jpg", "image/jpeg", "image/png", "image/gif"], fileSize: 1024*1024*10})
const blogImageUploader = new FileUploader({folderName: "public/uploads/blog_image", supportedFiles: ["image/jpg", "image/jpeg", "image/png", "image/gif"], fileSize: 1024*1024*10})
const authentication = require("../../middlewares/authentication")()
const UserHomeController = require("../../modules/user/home/controller/home.controller")
const UserAuthController = require("../../modules/user/auth/controller/auth.controller")
const UserBlogsController = require("../../modules/user/blogs/controller/user.blog.controller")
const UserLikesController = require("../../modules/user/likes/controller/user.likes.controller")
const UserCommentsController = require("../../modules/user/comments/controller/user.comments.controller")
const UserCategoryController = require("../../modules/user/category/controller/user.category.controller")
const UserTagsController = require("../../modules/user/tags/controller/user.tags.controller")
const isEnabledUser = require("../../middlewares/isEnabledUser")

//========== Auth routes ==========
router.get("/", authentication.softAuthenticate, UserHomeController.homePage)
router.get("/aboutUs", authentication.softAuthenticate, UserHomeController.aboutUsPage)
router.get("/contactUs", authentication.softAuthenticate, UserHomeController.contactUsPage)
router.get("/terms", authentication.softAuthenticate, UserHomeController.termsPage)
router.get("/privacyPolicy", authentication.softAuthenticate, UserHomeController.privacyPolicyPage)
router.post("/sendMessage", authentication.softAuthenticate, UserHomeController.sendMessageViaEmail)
router.get("/registerPage", UserAuthController.registerPage)
router.post("/register", fileUploader.upload.single("image"), UserAuthController.register)
router.get("/verifyEmailPage/:email", UserAuthController.verifyEmailPage)
router.post("/verifyEmail/:email", UserAuthController.verifyEmail)
router.get("/loginPage", UserAuthController.loginPage)
router.post("/login", UserAuthController.login)
router.post("/loginUsingOTP", UserAuthController.loginUsingOTP)
router.get("/forgotPasswordPage", UserAuthController.forgotPasswordPage)
router.post("/forgotPasswordOTPPage", UserAuthController.forgotPasswordOTPPage)
router.post("/forgotPasswordOTPVerifyPage", UserAuthController.forgotPasswordOTPVerification)
router.get("/changePasswordUsingOTPPage/:email/:otp", UserAuthController.changePasswordUsingOTPPage)
router.post("/changePasswordUsingOTP", UserAuthController.changePasswordUsingOTP)
router.get("/changePasswordUsingPasswordPage", authentication.authenticate, UserAuthController.changePasswordUsingPasswordPage)
router.post("/changePasswordUsingPassword", authentication.authenticate, UserAuthController.changePasswordUsingPassword)
router.get("/verifyEmailToUpdateDetailsPage", authentication.authenticate, UserAuthController.verifyEmailToUpdateDetailsPage)
router.post("/verifyEmailToUpdateDetails", authentication.authenticate, UserAuthController.verifyEmailToUpdateDetails)
router.get("/logout", authentication.authenticate, UserAuthController.logout)

//========== Dashboard and Pages other than Auth ==========
router.get("/dashboard", authentication.authenticate, UserBlogsController.dashboard)
router.get("/settings", authentication.authenticate, UserAuthController.redirectToAccountSettingsPage)
router.get("/settings/account", authentication.authenticate, UserAuthController.accountSettingsPage)
router.get("/changeImagePage", authentication.authenticate, UserAuthController.changeImagePage)
router.post("/changeImage", fileUploader.upload.single("image"), authentication.authenticate, UserAuthController.changeImage)
router.get("/updateDetailsPage", authentication.authenticate, UserAuthController.updateDetailsPage)
router.post("/updateDetails", authentication.authenticate, UserAuthController.updateDetails)
router.get("/settings/site", authentication.authenticate, UserAuthController.siteSettingsPage)
router.post("/updateSiteDetails", authentication.authenticate, UserAuthController.updateSiteDetails)

// ========== Blogs ==========
router.get("/createBlogPage", authentication.authenticate, isEnabledUser, UserBlogsController.createBlogPage)
router.post("/createBlog", blogImageUploader.upload.single("image"), authentication.authenticate, isEnabledUser, UserBlogsController.createBlog)
router.get("/deleteBlog/:id", authentication.authenticate, UserBlogsController.deleteBlogById)
router.get("/blogDetails/:id", authentication.softAuthenticate, UserBlogsController.singleBlog)
router.get("/blogs", authentication.softAuthenticate, UserBlogsController.getAllBlogs)

// ========== Likes ==========
router.get("/likeBlog/:id", authentication.authenticate, isEnabledUser, UserLikesController.createLike)
router.get("/withdrawLikeBlog/:id", authentication.authenticate, isEnabledUser, UserLikesController.withdrawLike)
router.get("/dislikeBlog/:id", authentication.authenticate, isEnabledUser, UserLikesController.createDislike)
router.get("/withdrawDislikeBlog/:id", authentication.authenticate, isEnabledUser, UserLikesController.withdrawDislike)
router.get("/getUserLikes", authentication.authenticate, UserLikesController.getUserLikes)
router.get("/getUserDislikes", authentication.authenticate, UserLikesController.getUserDislikes)

// ========== Comments ==========
router.post("/createComment/:blogId", authentication.authenticate, isEnabledUser, UserCommentsController.createComment)
router.get("/removeComment/:commentId", authentication.authenticate, isEnabledUser, UserCommentsController.removeComment)
router.post("/replyComment", authentication.authenticate, isEnabledUser, UserCommentsController.replyComment)
router.get("/removeReply", authentication.authenticate, isEnabledUser, UserCommentsController.removeReply)
router.get("/getUserComments", authentication.authenticate, UserCommentsController.getUserComments)

// ========== Categories ==========
router.get("/getAllCategoriesWithPagination", authentication.softAuthenticate, UserCategoryController.getAllCategories)
router.get("/getBlogsByCategory/:categoryId", authentication.softAuthenticate, UserBlogsController.getBlogsByCategory)

// ========== Tags ==========
router.get("/getAllTagsWithPagination", authentication.softAuthenticate, UserTagsController.getAllTags)
router.get("/getBlogsByTag/:tagId", authentication.softAuthenticate, UserBlogsController.getBlogsByTag)

// ========== Search ==========
router.post("/search", authentication.softAuthenticate, UserBlogsController.searchBlog)



module.exports = router