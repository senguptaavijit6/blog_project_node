const CategoryRepo = require("../../../admin/category/repository/category.repo");
const generalCMSRepo = require("../../../admin/cms/general/repo/generalCMS.repo");

class UserCategoryController {
    async getAllCategories(req, res) {
        try {
            const user = req.user || false;
            const siteName = await generalCMSRepo.retrieve()
            const { page, limit } = req.query.page && req.query.limit ? req.query : { page: 1, limit: 10 } // there is also a value in the pages, consider that also
            console.log('page and limit', page, limit);
            let skip = (page - 1) * limit
            const categories = await CategoryRepo.retrieveAllCategoriesWithPagination(skip, limit)
            console.log('categories from UserCategoryController -> getAllCategories', categories);
            if (!categories) {
                req.flash("error", "Something went wrong please try again later")
                return res.redirect("/")
            }

            return res.render("pages/user/blog/categoryListPage", {
                title: "All Categories",
                siteName: siteName?.title, favicon: siteName?.favicon, 
                categories,
                user,
                page: parseInt(page),
                limit: parseInt(limit),
            })
        } catch (error) {
            console.log("error in UserCategoryController -> getAllCategories", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            })
        }
    }
}

module.exports = new UserCategoryController