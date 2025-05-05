const AdminOTPModel = require("../model/otp.model")
const bcrypt = require("bcryptjs")

class AdminOTPRepo {
    async searchByEmail(email) {
        try {
            return AdminOTPModel.findOne({ email: email })
        } catch (error) {
            console.log("Error in AdminOTPRepo -> searchByEmail: ", error)
            throw new Error(error.message);
        }
    }

    async searchByEmailAndSelect(email, select) {
        try {
            return AdminOTPModel.findOne({ email: email }).select(select)
        } catch (error) {
            console.log("Error in AdminOTPRepo -> searchByEmailAndSelect: ", error)
            throw new Error(error.message);
        }
    }

    async updateByEmail(email, reqBody) {
        try {
            return AdminOTPModel.findOneAndUpdate({ email: email }, reqBody)

        } catch (error) {
            console.log("Error in AdminOTPRepo -> updateOTP: ", error)
            throw new Error(error.message);
        }
    }

    async createEntry(admin) {
        try {
            return AdminOTPModel.create(admin)
        } catch (error) {
            console.log("Error in AdminOTPRepo -> createEntry: ", error)
            throw new Error(error.message);
        }
    }

    async deleteEntry(email) {
        try {
            return AdminOTPModel.deleteOne({ email: email })
        } catch (error) {
            console.log("Error in AdminOTPRepo -> deleteByEmail: ", error)
            throw new Error(error.message);
        }
    }

    async hashOTP(OTP) {
        return await bcrypt.hash(OTP, await bcrypt.genSalt(10))
    }

    async compareOTP(OTP, hash) {
        return await bcrypt.compare(OTP, hash)
    }
}

module.exports = new AdminOTPRepo