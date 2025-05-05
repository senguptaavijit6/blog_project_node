const generalCMSRepo = require("../../cms/general/repo/generalCMS.repo")
const FAQRepo = require("../repository/faq.repo")

class FAQController {
    // create FAQ PAGE
    async createFAQPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to create FAQs")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            return res.render("pages/faq/createFAQPage", {title: "All FAQs", siteName: siteName?.title, favicon: siteName?.favicon, user})
        } catch (error) {
            console.log("error in FAQController -> createFAQPage", error);
        }
    }

    // create FAQ
    async createFAQ(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to create FAQs")
                return res.redirect("/admin/loginPage")
            }

            console.log("req body from createFAQ", req.body);

            if (!req.body.question) {
                req.flash("error", "FAQ Question is required")
                return res.redirect("/admin/createFAQPage")
            }

            if (!req.body.answer) {
                req.flash("error", "FAQ Answer is required")
                return res.redirect("/admin/createFAQPage")
            }

            const faqCreateResponse = await FAQRepo.createFAQ(req.body)
            if (!faqCreateResponse) {
                req.flash("error", "Sorry! FAQ could not be saved, try again.")
                return res.redirect("/admin/createFAQPage")
            }

            req.flash("success", "FAQ saved successfully")
            return res.redirect("/admin/allFAQsPage")
        } catch (error) {
            console.log("error in FAQController -> createFAQ", error);
        }
    }

    // read all FAQs
    async retrieveAllFAQsPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to see FAQs")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const faqData = await FAQRepo.retrieveAllFAQs()
            return res.render("pages/faq/allFAQsPage", {title: "All FAQs", siteName: siteName?.title, favicon: siteName?.favicon, user, faqData})

        } catch (error) {
            console.log("error in FAQController -> retrieveAllFAQsPage", error);
        }
    }

    async retrieveSingleFAQ(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to see this FAQ")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const FAQ = await FAQRepo.retrieveSingleFAQ(req.params.id)
            return res.render("pages/faq/singleFAQ", { title: "FAQ Details Page", siteName: siteName?.title, favicon: siteName?.favicon, user, FAQ })
        } catch (error) {
            console.log("error in FAQController -> retrieveSingleFAQ", error);
        }
    }

    async deleteFAQ(req, res) {
        try {            
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to delete this FAQ")
                return res.redirect("/admin/loginPage")
            }

            const deleteFAQResponse = await FAQRepo.deleteFAQ(req.params.id)
            if (!deleteFAQResponse) {
                req.flash("error", "FAQ could not be deleted, try again.")
            } else {
                req.flash("success", "FAQ successfullly deleted")
            }

            return res.redirect("/admin/allFAQsPage")
        } catch (error) {
            console.log("error in FAQController -> deleteFAQ", error);
        }
    }

    async updateFAQPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to update this FAQ")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const FAQData = await FAQRepo.retrieveSingleFAQ(req.params.id)

            if (!FAQData) {
                req.flash("error", "No FAQ found, may be deleted")
                return res.redirect("/admin/allFAQsPage")
            }

            return res.render("pages/faq/updateFAQPage", { title: "FAQ update page", siteName: siteName?.title, favicon: siteName?.favicon, user, FAQData })
        } catch (error) {
            console.log("error in FAQController -> updateFAQPage", error);
        }
    }

    async updateFAQ(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to update this FAQ")
                return res.redirect("/admin/loginPage")
            }

            if (!req.body.question) {
                req.flash("error", "FAQ Question is a must")
                return res.redirect("/admin/updateFAQPage/" + req.params.id)
            }

            if (!req.body.answer) {
                req.flash("error", "FAQ Answer is a must")
                return res.redirect("/admin/updateFAQPage/" + req.params.id)
            }

            if (!req.body.status) {
                req.flash("error", "FAQ status is a must")
                return res.redirect("/admin/updateFAQPage/" + req.params.id)
            }

            const updateFAQResponse = await FAQRepo.updateFAQ(req.params.id, req.body)
            if (!updateFAQResponse) {
                req.flash("error", "Sorry FAQ could not be updated, try again")
                return res.redirect("/admin/updateFAQPage/" + req.params.id)
            }

            req.flash("success", "FAQ updated successfully")
            return res.redirect("/admin/allFAQsPage")
            
        } catch (error) {
            console.log("error in FAQController -> updateFAQ", error);
        }
    }
}

module.exports = new FAQController