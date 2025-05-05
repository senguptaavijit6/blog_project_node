const HomepageCMSRepo = require("../repository/homeCMS.repo")
const TagsRepo = require("../../../tags/repository/tags.repo")
const generalCMSRepo = require("../../general/repo/generalCMS.repo")


class HomepageCMSController {
    async createOrUpdatePage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "unauthorize access, please login")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            let homepageData = await HomepageCMSRepo.retrieve()
            const allTags = await TagsRepo.retrieveAllTags()
            console.log("allTags", allTags);
            
            if (!homepageData) {
                homepageData = {
                    _id: "",
                    section2Brands: "",
                
                    section3Heading: "",
                    section3LinkText: "",
                    section3BoldSubHeading: "",
                    section3SubHeading: "",
                    section3facebook: "",
                    section3instagram: "",
                    section3x: "",
                    section3threads: "",
                    section3description: "",
                    section3image: "",
                
                    section4Heading: "",
                
                    section5Heading: "",
                    section5ButtonText: "",
                    section5Description: "",
                    
                    section6Heading: "",
                    section6ButtonText: "",
                    section6SubHeading: "",
                }
            }
            return res.render("pages/cms/homeCMSPage", { title: "Home Page CMS", siteName: siteName?.title, favicon: siteName?.favicon, user, homepageData, allTags })
        
        } catch (error) {
            console.log("error in HomepageCMSController -> createOrUpdatePage", error);
        }
    }

    async createOrUpdate(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "unauthorize access, please login")
                return res.redirect("")
            }
            return console.log("req body from HomepageCMSController -> createOrUpdate", req.body);            
        } catch (error) {
            console.log("error in HomepageCMSController -> createOrUpdate", error);
        }
    }

    async retrieveHomeSliderPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "unauthorize access, please login")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            let sliderData = await HomepageCMSRepo.retrieveSlider({ isDeleted: false })

            if (!sliderData) {
                sliderData = [{
                    sliderBoldHeading1: "",
                    sliderBoldHeading2: "",
                    sliderHeading: "",
                    sliderButtonText: "",
                    sliderImage: "",
                    sliderDescription: "",

                    status: "",
                    activeCount: 0,
                    inactiveCount: 0,
                }]
            }

            return res.render("pages/cms/slider/allHomeSliderPage", { title: "Home Slider CMS", siteName: siteName?.title, favicon: siteName?.favicon, user, sliderData })
        } catch (error) {
            console.log("error in HomepageCMSController -> retrieveSliderPage", error);
        }
    }

    async retrieveHomeSingleSliderPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "unauthorize access, please login")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const sliderData = await HomepageCMSRepo.retrieveSingleSlider(req.params.id)
            return res.render("pages/cms/slider/singleHomeSliderPage", { title: "Create Home Page Slider CMS", siteName: siteName?.title, favicon: siteName?.favicon, user, sliderData})
            
        } catch (error) {
            console.log("error in HomepageCMSController -> createHomeSliderPage", error);
        }
    }

    async createHomeSliderPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "unauthorize access, please login")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            return res.render("pages/cms/slider/createHomeSliderPage", { title: "Create Home Page Slider CMS", siteName: siteName?.title, favicon: siteName?.favicon, user})
            
        } catch (error) {
            console.log("error in HomepageCMSController -> createHomeSliderPage", error);
        }
    }

    async createHomeSlider(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "unauthorize access, please login")
                return res.redirect("/admin/loginPage")
            }

            if (!req.body.sliderBoldHeading) {
                req.flash("error", "Slider Bold Heading is missing")
                return res.redirect("/admin/cms/createHomeSliderPage")
            }
            if (!req.body.sliderHeading) {
                req.flash("error", "Slider Heading is missing")
                return res.redirect("/admin/cms/createHomeSliderPage")
            }
            if (!req.body.sliderButtonText) {
                req.flash("error", "Slider Button Text is missing")
                return res.redirect("/admin/cms/createHomeSliderPage")
            }
            if (!req.file) {
                req.flash("error", "Slider Image is missing")
                return res.redirect("/admin/cms/createHomeSliderPage")
            } else {
                req.body.sliderImage = req.file.filename
            }

            console.log("req body from what Slider to be created", req.body, req.file);

            const createResponse = await HomepageCMSRepo.createSlider(req.body)
            if (!createResponse) {
                req.flash("error", "Sorry, Slider cannot be created")
                return res.redirect("/admin/cms/createHomeSliderPage")
            }

            req.flash("success", "Slider is created")
            return res.redirect("/admin/cms/homeSliderPage")            
        } catch (error) {
            console.log("error in HomepageCMSController -> createHomeSliderPage", error);
        }
    }

    async updateHomeSliderPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "unauthorize access, please login")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            if (!req.params.id) {
                req.flash("error", "No slider found")
                return res.redirect("/admin/cms/homeSliderPage")
            }

            const sliderData = await HomepageCMSRepo.retrieveSingleSlider(req.params.id)
            if (!sliderData) {
                req.flash("error", "No slider found, may be deleted")
                return res.redirect("/admin/cms/homeSliderPage")
            }

            return res.render("pages/cms/slider/updateHomeSliderPage", { title: "Update Home Page Slider CMS", siteName: siteName?.title, favicon: siteName?.favicon, user, sliderData})
        } catch (error) {
            console.log("error in HomepageCMSController -> updateHomeSliderPage", error);
        }
    }

}

module.exports = new HomepageCMSController