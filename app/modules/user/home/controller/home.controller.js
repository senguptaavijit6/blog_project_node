const AboutUsCMSRepo = require("../../../admin/cms/aboutUs/repository/aboutUsCMS.repo")
const PrivacyPolicyCMSRepo = require("../../../admin/cms/privacyPolicy/repo/privacyPolicyCMS.repo")
const termsCMSRepo = require("../../../admin/cms/terms/repo/termsCMS.repo")
const HomeRepo = require("../repo/home.repo")
const EmailSender = require("../../../../helper/emailSender")
const AdminAuthRepo = require("../../../admin/auth/repository/admin.auth.repo")
const FaqRepo = require("../../../admin/FAQ/repository/faq.repo")
const generalCMSRepo = require("../../../admin/cms/general/repo/generalCMS.repo")

class UserHomeController {
    async homePage(req, res) {
        try {
            const siteName = await generalCMSRepo.retrieve()
            const sliders = await HomeRepo.getSliders()
            const categories = await HomeRepo.getCategories()
            const blogs = await HomeRepo.getAllBlogs()
            const testimonials = await HomeRepo.getAllTestimonials()
            console.log("blogs", JSON.stringify(blogs, null, 4))
            console.log("sliders", sliders)
            console.log("categories", categories);
            const user = req.user || false
            
            res.render("pages/user/home/home", {
                title: "Welcome",
                siteName: siteName?.title, favicon: siteName?.favicon, 
                sliders,
                categories,
                user,
                blogs,
                testimonials,
            })
        } catch (error) {
            console.error("Error in UserHomeController -> homePage:", error)
        }
    }

    async aboutUsPage(req, res) {
        try {
            const user = req.user || false
            const siteName = await generalCMSRepo.retrieve()
            const aboutUs = await AboutUsCMSRepo.retrieveAboutUs()
            if(!aboutUs) {
                req.flash("error", "something went wrong")
                return res.redirect("/")
            }
            console.log('About us from UserHomeController -> aboutUsPage', aboutUs);
            res.render("pages/user/home/aboutUsPage", {
                title: "About Us",
                siteName: siteName?.title, favicon: siteName?.favicon, 
                user,
                aboutUs
            })
        } catch (error) {
            console.error("Error in UserHomeController -> aboutUsPage:", error)
        }
    }

    async contactUsPage(req, res) {
        try {
            const user = req.user || false
            const siteName = await generalCMSRepo.retrieve()
            const faqs = await FaqRepo.retrieveAllFAQs()
            res.render("pages/user/home/contactUsPage", {
                title: "Contact Us",
                siteName: siteName?.title, favicon: siteName?.favicon, 
                user,
                faqs,
            })
        } catch (error) {
            console.error("Error in UserHomeController -> contactUsPage:", error)
        }
    }

    async termsPage(req, res) {
        try {
            const user = req.user || false
            const siteName = await generalCMSRepo.retrieve()
            
            const terms = await termsCMSRepo.retrieveTerms()
            if(!terms) {
                req.flash("error", "something went wrong")
                return res.redirect("/")
            }
            console.log('About us from UserHomeController -> termsPage', terms);
            res.render("pages/user/home/termsOfServicePage", {
                title: "Terms of Service",
                siteName: siteName?.title, favicon: siteName?.favicon, 
                user,
                terms,
            })
        } catch (error) {
            console.error("Error in UserHomeController -> termsPage:", error)
        }
    }

    async privacyPolicyPage(req, res) {
        try {
            const user = req.user || false
            const siteName = await generalCMSRepo.retrieve()
            
            const policy = await PrivacyPolicyCMSRepo.retrievePolicy()
            if(!policy) {
                req.flash("error", "something went wrong")
                return res.redirect("/")
            }
            console.log('About us from UserHomeController -> privacyPolicyPage', policy);
            res.render("pages/user/home/privacyPolicyPage", {
                title: `Pivacy Policy`,
                siteName: siteName?.title, favicon: siteName?.favicon, 
                user,
                policy,
            })
        } catch (error) {
            console.error("Error in UserHomeController -> privacyPolicyPage:", error)
        }
    }

    async sendMessageViaEmail(req, res) {
        try {
            const user = req.user || false
            const siteName = await generalCMSRepo.retrieve()
            
            console.log('req body from UserHomeController -> sendMessageViaEmail:', req.body);
            if (!req.body.fname || !req.body.lname || !req.body.email || !req.body.subject || !req.body.message) {
                return res.redirect("/contactUs")
            }

            const emailSender = new EmailSender("gmail", process.env.EMAIL_USER, process.env.EMAIL_PASS)
            const adminEmails = await AdminAuthRepo.getAllAdminEmails()
            const mailObj = {
                subject: `${req.body.subject} from ${req.body.fname} ${req.body.lname}`,
                html: `<div>Phone: ${req.body.phone || ''}</div>
                <div>Message: ${req.body.message}</div>`
            }
            const mailObj2 = {
                to: req.body.email,
                subject: `Email Received - ${siteName.title}`,
                html: `Hi ${req.body.fname}, we've received your email, this is an auto generated reply, our admins will get to you shortly, stay tuned`
            }
            adminEmails.forEach(async (admin) => {await emailSender.sendMail({...mailObj, to: admin.email})})
            await emailSender.sendMail({...mailObj2})
            return res.redirect(`/`)
        } catch (error) {
            console.error("Error in UserHomeController -> sendMessageViaEmail:", error)
        }
    }
}

module.exports = new UserHomeController()