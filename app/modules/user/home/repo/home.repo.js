const HomeSliderModel = require("../../../admin/cms/homepage/model/homeSlider.model")
const CategoryModel = require("../../../admin/category/model/category.model")
const BlogRepo = require("../../../blogs/repo/blog.repo")
const TestimonialRepo = require("../../../admin/testimonials/repository/testimonial.repo")

class HomeRepo {
    async getSliders() {
        try {
            const sliders = await HomeSliderModel.find({ isDeleted: false, status: "active" }).sort({ createdAt: -1})
            return sliders
        } catch (error) {
            console.error("Error in HomeRepo -> getSlider:", error);
        }
    }

    async getCategories() {
        try {
            const categories = await CategoryModel.find({ isDeleted: false, status: "active" }).sort({ createdAt: -1 })
            return categories
        } catch (error) {
            console.error("Error in HomeRepo -> getCategories:", error);
        }
    }

    async getAllBlogs(skip, limit) {
        try {
            const blogs = await BlogRepo.getAllBlogsWithoutPagination()
            return blogs
        } catch (error) {
            console.error("Error in HomeRepo -> getBlogs:", error);
        }
    }

    async getAllTestimonials() {
        try {
            const testimonials = await TestimonialRepo.retrieveAllTestimonials()
            return testimonials
        } catch (error) {
            console.error("Error in HomeRepo -> getAllTestimonials:", error);
        }
    }
}

module.exports = new HomeRepo()