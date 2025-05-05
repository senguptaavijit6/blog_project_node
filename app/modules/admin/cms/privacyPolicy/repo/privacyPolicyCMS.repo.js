const privacyPolicyCMSModel = require("../model/privacyPolicyCMS.model")

class PrivacyPolicyCMSRepo {
    //create
    async createPolicy(about) {
        try {
            return await privacyPolicyCMSModel.create(about)
        } catch (error) {
            console.log("error in PrivacyPolicyCMSRepo -> createPolicy", error);
        }
    }

    //retrieve
    async retrievePolicy() {
        try {
            return await privacyPolicyCMSModel.findOne({ isDeleted: false })
        } catch (error) {
            console.log("error in PrivacyPolicyCMSRepo -> retrievePolicy", error);
        }
    }

    //update
    async updatePolicy(id, updateData) {
        try {
            return await privacyPolicyCMSModel.findOneAndUpdate({_id: id, isDeleted: false}, updateData)
        } catch (error) {
            console.log("error in PrivacyPolicyCMSRepo -> updatePolicy", error);
        }
    }

    //delete
    async deletePolicy(id) {
        try {
            return await privacyPolicyCMSModel.findOneAndUpdate({_id: id}, { isDeleted: true })
        } catch (error) {
            console.log("error in PrivacyPolicyCMSRepo -> deletePolicy", error);
        }
    }
}

module.exports = new PrivacyPolicyCMSRepo