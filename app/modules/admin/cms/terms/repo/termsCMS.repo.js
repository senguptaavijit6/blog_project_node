const termsPageCMSModel = require("../model/termsCMS.model")

class TermsPageCMSRepo {
    //create
    async createTerms(about) {
        try {
            return await termsPageCMSModel.create(about)
        } catch (error) {
            console.log("error in TermsPageCMSRepo -> createTerms", error);
        }
    }

    //retrieve
    async retrieveTerms() {
        try {
            return await termsPageCMSModel.findOne({ isDeleted: false })
        } catch (error) {
            console.log("error in TermsPageCMSRepo -> retrieveTerms", error);
        }
    }

    //update
    async updateTerms(id, updateData) {
        try {
            return await termsPageCMSModel.findOneAndUpdate({_id: id, isDeleted: false}, updateData)
        } catch (error) {
            console.log("error in TermsPageCMSRepo -> updateTerms", error);
        }
    }

    //delete
    async deleteTerms(id) {
        try {
            return await termsPageCMSModel.findOneAndUpdate({_id: id}, { isDeleted: true })
        } catch (error) {
            console.log("error in TermsPageCMSRepo -> deleteTerms", error);
        }
    }
}

module.exports = new TermsPageCMSRepo