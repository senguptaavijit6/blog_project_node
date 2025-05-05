const AboutUsCMSModel = require("../model/aboutUsCMS.model")

class AboutUsCMSRepo {
    //create
    async createAboutUs(about) {
        try {
            return await AboutUsCMSModel.create(about)
        } catch (error) {
            console.log("error in AboutUsCMSRepo -> createAboutUs", error);
        }
    }

    //retrieve
    async retrieveAboutUs() {
        try {
            return await AboutUsCMSModel.findOne({ isDeleted: false })
        } catch (error) {
            console.log("error in AboutUsCMSRepo -> retrieveAboutUs", error);
        }
    }

    //update
    async updateAboutUs(id, updateData) {
        try {
            return await AboutUsCMSModel.findOneAndUpdate({_id: id, isDeleted: false}, updateData)
        } catch (error) {
            console.log("error in AboutUsCMSRepo -> updateAboutUs", error);
        }
    }

    //delete
    async deleteAboutUs(id) {
        try {
            return await AboutUsCMSModel.findOneAndUpdate({_id: id}, { isDeleted: true })
        } catch (error) {
            console.log("error in AboutUsCMSRepo -> deleteAboutUs", error);
        }
    }
}

module.exports = new AboutUsCMSRepo