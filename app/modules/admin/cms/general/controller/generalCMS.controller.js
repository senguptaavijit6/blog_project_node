const GeneralCMSRepo = require("../repo/generalCMS.repo")

class GeneralCMSController {
    async createOrUpdateGeneralCMSPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await GeneralCMSRepo.retrieve()
            let generalData = await GeneralCMSRepo.retrieve()
            console.log('generalData from GeneralCMSController -> createOrUpdateTermsGeneralCMSPage', generalData);
            if (generalData) {
                return res.render("pages/cms/termOfServiceCMSPage", { title: "CMS Terms of service page", siteName: siteName?.title, favicon: siteName?.favicon, user, generalData })
            }

            generalData = {}
            generalData.title = ""
            generalData.description = ""
            generalData.favicon = ""

            return res.render("pages/cms/generalCMSPage", { title: "General CMS page", siteName: siteName?.title, favicon: siteName?.favicon, user, generalData })
        } catch (error) {
            console.log("error in GeneralCMSController -> createOrUpdateTermsGeneralCMSPage", error);
        }
    }

    async createOrUpdateGeneralCMS(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }

            console.log("req body from createOrUpdateGeneralCMS", req.body, req.file);
            if (req.file) {
                req.body.favicon = req.file.filename
            }
            

            const generalData = await GeneralCMSRepo.retrieve()
            // generalData ? update : create  
            if (generalData) {
                const updateGeneral = await GeneralCMSRepo.update(generalData._id, req.body)
                if (!updateGeneral) {
                    req.flash("error", "Could not update General, try again")
                    return res.redirect("/admin/cms/general")
                }
            } else {
                const createGeneral = await GeneralCMSRepo.create(req.body)
                if (!createGeneral) {
                    req.flash("error", "Could not create General, try again")
                    return res.redirect("/admin/cms/general")
                }
            }

            req.flash("success", "Terms of Service successfully saved")
            return res.redirect("/admin/cms/general")
        } catch (error) {
            console.log("error in GeneralCMSController -> createOrUpdateGeneralCMS", error);
        }
    }



    async deleteGeneralCMS(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }

            if (!req.params.id) {
                req.flash("error", "Id is required")
                return res.redirect("/admin/cms/general")
            }

            const generalData = await GeneralCMSRepo.delete(req.params.id)
            if (!generalData) {
                req.flash("error", "Could not delete Terms")
                return res.redirect("/admin/cms/general")
            }

            req.flash("success", "Terms successfully deleted")
            return res.redirect("/admin/cms/general")
        } catch (error) {
            console.log("error in GeneralCMSController -> deleteGeneralCMS", error);
        }
    }
}

module.exports = new GeneralCMSController