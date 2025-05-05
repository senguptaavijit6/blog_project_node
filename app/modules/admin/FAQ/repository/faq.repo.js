const FAQModel = require("../model/faq.model")

class FAQRepo {
    //create
    async createFAQ(faq) {
        try {
            return await FAQModel.create(faq)
        } catch (error) {
            console.log("error in FAQRepo -> createFaq", error);
        }
    }
    //retrieve
    async retrieveAllFAQs() {
        try {
            const faqData =  await FAQModel.find({isDeleted: false})
            faqData.activeCount = await FAQModel.countDocuments({ isDeleted: false, status: "active" })
            faqData.inactiveCount = await FAQModel.countDocuments({ isDeleted: false, status: "inactive" })
            return faqData
        } catch (error) {
            console.log("error in FAQRepo -> retrieveAllFAQs", error);
        }
    }
    //retrieve single faq
    async retrieveSingleFAQ(id) {
        try {
            return await FAQModel.findOne({_id: id, isDeleted: false})
        } catch (error) {
            console.log("error in FAQRepo -> retrieveSingleFAQ", error);
        }
    }
    //update
    async updateFAQ(id, updateData) {
        try {
            return await FAQModel.findByIdAndUpdate(id, updateData)
        } catch (error) {
            console.log("error in FAQRepo -> updateFAQ", error);
        }
    }
    //delete
    async deleteFAQ(id) {
        try {
            return await FAQModel.findByIdAndUpdate(id, {isDeleted: true})
        } catch (error) {
            console.log("error in FAQRepo -> updateFAQ", error);
        }
    }
}

module.exports = new FAQRepo