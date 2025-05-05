const generalCMSRepo = require("../../cms/general/repo/generalCMS.repo")
const TagRepo = require("../repository/tags.repo")

class TagsController {
    // create Tag PAGE
    async createTagPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to create Tags")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            return res.render("pages/tags/createTagPage", {title: "Create Tag", siteName: siteName?.title, favicon: siteName?.favicon, user})
        } catch (error) {
            console.log("error in TagsController -> createTagPage", error);
        }
    }

    // create Tag
    async createTag(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to create Tags")
                return res.redirect("/admin/loginPage")
            }

            console.log("req body from createTag", req.body);

            if (!req.body.name) {
                req.flash("error", "Tag Name is required")
                return res.redirect("/admin/createTagPage")
            }

            // check if the Tag is already exists
            const isTagExists = await TagRepo.checkTagExistance(req.body.name)
            if (isTagExists) {
                req.flash("error", "Tag is already existing")
                return res.redirect("/admin/createTagPage")
            }

            const TagCreateResponse = await TagRepo.createTag(req.body)
            if (!TagCreateResponse) {
                req.flash("error", "Sorry! Tag could not be saved, try again.")
                return res.redirect("/admin/createTagPage")
            }

            req.flash("success", "Tag saved successfully")
            return res.redirect("/admin/allTagsPage")
        } catch (error) {
            console.log("error in TagsController -> createTag", error);
        }
    }

    // read all Tags
    async retrieveAllTagsPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to see Tags")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const TagData = await TagRepo.retrieveAllTags()
            return res.render("pages/tags/allTagsPage", {title: "All Tags", siteName: siteName?.title, favicon: siteName?.favicon, user, TagData})

        } catch (error) {
            console.log("error in TagsController -> retrieveAllTagsPage", error);
        }
    }

    async retrieveSingleTag(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to see this Tag")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const Tag = await TagRepo.retrieveSingleTag(req.params.id)
            return res.render("pages/tags/singleTagPage", { title: "Tag Details Page", siteName: siteName?.title, favicon: siteName?.favicon, user, Tag })
        } catch (error) {
            console.log("error in TagsController -> retrieveSingleTag", error);
        }
    }

    async deleteTag(req, res) {
        try {            
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to delete this Tag")
                return res.redirect("/admin/loginPage")
            }

            const deleteTagResponse = await TagRepo.deleteTag(req.params.id)
            if (!deleteTagResponse) {
                req.flash("error", "Tag could not be deleted, try again.")
            } else {
                req.flash("success", "Tag successfullly deleted")
            }

            return res.redirect("/admin/allTagsPage")
        } catch (error) {
            console.log("error in TagsController -> deleteTag", error);
        }
    }

    async updateTagPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to update this Tag")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const TagData = await TagRepo.retrieveSingleTag(req.params.id)

            if (!TagData) {
                req.flash("error", "No Tag found, may be deleted")
                return res.redirect("/admin/allTagsPage")
            }

            return res.render("pages/tags/updateTagPage", { title: "Tag update page", siteName: siteName?.title, favicon: siteName?.favicon, user, TagData })
        } catch (error) {
            console.log("error in TagsController -> updateTagPage", error);
        }
    }

    async updateTag(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to update this Tag")
                return res.redirect("/admin/loginPage")
            }

            //check if the Tag name exists on req.body
            if (!req.body.name || req.body.name === "") {
                req.flash("error", "Tag name is required")
                return res.redirect("/admin/updateTagPage/" + req.params.id)
            }

            if (!req.body) {
                req.flash("error", "Nothing to update")
                return res.redirect("/admin/updateTagPage/" + req.params.id)
            }

            // check if any other Tag exists with the same name
            const isTagExists = await TagRepo.checkTagExistanceById(req.params.id, req.body.name)
            if (isTagExists) {
                console.log("isTagExists", isTagExists);
                
                req.flash("error", "A Tag with the same name is already exists")
                return res.redirect("/admin/updateTagPage/" + req.params.id)
            }

            const updateTagResponse = await TagRepo.updateTag(req.params.id, req.body)
            if (!updateTagResponse) {
                req.flash("error", "Sorry Tag could not be updated, try again")
                return res.redirect("/admin/updateTagPage/" + req.params.id)
            }

            req.flash("success", "Tag updated successfully")
            return res.redirect("/admin/allTagsPage")
            
        } catch (error) {
            console.log("error in TagsController -> updateTag", error);
        }
    }
}

module.exports = new TagsController