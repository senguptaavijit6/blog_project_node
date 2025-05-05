const generalCMSRepo = require("../../cms/general/repo/generalCMS.repo")
const TestimonialRepo = require("../repository/testimonial.repo")
const fs = require("node:fs")

class TestimonialController {
    // create Testimonial PAGE
    async createTestimonialPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to create Testimonials")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            return res.render("pages/testimonial/createTestimonialPage", {title: "All Testimonials", siteName: siteName?.title, favicon: siteName?.favicon, user})
        } catch (error) {
            console.log("error in TestimonialController -> createTestimonialPage", error);
        }
    }

    // create Testimonial
    async createTestimonial(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to create Testimonials")
                return res.redirect("/admin/loginPage")
            }

            console.log("req body from createTestimonial", req.body, req.file); 

            if (!req.body.clientName) {
                req.flash("error", "Testimonial's client name is required")
                return res.redirect("/admin/createTestimonialPage")
            }
            if (!req.body.clientRating) {
                req.flash("error", "Testimonial's client rating is required")
                return res.redirect("/admin/createTestimonialPage")
            }
            if (!req.body.clientDesignation) {
                req.flash("error", "Testimonial's client designation is required")
                return res.redirect("/admin/createTestimonialPage")
            }
            if (!req.file) {
                req.flash("error", "Testimonial's client image is required")
                return res.redirect("/admin/createTestimonialPage")
            }

            req.body.clientImage = req.file.filename


            const testimonialCreateResponse = await TestimonialRepo.createTestimonial(req.body)
            if (!testimonialCreateResponse) {
                req.flash("error", "Sorry! Testimonial could not be saved, try again.")
                return res.redirect("/admin/createTestimonialPage")
            }

            req.flash("success", "Testimonial saved successfully")
            return res.redirect("/admin/allTestimonialsPage")
        } catch (error) {
            console.log("error in TestimonialController -> createTestimonial", error);
        }
    }

    // read all Testimonials
    async retrieveAllTestimonialsPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to see Testimonials")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const testimonialsData = await TestimonialRepo.retrieveAllTestimonials()
            return res.render("pages/testimonial/allTestimonialsPage", {title: "All Testimonials", siteName: siteName?.title, favicon: siteName?.favicon, user, testimonialsData})

        } catch (error) {
            console.log("error in TestimonialController -> retrieveAllTestimonialsPage", error);
        }
    }

    async retrieveSingleTestimonial(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to see this Testimonial")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const Testimonial = await TestimonialRepo.retrieveSingleTestimonial(req.params.id)
            return res.render("pages/testimonial/singleTestimonial", { title: "Testimonial Details Page", siteName: siteName?.title, favicon: siteName?.favicon, user, Testimonial })
        } catch (error) {
            console.log("error in TestimonialController -> retrieveSingleTestimonial", error);
        }
    }

    async deleteTestimonial(req, res) {
        try {            
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to delete this Testimonial")
                return res.redirect("/admin/loginPage")
            }

            const deleteTestimonialResponse = await TestimonialRepo.deleteTestimonial(req.params.id)
            if (!deleteTestimonialResponse) {
                req.flash("error", "Testimonial could not be deleted, try again.")
            } else {
                req.flash("success", "Testimonial successfullly deleted")
            }

            return res.redirect("/admin/allTestimonialsPage")
        } catch (error) {
            console.log("error in TestimonialController -> deleteTestimonial", error);
        }
    }

    async updateTestimonialPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to update this Testimonial")
                return res.redirect("/admin/loginPage")
            }

            const TestimonialData = await TestimonialRepo.retrieveSingleTestimonial(req.params.id)

            if (!TestimonialData) {
                req.flash("error", "No Testimonial found, may be deleted")
                return res.redirect("/admin/allTestimonialsPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            return res.render("pages/testimonial/updateTestimonialPage", { title: "Testimonial update page", siteName: siteName?.title, favicon: siteName?.favicon, user, TestimonialData })
        } catch (error) {
            console.log("error in TestimonialController -> updateTestimonialPage", error);
        }
    }

    async updateTestimonial(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to update this Testimonial")
                return res.redirect("/admin/loginPage")
            }

            const previousData = await TestimonialRepo.retrieveSingleTestimonial(req.params.id)

            // if (!req.body.clientName) {
            //     req.flash("error", "Testimonial's client name is a must")
            //     return res.redirect("/admin/updateTestimonialPage/" + req.params.id)
            // }

            // if (!req.body.clientDesignation) {
            //     req.flash("error", "Testimonial's client designation is a must")
            //     return res.redirect("/admin/updateTestimonialPage/" + req.params.id)
            // }

            // if (!req.body.clientRating) {
            //     req.flash("error", "Testimonial's client rating is a must")
            //     return res.redirect("/admin/updateTestimonialPage/" + req.params.id)
            // }

            if (req.file) {
                console.log("file", req.file);
                req.body.clientImage = req.file.filename
                fs.unlinkSync(`public/uploads/testimonials/${previousData.clientImage}`,  (err) => {
                    if (err) throw err;
                    console.log('previous profile image is deleted now');
                })
            }

            const updateTestimonialResponse = await TestimonialRepo.updateTestimonial(req.params.id, req.body)
            if (!updateTestimonialResponse) {
                req.flash("error", "Sorry Testimonial could not be updated, try again")
                return res.redirect("/admin/updateTestimonialPage/" + req.params.id)
            }

            req.flash("success", "Testimonial updated successfully")
            return res.redirect("/admin/allTestimonialsPage")
            
        } catch (error) {
            console.log("error in TestimonialController -> updateTestimonial", error.message, error);
        }
    }
}

module.exports = new TestimonialController