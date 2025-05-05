const TestimonialsModel = require("../model/testimonial.model")

class TestimonialRepo {
    //create
    async createTestimonial(testimonials) {
        try {
            return await TestimonialsModel.create(testimonials)
        } catch (error) {
            console.log("error in TestimonialRepo -> createTestimonials", error);
        }
    }
    //retrieve
    async retrieveAllTestimonials() {
        try {
            const testimonialsData =  await TestimonialsModel.find({isDeleted: false, status: "active"})
            testimonialsData.activeCount = await TestimonialsModel.countDocuments({ isDeleted: false, status: "active" })
            testimonialsData.inactiveCount = await TestimonialsModel.countDocuments({ isDeleted: false, status: "inactive" })
            return testimonialsData
        } catch (error) {
            console.log("error in TestimonialRepo -> retrieveAllTestimonials", error);
        }
    }
    //retrieve single testimonials
    async retrieveSingleTestimonial(id) {
        try {
            return await TestimonialsModel.findOne({_id: id, isDeleted: false})
        } catch (error) {
            console.log("error in TestimonialRepo -> retrieveSingleTestimonial", error);
        }
    }
    //update
    async updateTestimonial(id, updateData) {
        try {
            return await TestimonialsModel.findByIdAndUpdate(id, updateData)
        } catch (error) {
            console.log("error in TestimonialRepo -> updateTestimonial", error);
        }
    }
    //delete
    async deleteTestimonial(id) {
        try {
            return await TestimonialsModel.findByIdAndUpdate(id, {isDeleted: true})
        } catch (error) {
            console.log("error in TestimonialRepo -> updateTestimonial", error);
        }
    }
}

module.exports = new TestimonialRepo