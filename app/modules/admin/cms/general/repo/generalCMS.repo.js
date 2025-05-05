const GeneralCMSModel = require("../model/generalCMS.model")

class GeneralCMSRepo {
    //create
    async create(about) {
        try {
            return await GeneralCMSModel.create(about)
        } catch (error) {
            console.log("error in GeneralCMSRepo -> createTerms", error);
        }
    }

    //retrieve
    async retrieve() {
        try {
            return await GeneralCMSModel.findOne({ isDeleted: false })
        } catch (error) {
            console.log("error in GeneralCMSRepo -> retrieveTerms", error);
        }
    }

    //update
    async update(id, updateData) {
        try {
            return await GeneralCMSModel.findOneAndUpdate({_id: id, isDeleted: false}, updateData)
        } catch (error) {
            console.log("error in GeneralCMSRepo -> updateTerms", error);
        }
    }

    //delete
    async delete(id) {
        try {
            return await GeneralCMSModel.findOneAndUpdate({_id: id}, { isDeleted: true })
        } catch (error) {
            console.log("error in GeneralCMSRepo -> deleteTerms", error);
        }
    }
}

module.exports = new GeneralCMSRepo