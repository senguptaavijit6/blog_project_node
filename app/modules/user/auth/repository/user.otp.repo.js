const UserOTPModel = require("../model/otp.model")
const bcrypt = require("bcryptjs")

class UserOTPRepo {
    async searchByEmail(email) {
        try {
            return UserOTPModel.findOne({ email: email })
        } catch (error) {
            console.log("Error in UserOTPRepo -> searchByEmail: ", error)
            throw new Error(error.message);
        }
    }

    async searchByEmailAndSelect(email, select) {
        try {
            return UserOTPModel.findOne({ email: email }).select(select)
        } catch (error) {
            console.log("Error in UserOTPRepo -> searchByEmailAndSelect: ", error)
            throw new Error(error.message);
        }
    }

    async updateByEmail(email, reqBody) {
        try {
            return UserOTPModel.findOneAndUpdate({ email: email }, reqBody)

        } catch (error) {
            console.log("Error in UserOTPRepo -> updateOTP: ", error)
            throw new Error(error.message);
        }
    }

    async createEntry(user) {
        try {
            return UserOTPModel.create(user)
        } catch (error) {
            console.log("Error in UserOTPRepo -> createEntry: ", error)
            throw new Error(error.message);
        }
    }

    async deleteEntry(email) {
        try {
            return UserOTPModel.deleteOne({ email: email })
        } catch (error) {
            console.log("Error in UserOTPRepo -> deleteByEmail: ", error)
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

module.exports = new UserOTPRepo