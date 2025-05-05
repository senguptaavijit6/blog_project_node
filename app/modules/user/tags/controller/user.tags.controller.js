
const generalCMSRepo = require("../../../admin/cms/general/repo/generalCMS.repo");
const TagsRepo = require("../../../admin/tags/repository/tags.repo");

class UserTagsController {
    async getAllTags(req, res) {
        try {
            const user = req.user || false;
            const siteName = await generalCMSRepo.retrieve()
            const { page, limit } = req.query.page && req.query.limit ? req.query : { page: 1, limit: 10 } // there is also a value in the pages, consider that also
            console.log('page and limit', page, limit);
            let skip = (page - 1) * limit
            const tags = await TagsRepo.retrieveAllTagsWithPagination(skip, limit)
            console.log('tags from UserCategoryController -> getAllTags', tags);
            if (!tags) {
                req.flash("error", "Something went wrong please try again later")
                return res.redirect("/")
            }

            return res.render("pages/user/blog/tagsListPage", {
                title: "All tags",
                siteName: siteName?.title, favicon: siteName?.favicon, 
                tags,
                user,
                page: parseInt(page),
                limit: parseInt(limit),
            })
        } catch (error) {
            console.log("error in UserCategoryController -> getAllTags", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            })
        }
    }
}

module.exports = new UserTagsController