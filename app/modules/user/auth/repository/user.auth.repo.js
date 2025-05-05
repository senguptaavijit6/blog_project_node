const UserModel = require("../model/user.model");
const bcrypt = require("bcryptjs")

class UserAuthRepo {
    async getAllUsers() {
        try {
            return await UserModel.find({}).sort({createdAt: -1}).select("-password -otp -__v")
        } catch (error) {
            console.log("Error in UserAuthRepo -> getAllUsers: ", error)
            throw new Error(error.message);
        }
    }

    async searchById(id) {
        try {
            return await UserModel.findById(id)
        } catch (error) {
            console.log("Error in UserAuthRepo -> searchById: ", error)
            throw new Error(error.message);
        }
    }

    async searchByEmail(email) {
        try {
            return await UserModel.findOne({ email: email })
        } catch (error) {
            console.log("Error in UserAuthRepo -> searchByEmail: ", error)
            throw new Error(error.message);
        }
    }

    async createUser(user) {
        try {
            const freshUser = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                avatar: user.avatar,
                role: user.role,
                timezone: user.timezone,
            }
            return await UserModel.create(freshUser)
        } catch (error) {
            console.log("Error in UserAuthRepo -> createUser: ", error)
            throw new Error(error.message);
        }
    }

    async searchByEmailAndSelect(email, select) {
        try {
            return await UserModel.findOne({ email: email }).select(select)
        } catch (error) {
            console.log("Error in UserAuthRepo -> searchByEmailAndSelect: ", error)
            throw new Error(error.message);
        }
    }

    async updateUserDetails(userId, details) {
        try {
            console.log("details received at UserAuthRepo -> updateUserDetails", details)
            return await UserModel.findOneAndUpdate({ _id: userId }, {...details})
        } catch (error) {
            console.log("Error in UserAuthRepo -> updateUserDetails: ", error)
            throw new Error(error);
        }
    }

    async isUpdateEmailOccupied(id, email) {
        try {
            return await UserModel.findOne({_id: {$ne: id}, email: email })
        } catch (error) {
            console.log("Error in UserAuthRepo -> isUpdateEmailAvailable: ", error)
            throw new Error(error);
        }
    }

    async updateUserPassword(email, password) {
        try {
            return await UserModel.findOneAndUpdate({ email: email }, { password: password })
        } catch (error) {
            console.log("Error in UserAuthRepo -> updateUserPassword: ", error)
            throw new Error(error);
        }
    }

    async updateUserAvatar(email, avatar) {
        try {
            return await UserModel.findOneAndUpdate({ email: email }, { avatar: avatar })
        } catch (error) {
            console.log("Error in UserAuthRepo -> updateUserImage: ", error)
            throw new Error(error);
        }
    }

    async updateUserOTP(email, otp) {
        try {
            return await UserModel.findOneAndUpdate({ email: email }, { otp: otp })
        } catch (error) {
            console.log("Error in UserAuthRepo -> updateUserOTP: ", error)
            throw new Error(error);
        }
    }

    async deleteUser(id) {
        try {
            return await UserModel.findByIdAndDelete(id)
        }
        catch (error) {
            console.log("Error in UserAuthRepo -> deleteUser: ", error)
            throw new Error(error);
        }
    }

    async hashPassword(password) {
        try {
            return await bcrypt.hash(password, await bcrypt.genSalt(10))
        } catch (error) {
            console.log("Error in UserAuthRepo -> hashPassword: ", error)
            throw new Error(error);
        }
    }

    async comparePassword(password, hash) {
        try {
            return await bcrypt.compare(password, hash)
        } catch (error) {
            console.log("Error in UserAuthRepo -> comparePassword: ", error)
            throw new Error(error);
        }
    }

    async hashOTP(OTP) {
        return await bcrypt.hash(OTP, await bcrypt.genSalt(10))
    }

    async compareOTP(OTP, hash) {
        return await bcrypt.compare(OTP, hash)
    }
}

module.exports = new UserAuthRepo