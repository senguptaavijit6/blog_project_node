const UserAuthRepo = require("../../../user/auth/repository/user.auth.repo");
const EmailSender = require("../../../../helper/emailSender");
const AdminAuthRepo = require("../../auth/repository/admin.auth.repo");
const generalCMSRepo = require("../../cms/general/repo/generalCMS.repo");


class AdminUserController {
    async getAllUsers(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "You must be logged in to see Users")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()
            const authors = await UserAuthRepo.getAllUsers();
            if (!authors) {
                req.flash("error", "Sorry! Users could not be retrieved, try again.")
                return res.redirect("/admin/allUsersPage")
            }

            console.log('Authors from AdminUserController', authors);
            return res.render("pages/admin/allUsersPage", {
                title: "All Users",
                authors,
                siteName: siteName?.title, favicon: siteName?.favicon, 
                user,
            });
        } catch (error) {
            console.log("Error in AdminUserController -> getAllUsers: ", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async promoteToAdmin(req, res) {
        try {
            const admin = req.user
            if (!admin) {
                req.flash("error", "You must be logged in to see Users")
                return res.redirect("/admin/loginPage")
            }
            const userId = req.params.userId;
            if (!userId) {
                req.flash("error", "User ID is required")
                return res.redirect("/admin/userManagement")
            }
            const user = await UserAuthRepo.searchById(userId);
            if (!user) {
                req.flash("error", "User not found")
                return res.redirect("/admin/userManagement")
            }

            console.log('user from promoteToAdmin', user);

            
            const tempPassword = Math.random().toString(36).slice(-8);
            const emailSender = new EmailSender("gmail", process.env.EMAIL_USER, process.env.EMAIL_PASS)
            const mailObj = {
                to: user.email,
                subject: "Upgradation to Admin",
                html: `<h1>Congratulations!</h1> 
                <h3>You have been promoted to admin. Your temporary password is: ${tempPassword}.</h3>
                <p>From now on you need to login using "Login as admin" page</p>
                <p>Use this password to log in to your account. Please change your password and profile picture from settings after logging in.</p>`,
            }
            await emailSender.sendMail(mailObj)
            const hashedPassword = await UserAuthRepo.hashPassword(tempPassword);
            if (!hashedPassword) {
                req.flash("error", "Password hashing failed")
                return res.redirect("/admin/userManagement")
            }

            // update the user details with the new password and role
            user.password = hashedPassword;
            user.role = "admin";
            user.otp = null;
            delete user.avatar; // remove the avatar field if it exists
            user.image = "sample.png"; // set the default image for admin

            const createAdmin = await AdminAuthRepo.createAdmin(user);
            if (!createAdmin) {
                req.flash("error", "User could not be promoted to admin, try again.")
                return res.redirect("/admin/userManagement")
            }
            req.flash("success", "User promoted to admin successfully")
            const deleteUser = await UserAuthRepo.deleteUser(userId);
            if (!deleteUser) {
                req.flash("error", "Something went Wrong, try again.")
                return res.redirect("/admin/userManagement")
            }
            return res.redirect("/admin/userManagement")
        } catch (error) {
            console.log("Error in AdminUserController -> promoteToAdmin: ", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async enableUser(req, res) {
        try {
            const admin = req.user
            if (!admin) {
                req.flash("error", "You must be logged in to see Users")
                return res.redirect("/admin/loginPage")
            }
            const userId = req.params.userId;
            if (!userId) {
                req.flash("error", "User ID is required")
                return res.redirect("/admin/userManagement")
            }
            const user = await UserAuthRepo.searchById(userId);
            if (!user) {
                req.flash("error", "User not found")
                return res.redirect("/admin/userManagement")
            }

            console.log('user from enableUser', user);

            // update the user details with the new password and role
            const updatedUser = await UserAuthRepo.updateUserDetails(userId, {isDisabled: false});
            if (!updatedUser) {
                req.flash("error", "User could not be enabled, try again.")
                return res.redirect("/admin/userManagement")
            }
            req.flash("success", "User enabled successfully")
            return res.redirect("/admin/userManagement")

        } catch (error) {
            console.log("Error in AdminUserController -> enableUser: ", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async disableUser(req, res) {
        try {
            const admin = req.user
            if (!admin) {
                req.flash("error", "You must be logged in to see Users")
                return res.redirect("/admin/loginPage")
            }
            const userId = req.params.userId;
            if (!userId) {
                req.flash("error", "User ID is required")
                return res.redirect("/admin/userManagement")
            }
            const user = await UserAuthRepo.searchById(userId);
            if (!user) {
                req.flash("error", "User not found")
                return res.redirect("/admin/userManagement")
            }

            console.log('user from disableUser', user);

            // update the user details with the new password and role
            const updatedUser = await UserAuthRepo.updateUserDetails(userId, {isDisabled: true});
            if (!updatedUser) {
                req.flash("error", "User could not be disabled, try again.")
                return res.redirect("/admin/userManagement")
            }
            req.flash("success", "User disabled successfully")
            return res.redirect("/admin/userManagement")

        } catch (error) {
            console.log("Error in AdminUserController -> disableUser: ", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}

module.exports = new AdminUserController