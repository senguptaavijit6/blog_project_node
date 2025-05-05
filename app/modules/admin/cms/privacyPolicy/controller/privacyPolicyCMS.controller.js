const generalCMSRepo = require("../../general/repo/generalCMS.repo")
const PrivacyPolicyCMSRepo = require("../repo/privacyPolicyCMS.repo")

class PrivacyCMSController {
    async createOrUpdatePrivacyCMSPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()
            let privacyData = await PrivacyPolicyCMSRepo.retrievePolicy()
            console.log('privacyData from PrivacyCMSController -> createOrUpdatePrivacyCMSPage', privacyData);
            if (privacyData) {
                return res.render("pages/cms/privacyPolicyCMSPage", { title: "CMS Privacy of service page", siteName: siteName?.title, favicon: siteName?.favicon, user, privacyData })
            }

            privacyData = {}
            privacyData.title = ""
            privacyData.content = ""

            return res.render("pages/cms/privacyPolicyCMSPage", { title: "CMS Privacy of service page", siteName: siteName?.title, favicon: siteName?.favicon, user, privacyData })
        } catch (error) {
            console.log("error in PrivacyCMSController -> createOrUpdatePrivacyCMSPage", error);
        }
    }

    async createOrUpdatePrivacyCMS(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }

            console.log("req body from createOrUpdatePrivacyCMS", req.body);
            

            const privacyData = await PrivacyPolicyCMSRepo.retrievePolicy()
            // privacyData ? update : create  
            if (privacyData) {
                const updatePrivacy = await PrivacyPolicyCMSRepo.updatePolicy(privacyData._id, req.body)
                if (!updatePrivacy) {
                    req.flash("error", "Could not update Privacy, try again")
                    return res.redirect("/admin/cms/privacyCMSPage")
                }
            } else {
                const createPrivacy = await PrivacyPolicyCMSRepo.createPolicy(req.body)
                if (!createPrivacy) {
                    req.flash("error", "Could not create Privacy, try again")
                    return res.redirect("/admin/cms/privacyCMSPage")
                }
            }

            req.flash("success", "Privacy of Service successfully saved")
            return res.redirect("/admin/cms/privacyCMSPage")
        } catch (error) {
            console.log("error in PrivacyCMSController -> createOrUpdatePrivacyCMS", error);
        }
    }



    async deletePrivacy(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }

            const privacyData = await PrivacyPolicyCMSRepo.deletePolicy(req.params.id)
            if (!privacyData) {
                req.flash("error", "Could not delete Privacy")
                return res.redirect("/admin/")
            }

            req.flash("success", "Privacy successfully deleted")
            return res.redirect("/admin/cms/privacyCMSPage")
        } catch (error) {
            console.log("error in PrivacyCMSController -> deletePrivacy", error);
        }
    }
}

module.exports = new PrivacyCMSController