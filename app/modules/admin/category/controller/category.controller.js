const generalCMSRepo = require("../../cms/general/repo/generalCMS.repo")
const CategoryRepo = require("../repository/category.repo")

class CategoryController {
    // create Category PAGE
    async createCategoryPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to create Categories")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            return res.render("pages/category/createCategoryPage", {title: "Create Category", siteName: siteName?.title, favicon: siteName?.favicon, user})
        } catch (error) {
            console.log("error in CategoryController -> createCategoryPage", error);
        }
    }

    // create Category
    async createCategory(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to create Categories")
                return res.redirect("/admin/loginPage")
            }

            console.log("req body from createCategory", req.body);

            if (!req.body.name) {
                req.flash("error", "Category Name is required")
                return res.redirect("/admin/createCategoryPage")
            }

            // check if the category is already exists
            const isCategoryExists = await CategoryRepo.checkCategoryExistance(req.body.name)
            if (isCategoryExists) {
                req.flash("error", "Category is already existing")
                return res.redirect("/admin/createCategoryPage")
            }

            const categoryCreateResponse = await CategoryRepo.createCategory(req.body)
            if (!categoryCreateResponse) {
                req.flash("error", "Sorry! Category could not be saved, try again.")
                return res.redirect("/admin/createCategoryPage")
            }

            req.flash("success", "Category saved successfully")
            return res.redirect("/admin/allCategoriesPage")
        } catch (error) {
            console.log("error in CategoryController -> createCategory", error);
        }
    }

    // read all Categories
    async retrieveAllCategoriesPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to see Categories")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const categoryData = await CategoryRepo.retrieveAllCategories()
            return res.render("pages/category/allCategoriesPage", {title: "All Categories", siteName: siteName?.title, favicon: siteName?.favicon, user, categoryData})

        } catch (error) {
            console.log("error in CategoryController -> retrieveAllCategoriesPage", error);
        }
    }

    async retrieveSingleCategory(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to see this Category")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const Category = await CategoryRepo.retrieveSingleCategory(req.params.id)
            return res.render("pages/category/singleCategory", { title: "Category Details Page", siteName: siteName?.title, favicon: siteName?.favicon, user, Category })
        } catch (error) {
            console.log("error in CategoryController -> retrieveSingleCategory", error);
        }
    }

    async deleteCategory(req, res) {
        try {            
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to delete this Category")
                return res.redirect("/admin/loginPage")
            }

            const deleteCategoryResponse = await CategoryRepo.deleteCategory(req.params.id)
            if (!deleteCategoryResponse) {
                req.flash("error", "Category could not be deleted, try again.")
            } else {
                req.flash("success", "Category successfullly deleted")
            }

            return res.redirect("/admin/allCategoriesPage")
        } catch (error) {
            console.log("error in CategoryController -> deleteCategory", error);
        }
    }

    async updateCategoryPage(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to update this Category")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            const CategoryData = await CategoryRepo.retrieveSingleCategory(req.params.id)

            if (!CategoryData) {
                req.flash("error", "No Category found, may be deleted")
                return res.redirect("/admin/allCategoriesPage")
            }

            return res.render("pages/category/updateCategoryPage", { title: "Category update page", siteName: siteName?.title, favicon: siteName?.favicon, user, CategoryData })
        } catch (error) {
            console.log("error in CategoryController -> updateCategoryPage", error);
        }
    }

    async updateCategory(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to update this Category")
                return res.redirect("/admin/loginPage")
            }

            //check if the category name exists on req.body
            if (!req.body.name || req.body.name === "") {
                req.flash("error", "Category name is required")
                return res.redirect("/admin/updateCategoryPage/" + req.params.id)
            }

            //check if the category status exists on req.body
            // if ( (req.body.status !== 'active') || (req.body.status !== 'inactive') ) {
            //     console.log("req.body.status of category update controller", req.body);
                
            //     delete req.body.status
            // }

            if (!req.body) {
                req.flash("error", "Nothing to update")
                return res.redirect("/admin/updateCategoryPage/" + req.params.id)
            }

            // check if any other category exists with the same name
            const isCategoryExists = await CategoryRepo.checkCategoryExistanceById(req.params.id, req.body.name)
            if (isCategoryExists) {
                console.log("isCategoryExists", isCategoryExists);
                
                req.flash("error", "A category with the same name is already exists")
                return res.redirect("/admin/updateCategoryPage/" + req.params.id)
            }

            const updateCategoryResponse = await CategoryRepo.updateCategory(req.params.id, req.body)
            if (!updateCategoryResponse) {
                req.flash("error", "Sorry Category could not be updated, try again")
                return res.redirect("/admin/updateCategoryPage/" + req.params.id)
            }

            req.flash("success", "Category updated successfully")
            return res.redirect("/admin/allCategoriesPage")
            
        } catch (error) {
            console.log("error in CategoryController -> updateCategory", error);
        }
    }
}

module.exports = new CategoryController