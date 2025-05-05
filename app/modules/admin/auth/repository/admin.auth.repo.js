const AdminModel = require("../model/admin.model");
const bcrypt = require("bcryptjs")

class AdminAuthRepo {
    async searchById(id) {
        try {
            return await AdminModel.findById(id)
        } catch (error) {
            console.log("Error in AdminAuthRepo -> searchById: ", error)
            throw new Error(error.message);
        }
    }

    async searchByEmail(email) {
        try {
            return await AdminModel.findOne({ email: email })
        } catch (error) {
            console.log("Error in AdminAuthRepo -> searchByEmail: ", error)
            throw new Error(error.message);
        }
    }

    async getAllAdminEmails() {
        try {
            return await AdminModel.find({}, { email: 1 })
        }
        catch (error) {
            console.log("Error in AdminAuthRepo -> getAllAdminEmails: ", error)
            throw new Error(error.message);
        }
    }

    async createAdmin(admin) {
        try {
            const freshAdmin = {
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                password: admin.password,
                image: admin.image,
                role: admin.role,
                timezone: admin.timezone,
            }
            return await AdminModel.create(freshAdmin)
        } catch (error) {
            console.log("Error in AdminAuthRepo -> createAdmin: ", error)
            throw new Error(error.message);
        }
    }

    async checkAdminSecretKey(key) {
        if (key === process.env.ADMIN_CONFIDENTIAL_CODE) {
            return true
        } else {
            console.log("key", key, "process.env.ADMIN_CONFIDENTIAL_CODE", process.env.ADMIN_CONFIDENTIAL_CODE);
            return false
        }
    }

    async searchByEmailAndSelect(email, select) {
        try {
            return await AdminModel.findOne({ email: email }).select(select)
        } catch (error) {
            console.log("Error in AdminAuthRepo -> searchByEmailAndSelect: ", error)
            throw new Error(error.message);
        }
    }

    async checkInstructorSecretKey(key) {
        if (key === process.env.INSTRUCTOR_CONFIDENTIAL_CODE) {
            return true
        } else {
            return false
        }
    }

    async updateAdminDetails(userId, details) {
        try {
            console.log("details received at AdminAuthRepo -> updateAdminDetails", details)
            return await AdminModel.findOneAndUpdate({ _id: userId }, {...details})
        } catch (error) {
            console.log("Error in AdminAuthRepo -> updateAdminDetails: ", error)
            throw new Error(error);
        }
    }

    async isUpdateEmailOccupied(id, email) {
        try {
            return await AdminModel.findOne({_id: {$ne: id}, email: email })
        } catch (error) {
            console.log("Error in AdminAuthRepo -> isUpdateEmailAvailable: ", error)
            throw new Error(error);
        }
    }

    async updateAdminPassword(email, password) {
        try {
            return await AdminModel.findOneAndUpdate({ email: email }, { password: password })
        } catch (error) {
            console.log("Error in AdminAuthRepo -> updateAdminPassword: ", error)
            throw new Error(error);
        }
    }

    async updateAdminImage(email, image) {
        try {
            return await AdminModel.findOneAndUpdate({ email: email }, { image: image })
        } catch (error) {
            console.log("Error in AdminAuthRepo -> updateAdminImage: ", error)
            throw new Error(error);
        }
    }

    async updateAdminOTP(email, otp) {
        try {
            return await AdminModel.findOneAndUpdate({ email: email }, { otp: otp })
        } catch (error) {
            console.log("Error in AdminAuthRepo -> updateAdminOTP: ", error)
            throw new Error(error);
        }
    }

    async hashPassword(password) {
        try {
            return await bcrypt.hash(password, await bcrypt.genSalt(10))
        } catch (error) {
            console.log("Error in AdminAuthRepo -> hashPassword: ", error)
            throw new Error(error);
        }
    }

    async comparePassword(password, hash) {
        try {
            return await bcrypt.compare(password, hash)
        } catch (error) {
            console.log("Error in AdminAuthRepo -> comparePassword: ", error)
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

module.exports = new AdminAuthRepo