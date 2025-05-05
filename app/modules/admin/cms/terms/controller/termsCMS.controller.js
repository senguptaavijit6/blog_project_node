const generalCMSRepo = require("../../general/repo/generalCMS.repo")
const TermsCMSRepo = require("../repo/termsCMS.repo")

class TermsCMSController {
    async createOrUpdateTermsCMSPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()
            let termsData = await TermsCMSRepo.retrieveTerms()
            console.log('termsData from TermsCMSController -> createOrUpdateTermsCMSPage', termsData);
            if (termsData) {
                return res.render("pages/cms/termOfServiceCMSPage", { title: "CMS Terms of service page", siteName: siteName?.title, favicon: siteName?.favicon,  user, termsData })
            }

            termsData = {}
            termsData.title = ""
            termsData.content = ""

            return res.render("pages/cms/termOfServiceCMSPage", { title: "CMS Terms of service page", siteName: siteName?.title, favicon: siteName?.favicon, user, termsData })
        } catch (error) {
            console.log("error in TermsCMSController -> createOrUpdateTermsCMSPage", error);
        }
    }

    async createOrUpdateTermsCMS(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }

            console.log("req body from createOrUpdateTermsCMS", req.body);
            

            const termsData = await TermsCMSRepo.retrieveTerms()
            // termsData ? update : create  
            if (termsData) {
                const updateTerms = await TermsCMSRepo.updateTerms(termsData._id, req.body)
                if (!updateTerms) {
                    req.flash("error", "Could not update Terms, try again")
                    return res.redirect("/admin/cms/termsCMSPage")
                }
            } else {
                const createTerms = await TermsCMSRepo.createTerms(req.body)
                if (!createTerms) {
                    req.flash("error", "Could not create Terms, try again")
                    return res.redirect("/admin/cms/termsCMSPage")
                }
            }

            req.flash("success", "Terms of Service successfully saved")
            return res.redirect("/admin/cms/termsCMSPage")
        } catch (error) {
            console.log("error in TermsCMSController -> createOrUpdateTermsCMS", error);
        }
    }



    async deleteTerms(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }

            const termsData = await TermsCMSRepo.deleteTerms(req.params.id)
            if (!termsData) {
                req.flash("error", "Could not delete Terms")
                return res.redirect("/admin/")
            }

            req.flash("success", "Terms successfully deleted")
            return res.redirect("/admin/cms/termsCMSPage")
        } catch (error) {
            console.log("error in TermsCMSController -> deleteTerms", error);
        }
    }
}

module.exports = new TermsCMSController