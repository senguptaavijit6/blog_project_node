const UserAuthRepo = require("../repository/user.auth.repo");
const UserOtpRepo = require("../repository/user.otp.repo");
const EmailSender = require("../../../../helper/emailSender")
const jwt = require("jsonwebtoken");
const timezones = require("timezones-list");
const AdminAuthRepo = require("../../../admin/auth/repository/admin.auth.repo");
const generalCMSRepo = require("../../../admin/cms/general/repo/generalCMS.repo");


class UserAuthController {
    async registerPage(req, res) {
        try {
            const siteName = await generalCMSRepo.retrieve()
            return res.render("auth/user/registerPage", { title: "Register page for user", siteName: siteName?.title, favicon: siteName?.favicon, timezones: timezones.default })
        } catch (error) {
            console.error("user register page controller error", error);
        }
    }

    async register(req, res) {
        try {
            console.log("req body and req file from user register", req.body);
            const siteName = await generalCMSRepo.retrieve()

            if (!req.body.firstName) {
                req.flash("error", "First name is required")
                return res.redirect("/registerPage")
            }

            if (!req.body.lastName) {
                req.flash("error", "Last name is required")
                return res.redirect("/registerPage")
            }

            if (!req.body.email) {
                req.flash("error", "Email id is required")
                return res.redirect("/registerPage")
            }

            if (!req.body.password) {
                req.flash("error", "Password is required")
                return res.redirect("/registerPage")
            }

            if (!req.body.avatar) {
                req.flash("error", "Avatar is required")
                return res.redirect("/registerPage")
            }

            if (!req.body.timezone) {
                req.flash("error", "timezone is required")
                return res.redirect("/registerPage")
            }

            //check if any user is there with the same email
            const isEmailExists = await UserAuthRepo.searchByEmail(req.body.email)
            const isEmailExistsInOtp = await UserOtpRepo.searchByEmail(req.body.email)
            console.log("is Email of user exists? ", isEmailExists);

            if (isEmailExists) {
                req.flash("error", "This email is already registered and verified, you can login")
                return res.redirect("/loginPage")
            }

            // hash the password
            req.body.password = await UserAuthRepo.hashPassword(req.body.password)
            console.log("hashed password", req.body.password);

            //check the data if everything is correct
            console.log("data to be saved", req.body);

            //Generate OTP and set to req.body
            const otp = Math.floor(100000 + Math.random() * 900000)
            req.body.otp = await UserOtpRepo.hashOTP(otp.toString())

            //is email exists in otp
            if (isEmailExistsInOtp) {
                //if same email exists update the otp to the database
                const updateUserOTP = await UserOtpRepo.updateByEmail(req.body.email, req.body)
                console.log("updated user otp", updateUserOTP);
            } else {
                //else create the otp to the OTP database
                const saveToUserOtp = await UserOtpRepo.createEntry(req.body)
                console.log("saved user otp", saveToUserOtp);
            }



            //send the email to the user for verification
            const emailSender = new EmailSender("gmail", process.env.EMAIL_USER, process.env.EMAIL_PASS)
            const mailObj = {
                to: req.body.email,
                subject: `Verification Email from ${siteName.title}`,
                html: `Your OTP is ${otp}, you don't need to remember or write down any of these, this is for one time use only <br />
                <b style="color: red">if you don't verify your email within 10 minutes, you will need to register again<b>`
            }
            await emailSender.sendMail(mailObj)
            req.flash("success", `OTP has been sent to your email (${req.body.email}), please verify`)
            return res.redirect(`/verifyEmailPage/${req.body.email}?fallback=registerPage`)
        } catch (error) {
            console.error("user register controller error", error);
        }
    }

    async verifyEmailPage(req, res) {
        try {
            const userEmail = req.params.email
            const fallback = req.query.fallback
            console.log("user email", userEmail);
            const siteName = await generalCMSRepo.retrieve()
            return res.render("auth/user/emailVerificationPage", { title: "Email verification for user", siteName: siteName?.title, favicon: siteName?.favicon, userEmail, fallback })
        } catch (error) {
            console.error("user verifyEmailPage controller error", error);
        }
    }

