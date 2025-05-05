const generalCMSRepo = require("../../general/repo/generalCMS.repo")
const AboutUsCMSRepo = require("../repository/aboutUsCMS.repo")

class AboutUsCMSController {
    /* aboutUsCMSPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            return res.render("pages/cms/aboutUsCMSPage", {title: "CMS About Us page", siteName: siteName?.title, favicon: siteName?.favicon, user})
        } catch (error) {
            console.log("error in AboutUsCMSController -> aboutUsCMSPage", error);
        }
    } */

    async createOrUpdateAboutUsCMSPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()
            let aboutUsData = await AboutUsCMSRepo.retrieveAboutUs()
            if (aboutUsData) {
                return res.render("pages/cms/aboutUsCMSPage", { title: "CMS About Us page", siteName: siteName?.title, favicon: siteName?.favicon, user, aboutUsData })
            }

            aboutUsData = {}
            aboutUsData.section1BoldHeading = ""
            aboutUsData.section1Heading = ""
            aboutUsData.section1Image = ""
            aboutUsData.section2Heading = ""
            aboutUsData.section2SubHeading = ""
            aboutUsData.section2Description = ""
            aboutUsData.section3Heading = ""
            aboutUsData.section3SubHeading = ""
            aboutUsData.section3Description = ""

            return res.render("pages/cms/aboutUsCMSPage", { title: "CMS About Us page", siteName: siteName?.title, favicon: siteName?.favicon, user, aboutUsData })
        } catch (error) {
            console.log("error in AboutUsCMSController -> createAboutUsCMS", error);
        }
    }

    async createOrUpdateAboutUsCMS(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }

            if (req.file) {
                req.body.section1Image = req.file.filename
            }

            console.log("req body from createOrUpdateAboutUsCMS", req.body, req.file);
            

            const aboutUsData = await AboutUsCMSRepo.retrieveAboutUs()
            // about_us ? update : create  
            if (aboutUsData) {
                const updateAboutUs = await AboutUsCMSRepo.updateAboutUs(aboutUsData._id, req.body)
                if (!updateAboutUs) {
                    req.flash("error", "Could not update About Us, try again")
                    return res.redirect("/admin/cms/aboutUsCMSPage")
                }

                // req.flash("success", "About us successfully saved")
                // return res.redirect("/admin/cms/aboutUsCMSPage")
            } else {
                const createAboutUs = await AboutUsCMSRepo.createAboutUs(req.body)
                if (!createAboutUs) {
                    req.flash("error", "Could not create About Us, try again")
                    return res.redirect("/admin/cms/aboutUsCMSPage")
                }

                // req.flash("success", "About us successfully saved")
                // return res.redirect("/admin/cms/aboutUsCMSPage")
            }

            req.flash("success", "About us successfully saved")
            return res.redirect("/admin/cms/aboutUsCMSPage")
        } catch (error) {
            console.log("error in AboutUsCMSController -> createAboutUsCMS", error);
        }
    }



    async deleteAboutUs(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to view this page")
                return res.redirect("/admin/loginPage")
            }

            const aboutUsData = await AboutUsCMSRepo.deleteAboutUs(req.params.id)
            if (!aboutUsData) {
                req.flash("error", "Could not delete About Us")
                return res.redirect("/admin/")
            }

            req.flash("success", "About us successfully deleted")
            return res.redirect("/admin/cms/aboutUsCMSPage")
        } catch (error) {
            console.log("error in AboutUsCMSController -> deleteAboutUs", error);
        }
    }
}

module.exports = new AboutUsCMSController