    async verifyEmail(req, res) {
        try {
            console.log("req body and params from user verifyEmail", req.body, req.params);
            const siteName = await generalCMSRepo.retrieve()
            const fallback = req.query.fallback

            if (!req.body.otp) {
                req.flash("error", "OTP is required")
                return res.redirect(`/verifyEmailPage/${req.params.email}`)
            }

            // check if the user's email exists
            const isUserEmailExists = await UserOtpRepo.searchByEmailAndSelect(req.params.email, "-_id -__v -createdAt -updatedAt")
            console.log("is user email exists", isUserEmailExists);

            if (!isUserEmailExists) {
                req.flash("error", "Email is incorrect")
                return res.redirect(`/verifyEmailPage/${req.params.email}`)
            }

            //compare the otp
            const isOtpMatched = await UserOtpRepo.compareOTP(req.body.otp.toString(), isUserEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/${fallback}/${req.params.email}`)
            }

            //save the data to the database
            console.log("data to be saved from verifyEmail Controller", isUserEmailExists);

            const deleteOtpModelEntry = await UserOtpRepo.deleteEntry(isUserEmailExists.email)
            console.log("deleted otp model entry", deleteOtpModelEntry);
            const savedData = await UserAuthRepo.createUser(isUserEmailExists)
            console.log("saved data", savedData);
            if (!savedData) {
                req.flash("error", "Sorry could not register, try again")
                return res.redirect("/registerPage")
            }
            
            //send the email to the admin for notification
            const emailSender = new EmailSender("gmail", process.env.EMAIL_USER, process.env.EMAIL_PASS)
            const adminEmails = await AdminAuthRepo.getAllAdminEmails()
            console.log('admin Emails', adminEmails);
            const mailObj = {
                // to: req.body.email,
                subject: `New user Registered at ${siteName.title}`,
                html: `<h3>A new user has registered at ${siteName.title}Blog,</h3>
                <hr />
                <p>First Name: ${savedData.firstName}</p>
                <p>Last Name: ${savedData.lastName}</p>
                <p>Email: ${savedData.email}</p>
                <p>Role: ${savedData.role}</p>`
            }
            adminEmails.forEach(async (admin) => {await emailSender.sendMail({...mailObj, to: admin.email})})
            req.flash("success", "You have successfully registered, please login")
            return res.redirect("/loginPage")

        } catch (error) {
            console.error("user verifyEmail controller error", error);
        }
    }

    async loginPage(req, res) {
        try {
            const siteName = await generalCMSRepo.retrieve()
            return res.render("auth/user/loginPage", { title: "Login page for user", siteName: siteName?.title, favicon: siteName?.favicon, })
        } catch (error) {
            console.error("user loginPage controller error", error);
        }
    }

    async login(req, res) {
        try {
            console.log("req body from user login", req.body);

            if (!req.body.email) {
                req.flash("error", "Email id is required")
                return res.redirect("/registerPage")
            }

            if (!req.body.password) {
                req.flash("error", "Password is required")
                return res.redirect("/registerPage")
            }

            //check if the email exists
            const isEmailExists = await UserAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of user exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/registerPage")
            }

            //compare the password
            const isPasswordMatched = await UserAuthRepo.comparePassword(req.body.password, isEmailExists.password)
            console.log("is password matched", isPasswordMatched);
            if (!isPasswordMatched) {
                req.flash("error", "Email or Password is incorrect")
                return res.redirect("/loginPage")
            }

            //generate the token
            const token = jwt.sign({ id: isEmailExists._id, role: isEmailExists.role }, process.env.JWT_SECRET, { expiresIn: "1h" })
            console.log("token", token);

            //set the token in session
            req.session.token = token
            // set the user in req.user
            req.user = isEmailExists

            req.flash("success", "You have successfully logged in")
            return res.redirect("/dashboard")

        } catch (error) {
            console.error("user login controller error", error);
        }
    }

    async loginUsingOTP(req, res) {
        try {
            console.log("req body from user loginUsingOTP", req.body);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/loginPage")
            }

            if (!req.body.otp) {
                req.flash("error", "OTP is required")
                return res.redirect("/loginPage")
            }

            //check if the email exists
            const isEmailExists = await UserAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of user exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/registerPage")
            }

            //check if the otp is correct
            const isOtpMatched = await UserAuthRepo.compareOTP(req.body.otp, isEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/loginPage`)
            }

            //generate the token
            const token = jwt.sign({ id: isEmailExists._id, role: isEmailExists.role }, process.env.JWT_SECRET, { expiresIn: "1h" })

            //set the token in session
            req.session.token = token
            // set the user in req.user
            req.user = isEmailExists

            req.flash("success", "You have successfully logged in")
            return res.redirect("/dashboard")
        } catch (error) {
            console.error("user loginUsingOTP controller error", error);

        }
    }

    async changePasswordUsingOTPPage(req, res) {
        try {
            console.log("req params from user changePasswordUsingOTPPage", req.params);
            if (!req.params.email) {
                req.flash("error", "Email is required")
                return res.redirect("/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            if (!req.params.otp) {
                req.flash("error", "OTP is required")
                return res.redirect("/loginPage")
            }

            //check if the email exists
            const isEmailExists = await UserAuthRepo.searchByEmail(req.params.email)
            console.log("is Email of user exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/registerPage")
            }

            //check if the otp is correct
            const isOtpMatched = await UserAuthRepo.compareOTP(req.params.otp, isEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/loginPage`)
            }

            return res.render("auth/user/changePasswordUsingOTPPage", { title: "Change password page for user", siteName: siteName?.title, favicon: siteName?.favicon, user: isEmailExists, userOTP: req.params.otp })
        } catch (error) {
            console.error("user changePasswordPage controller error", error);
        }
    }

    async changePasswordUsingOTP(req, res) {
        try {
            console.log("req body from user changePasswordUsingOTP", req.body);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/loginPage")
            }

            if (!req.body.otp) {
                req.flash("error", "OTP is required")
                return res.redirect("/loginPage")
            }

            if (!req.body.password) {
                req.flash("error", "Password is required")
                return res.redirect("/loginPage")
            }

            //check if the email exists
            const isEmailExists = await UserAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of user exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/registerPage")
            }

            //check if the otp is correct
            const isOtpMatched = await UserAuthRepo.compareOTP(req.body.otp, isEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/loginPage`)
            }

            //hash the password
            req.body.password = await UserAuthRepo.hashPassword(req.body.password)
            console.log("hashed password", req.body.password);

            //update the password
            const updatePassword = await UserAuthRepo.updateUserPassword(req.body.email, req.body.password)
            console.log("updated password", updatePassword);

            // sent an email to the user that the password has been changed
            const emailSender = new EmailSender("gmail", process.env.EMAIL_USER, process.env.EMAIL_PASS)
            const mailObj = {
                to: req.body.email,
                subject: "Password Changed",
                html: `Your password has been changed successfully as you've forgotten your password, if you didn't change it, please contact us immediately`
            }
            await emailSender.sendMail(mailObj)

            req.flash("success", "Password has been changed successfully, please login")
            return res.redirect("/loginPage")
        } catch (error) {
            console.error("user changePasswordUsingOTP controller error", error);
        }
    }

    // dashboard is located at app/modules/user/blogs/controller

    redirectToAccountSettingsPage(req, res) {
        try {
            return res.redirect("/settings/account")
        } catch (error) {
            console.error("user redirectToAccountSettingsPage controller error", error);
        }
    }

    async accountSettingsPage(req, res) {
        try {
            const user = req.user
            console.log("user", user);
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()
            return res.render("pages/user/settingsPage", { title: "Settings page for user", siteName: siteName?.title, favicon: siteName?.favicon, user })
        } catch (error) {
            console.error("user settingsPage controller error", error);
        }
    }

    async siteSettingsPage(req, res) {
        try {
            const user = req.user
            console.log("user", user);
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()
            return res.render("pages/user/siteSettingsPage", { title: `Update details of ${user.role}`, siteName: siteName?.title, favicon: siteName?.favicon, user, timezones: timezones.default })
        } catch (error) {
            console.error("user siteSettingsPage controller error", error);
        }
    }

    async updateSiteDetails(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }

            console.log("req.body from updateSiteDetails", req.body);

            const updateResponse = await UserAuthRepo.updateUserDetails(user._id, req.body)
            console.log("update response from updateSiteDetails", updateResponse)
            if (!updateResponse) {
                req.flash("error", "Sorry could not update site details, try again")
                return res.redirect("/settings/site")
            }

            req.flash("success", "Site settings updated successfully")
            return res.redirect("/settings/site")
            // return res.render("pages/user/updateDetailsPage", { title: `Update details of ${user.role}`, user, timezones: timezones.default })
        } catch (error) {
            console.error("user updateSiteDetails controller error", error);
        }
    }

    async updateDetailsPage(req, res) {
        try {
            const user = req.user

            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            console.log("user from updateDetailsPage", user);
            return res.render("pages/user/updateDetailsPage", { title: `Update details of ${user.role}`, siteName: siteName?.title, favicon: siteName?.favicon, user })
        } catch (error) {
            console.error("user updateDetailsPage controller error", error);
        }
    }

    async updateDetails(req, res) {
        try {
            console.log("req body from user updateDetails", req.body);
            const user = req.user

            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }

            // check if the email is occupied
            if (req.body.email !== user.email && await UserAuthRepo.isUpdateEmailOccupied(user._id, req.body.email)) {
                req.flash("error", "Email is already occupied")
                return res.redirect(`/updateDetailsPage`)
            }

            // check the secret key
            // if (req.body.role === 'user') {
            //     const checkSecret = await UserAuthRepo.checkUserSecretKey(req.body.secretKey)
            //     if (!checkSecret) {
            //         req.flash("error", "You don't have the permission to register as user")
            //         return res.redirect(`/updateDetailsPage`)
            //     }
            // } else if (req.body.role === 'instructor') {
            //     const checkSecret = await UserAuthRepo.checkInstructorSecretKey(req.body.secretKey)
            //     if (!checkSecret) {
            //         req.flash("error", "You don't have the permission to register as instructor")
            //         return res.redirect(`/updateDetailsPage`)
            //     }
            // }

            req.body.isEmailVerified = false
            req.body.otp = null

            // generate the otp
            const otp = Math.floor(100000 + Math.random() * 900000)
            req.body.otp = await UserAuthRepo.hashOTP(otp.toString())

            //send the email to the user for verification
            const emailSender = new EmailSender("gmail", process.env.EMAIL_USER, process.env.EMAIL_PASS)
            const mailObj = {
                to: req.body.email,
                subject: "Verification Email",
                html: `Your OTP is ${otp}, you don't need to remember or write down any of these, this is for one time use only <br />
                <b>if you don't verify your email within 10 minutes, you will need to register again<b>`
            }
            await emailSender.sendMail(mailObj)

            //update the details
            const updateDetails = await UserAuthRepo.updateUserDetails(user.id, req.body)
            console.log("updated details from updateDetails controller", updateDetails);

            req.flash("success", "Details has been updated successfully, please verify your email")
            return res.redirect(`/verifyEmailToUpdateDetailsPage`)
        } catch (error) {
            console.error("user changeDetails controller error", error);
        }
    }

    async verifyEmailToUpdateDetailsPage(req, res) {
        try {
            const user = req.user
            console.log("user", user);

            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            return res.render("auth/user/verifyEmailToUpdateDetailsPage", { title: "Change details page for user", siteName: siteName?.title, favicon: siteName?.favicon, user })
        } catch (error) {
            console.error("user changeDetailsPage controller error", error);
        }
    }

    async verifyEmailToUpdateDetails(req, res) {
        try {
            console.log("req body and user from user verifyEmailToUpdateDetails", req.body, req.user);
            const user = req.user
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/loginPage")
            }

            if (!req.body.otp) {
                req.flash("error", "OTP is required")
                return res.redirect(`/verifyEmailToUpdateDetailsPage`)
            }

            // check if the user's email exists
            const isUserEmailExists = await UserAuthRepo.searchByEmailAndSelect(user.email, "-__v -createdAt -updatedAt")
            console.log("is user email exists", isUserEmailExists);

            if (!isUserEmailExists) {
                req.flash("error", "Email is incorrect")
                return res.redirect(`/verifyEmailToUpdateDetailsPage`)
            }

            //compare the otp
            const isOtpMatched = await UserAuthRepo.compareOTP(req.body.otp.toString(), isUserEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/verifyEmailToUpdateDetailsPage`)
            }

            //save the data to the database
            console.log("data to be saved", isUserEmailExists);

            const savedData = await UserAuthRepo.updateUserDetails(isUserEmailExists._id, { isEmailVerified: true, otp: null })
            console.log("saved data", savedData);
            req.flash("success", "You have successfully registered, please login")
            return res.redirect("/loginPage")

        } catch (error) {
            console.error("user verifyEmail controller error", error);
        }
    }

    async changePasswordUsingPasswordPage(req, res) {
        try {
            const user = req.user
            console.log("user", user);
            const siteName = await generalCMSRepo.retrieve()
            return res.render("auth/user/changePasswordUsingPasswordPage", { title: "Change password page for user", siteName: siteName?.title, favicon: siteName?.favicon, user })
        } catch (error) {
            console.error("user changePasswordPage controller error", error);
        }
    }

    async changePasswordUsingPassword(req, res) {
        try {
            console.log("req body from user changePasswordUsingPassword", req.body);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/loginPage")
            }

            if (!req.body.oldPassword) {
                req.flash("error", "Old password is required")
                return res.redirect("/settings")
            }

            if (!req.body.newPassword) {
                req.flash("error", "New password is required")
                return res.redirect("/settings")
            }

            //check if the email exists
            const isEmailExists = await UserAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of user exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/registerPage")
            }

            //compare the password
            const isPasswordMatched = await UserAuthRepo.comparePassword(req.body.oldPassword, isEmailExists.password)
            console.log("is password matched", isPasswordMatched);
            if (!isPasswordMatched) {
                req.flash("error", "Old password is incorrect")
                return res.redirect("/settings")
            }

            //hash the new password
            req.body.password = await UserAuthRepo.hashPassword(req.body.newPassword)
            console.log("hashed password", req.body.password);

            //update the password
            const updatePassword = await UserAuthRepo.updateUserPassword(req.body.email, req.body.password)
            console.log("updated password", updatePassword);

            // sent an email to the user that the password has been changed
            const emailSender = new EmailSender("gmail", process.env.EMAIL_USER, process.env.EMAIL_PASS)
            const mailObj = {
                to: req.body.email,
                subject: "Password Changed",
                html: `Your password has been changed successfully`
            }
            await emailSender.sendMail(mailObj)

            req.flash("success", "Password has been changed successfully")
            return res.redirect("/settings")

        } catch (error) {
            console.error("user changePasswordUsingPassword controller error", error);
        }
    }

    async changeImagePage(req, res) {
        try {
            const user = req.user
            console.log("user", user);
            const siteName = await generalCMSRepo.retrieve()
            return res.render("pages/user/changeImagePage", { title: "Change image page for user", siteName: siteName?.title, favicon: siteName?.favicon, user })
        } catch (error) {
            console.error("user changeImagePage controller error", error);
        }
    }

    async changeImage(req, res) {
        try {
            console.log("req body from user changeImage", req.body);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/loginPage")
            }

            //check if the email exists
            const isEmailExists = await UserAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of user exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/registerPage")
            }

            //update the image
            const updateImage = await UserAuthRepo.updateUserAvatar(req.body.email, req.body.avatar)
            console.log("updated image", updateImage);
            

            req.flash("success", "Profile image has been changed successfully")
            return res.redirect("/settings")
        } catch (error) {
            console.error("user changeImage controller error", error);
        }
    }

    async forgotPasswordPage(req, res) {
        try {
            const siteName = await generalCMSRepo.retrieve()
            return res.render("auth/user/forgotPasswordPage", { title: "Forgot password page for user", siteName: siteName?.title, favicon: siteName?.favicon,  })
        } catch (error) {
            console.error("user forgotPasswordPage controller error", error);
        }
    }

    async forgotPasswordOTPPage(req, res) {
        try {
            console.log("req body from user forgotPasswordPage", req.body);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/forgotPasswordPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            //is email exists
            const isEmailExists = await UserAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of user exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/registerPage")
            }

            //Generate OTP and hash it
            const otp = Math.floor(100000 + Math.random() * 900000)
            const hashedOTP = await UserOtpRepo.hashOTP(otp.toString())

            //send the OTP via email to the user for verification
            const emailSender = new EmailSender("gmail", process.env.EMAIL_USER, process.env.EMAIL_PASS)
            const mailObj = {
                to: req.body.email,
                subject: "Verification Email",
                html: `Your OTP is ${otp}, you don't need to remember or write down any of these, this is for one time use only <br />
                <b style="color: red">This OTP is avaiable for 10 minutes<b>
                <b>Always enter the last OTP you received<b>`
            }
            await emailSender.sendMail(mailObj)

            //save the otp to the database
            const saveToUserOtp = await UserAuthRepo.updateUserOTP(req.body.email, hashedOTP)
            console.log("saved user otp", saveToUserOtp);
            return res.render("auth/user/forgotPasswordOTPPage", { title: "Forgot password OTP verification page for user", siteName: siteName?.title, favicon: siteName?.favicon, userEmail: req.body.email })
        } catch (error) {
            console.error("user forgotPasswordOTPVerificationPage controller error", error);
        }
    }

    async forgotPasswordOTPVerification(req, res) {
        try {
            console.log("req body from user forgotPasswordOTPVerification", req.body);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/forgotPasswordPage")
            }
            if (!req.body.otp) {
                req.flash("error", "OTP is required")
                return res.redirect("/forgotPasswordOTPPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            //check if the email exists
            const isEmailExists = await UserAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of user exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/registerPage")
            }

            //check if the otp is correct
            const isOtpMatched = await UserAuthRepo.compareOTP(req.body.otp, isEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/forgotPasswordOTPPage`)
            }

            // ask user if they want to change the password
            return res.render("auth/user/changePassOrLoginPage", { title: "Change password or Login page for user", siteName: siteName?.title, favicon: siteName?.favicon, user: isEmailExists, userOTP: req.body.otp })
        } catch (error) {
            console.error("user forgotPasswordOTPVerification controller error", error);
        }
    }

    async logout(req, res) {
        try {
            req.session.destroy()
            return res.redirect("/loginPage")
        } catch (error) {
            console.error("user logout controller error", error);
        }
    }
}

module.exports = new UserAuthController