const AdminAuthRepo = require("../repository/admin.auth.repo");
const AdminOtpRepo = require("../repository/admin.otp.repo");
const EmailSender = require("../../../../helper/emailSender")
const jwt = require("jsonwebtoken");
const fs = require("fs")
const timezones = require("timezones-list");
const generalCMSRepo = require("../../cms/general/repo/generalCMS.repo");


class AdminAuthController {
    async registerPage(req, res) {
        try {
            const siteName = await generalCMSRepo.retrieve()
            return res.render("auth/admin/registerPage", { title: "Register page for admin", siteName: siteName?.title, favicon: siteName?.favicon, timezones: timezones.default })
        } catch (error) {
            console.error("admin register page controller error", error);
        }
    }

    async register(req, res) {
        try {
            console.log("req body and req file from admin register", req.body, req.file);

            if (!req.body.firstName) {
                req.flash("error", "First name is required")
                return res.redirect("/admin/registerPage")
            }

            if (!req.body.lastName) {
                req.flash("error", "Last name is required")
                return res.redirect("/admin/registerPage")
            }

            if (!req.body.email) {
                req.flash("error", "Email id is required")
                return res.redirect("/admin/registerPage")
            }

            if (!req.body.password) {
                req.flash("error", "Password is required")
                return res.redirect("/admin/registerPage")
            }

            if (!req.file) {
                req.flash("error", "Profile image is required")
                return res.redirect("/admin/registerPage")
            }

            if (!req.body.role) {
                req.flash("error", "Role is required")
                return res.redirect("/admin/registerPage")
            }

            if (!req.body.secretKey) {
                req.flash("error", "Secret Key is required")
                return res.redirect("/admin/registerPage")
            }

            //check if the secret key is correct
            if (req.body.role === 'admin') {
                const checkSecret = await AdminAuthRepo.checkAdminSecretKey(req.body.secretKey)
                if (!checkSecret) {
                    req.flash("error", "You don't have the permission to register as admin")
                    return res.redirect("/admin/registerPage")
                }
            } else if (req.body.role === 'instructor') {
                const checkSecret = await AdminAuthRepo.checkInstructorSecretKey(req.body.secretKey)
                if (!checkSecret) {
                    req.flash("error", "You don't have the permission to register as instructor")
                    return res.redirect("/admin/registerPage")
                }
            } else {
                req.flash("error", "Invalid role")
                return res.redirect("/admin/registerPage")
            }

            //check if any admin is there with the same email
            const isEmailExists = await AdminAuthRepo.searchByEmail(req.body.email)
            const isEmailExistsInOtp = await AdminOtpRepo.searchByEmail(req.body.email)
            console.log("is Email of admin exists? ", isEmailExists);

            if (isEmailExists) {
                req.flash("error", "This email is already registered and verified, you can login")
                return res.redirect("/admin/loginPage")
            }

            // hash the password
            req.body.password = await AdminAuthRepo.hashPassword(req.body.password)
            console.log("hashed password", req.body.password);

            //get the file name from req.file
            req.body.image = req.file.filename

            //check the data if everything is correct
            console.log("data to be saved", req.body);

            //Generate OTP and set to req.body
            const otp = Math.floor(100000 + Math.random() * 900000)
            req.body.otp = await AdminOtpRepo.hashOTP(otp.toString())

            //is email exists in otp
            if (isEmailExistsInOtp) {
                //if same email exists update the otp to the database
                const updateAdminOTP = await AdminOtpRepo.updateByEmail(req.body.email, req.body)
                console.log("updated admin otp", updateAdminOTP);
            } else {
                //else create the otp to the OTP database
                const saveToAdminOtp = await AdminOtpRepo.createEntry(req.body)
                console.log("saved admin otp", saveToAdminOtp);
            }



            //send the email to the user for verification
            const emailSender = new EmailSender("gmail", process.env.EMAIL_USER, process.env.EMAIL_PASS)
            const mailObj = {
                to: req.body.email,
                subject: "Verification Email",
                html: `Your OTP is ${otp}, you don't need to remember or write down any of these, this is for one time use only <br />
                <b>if you don't verify your email within 10 minutes, you will need to register again<b>`
            }
            await emailSender.sendMail(mailObj)
            req.flash("success", `OTP has been sent to your email (${req.body.email}), please verify`)
            return res.redirect(`/admin/verifyEmailPage/${req.body.email}?fallback=registerPage`)
        } catch (error) {
            console.error("admin register controller error", error);
        }
    }

    async verifyEmailPage(req, res) {
        try {
            const userEmail = req.params.email
            const fallback = req.query.fallback
            console.log("user email", userEmail);
            const siteName = await generalCMSRepo.retrieve()
            console.log('siteName: ', siteName);
            return res.render("auth/admin/emailVerificationPage", { title: "Email verification for admin",siteName: siteName?.title, favicon: siteName?.favicon,  userEmail, fallback })
        } catch (error) {
            console.error("admin verifyEmailPage controller error", error);
        }
    }

    async verifyEmail(req, res) {
        try {
            console.log("req body and params from admin verifyEmail", req.body, req.params);
            const fallback = req.query.fallback

            if (!req.body.otp) {
                req.flash("error", "OTP is required")
                return res.redirect(`/admin/verifyEmailPage/${req.params.email}`)
            }

            // check if the user's email exists
            const isUserEmailExists = await AdminOtpRepo.searchByEmailAndSelect(req.params.email, "-_id -__v -createdAt -updatedAt")
            console.log("is user email exists", isUserEmailExists);

            if (!isUserEmailExists) {
                req.flash("error", "Email is incorrect")
                return res.redirect(`/admin/verifyEmailPage/${req.params.email}`)
            }

            //compare the otp
            const isOtpMatched = await AdminOtpRepo.compareOTP(req.body.otp.toString(), isUserEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/admin/${fallback}/${req.params.email}`)
            }

            //save the data to the database
            console.log("data to be saved", isUserEmailExists);

            const deleteOtpModelEntry = await AdminOtpRepo.deleteEntry(isUserEmailExists.email)
            console.log("deleted otp model entry", deleteOtpModelEntry);
            const savedData = await AdminAuthRepo.createAdmin(isUserEmailExists)
            console.log("saved data", savedData);
            req.flash("success", "You have successfully registered, please login")
            return res.redirect("/admin/loginPage")

        } catch (error) {
            console.error("admin verifyEmail controller error", error);
        }
    }

    async loginPage(req, res) {
        try {
            const siteName = await generalCMSRepo.retrieve()
            console.log('siteName: ', siteName);
            return res.render("auth/admin/loginPage", { title: "Login page for admin", siteName: siteName?.title, favicon: siteName?.favicon, })
        } catch (error) {
            console.error("admin loginPage controller error", error);
        }
    }

    async login(req, res) {
        try {
            console.log("req body from admin login", req.body);

            if (!req.body.email) {
                req.flash("error", "Email id is required")
                return res.redirect("/admin/registerPage")
            }

            if (!req.body.password) {
                req.flash("error", "Password is required")
                return res.redirect("/admin/registerPage")
            }

            //check if the email exists
            const isEmailExists = await AdminAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of admin exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/admin/registerPage")
            }

            //compare the password
            const isPasswordMatched = await AdminAuthRepo.comparePassword(req.body.password, isEmailExists.password)
            console.log("is password matched", isPasswordMatched);
            if (!isPasswordMatched) {
                req.flash("error", "Email or Password is incorrect")
                return res.redirect("/admin/loginPage")
            }

            //generate the token
            const token = jwt.sign({ id: isEmailExists._id, role: isEmailExists.role }, process.env.JWT_SECRET, { expiresIn: "1h" })

            //set the token in session
            req.session.token = token
            // set the user in req.user
            req.user = isEmailExists

            console.log("login successful");  

            req.flash("success", "You have successfully logged in")
            return res.redirect("/admin/")

        } catch (error) {
            console.error("admin login controller error", error);
        }
    }

    async loginUsingOTP(req, res) {
        try {
            console.log("req body from admin loginUsingOTP", req.body);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/admin/loginPage")
            }

            if (!req.body.otp) {
                req.flash("error", "OTP is required")
                return res.redirect("/admin/loginPage")
            }

            //check if the email exists
            const isEmailExists = await AdminAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of admin exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/admin/registerPage")
            }

            //check if the otp is correct
            const isOtpMatched = await AdminAuthRepo.compareOTP(req.body.otp, isEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/admin/loginPage`)
            }

            //generate the token
            const token = jwt.sign({ id: isEmailExists._id, role: isEmailExists.role }, process.env.JWT_SECRET, { expiresIn: "1h" })

            //set the token in session
            req.session.token = token
            // set the user in req.user
            req.user = isEmailExists

            req.flash("success", "You have successfully logged in")
            return res.redirect("/admin/")
        } catch (error) {
            console.error("admin loginUsingOTP controller error", error);

        }
    }

    async changePasswordUsingOTPPage(req, res) {
        try {
            console.log("req params from admin changePasswordUsingOTPPage", req.params);
            if (!req.params.email) {
                req.flash("error", "Email is required")
                return res.redirect("/admin/loginPage")
            }

            if (!req.params.otp) {
                req.flash("error", "OTP is required")
                return res.redirect("/admin/loginPage")
            }
            
            const siteName = await generalCMSRepo.retrieve()

            //check if the email exists
            const isEmailExists = await AdminAuthRepo.searchByEmail(req.params.email)
            console.log("is Email of admin exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/admin/registerPage")
            }

            //check if the otp is correct
            const isOtpMatched = await AdminAuthRepo.compareOTP(req.params.otp, isEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/admin/loginPage`)
            }

            return res.render("auth/admin/changePasswordUsingOTPPage", { title: "Change password page for admin", siteName: siteName?.title, favicon: siteName?.favicon, user: isEmailExists, userOTP: req.params.otp })
        } catch (error) {
            console.error("admin changePasswordPage controller error", error);
        }
    }

    async changePasswordUsingOTP(req, res) {
        try {
            console.log("req body from admin changePasswordUsingOTP", req.body);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/admin/loginPage")
            }

            if (!req.body.otp) {
                req.flash("error", "OTP is required")
                return res.redirect("/admin/loginPage")
            }

            if (!req.body.password) {
                req.flash("error", "Password is required")
                return res.redirect("/admin/loginPage")
            }

            //check if the email exists
            const isEmailExists = await AdminAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of admin exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/admin/registerPage")
            }

            //check if the otp is correct
            const isOtpMatched = await AdminAuthRepo.compareOTP(req.body.otp, isEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/admin/loginPage`)
            }

            //hash the password
            req.body.password = await AdminAuthRepo.hashPassword(req.body.password)
            console.log("hashed password", req.body.password);

            //update the password
            const updatePassword = await AdminAuthRepo.updateAdminPassword(req.body.email, req.body.password)
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
            return res.redirect("/admin/loginPage")
        } catch (error) {
            console.error("admin changePasswordUsingOTP controller error", error);
        }
    }

    // dashboard is located in the admin.blogs.controller.js
    // async dashboard(req, res) {
    //     try {
    //         const user = req.user
    //         console.log("user from dashboard", user)
    //         if (!user) {
    //             req.flash("error", "Unauthorized access, please login")
    //             return res.redirect("/admin/loginPage")

    //         }
    //         let gmt = user.timezone.split("~")[0].slice(1)
            
    //         const date = new Date()
    //         const utc = date.getTime() + date.getTimezoneOffset() * 60000

    //         const [hours, minutes] = gmt.split(":").map(Number)
    //         const offsetMilliseconds = (hours * 60 + minutes) * 60000
            

    //         const userTime = new Date(utc + offsetMilliseconds)
    //         return res.render("pages/admin/dashboard", { title: "Admin Dashboard", user, userTime })
    //         // return res.send("hi")
    //     } catch (error) {
    //         console.error("admin dashboard controller error", error);
    //     }
    // }

    redirectToAccountSettingsPage(req, res) {
        try {
            return res.redirect("/admin/settings/account")
        } catch (error) {
            console.error("admin redirectToAccountSettingsPage controller error", error);
        }
    }

    async accountSettingsPage(req, res) {
        try {
            const user = req.user
            console.log("user", user);
            const siteName = await generalCMSRepo.retrieve()
            return res.render("pages/admin/settingsPage", { title: "Settings page for admin", siteName: siteName?.title, favicon: siteName?.favicon, user: user })
        } catch (error) {
            console.error("admin settingsPage controller error", error);
        }
    }

    async siteSettingsPage(req, res) {
        try {
            const user = req.user
            console.log("user", user);
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()
            return res.render("pages/admin/siteSettingsPage", { title: `Update details of ${user.role}`, siteName: siteName?.title, favicon: siteName?.favicon, user, timezones: timezones.default })
        } catch (error) {
            console.error("admin siteSettingsPage controller error", error);
        }
    }

    async updateSiteDetails(req, res) {
        try {
            const user = req.user
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }

            console.log("req.body from updateSiteDetails", req.body);

            const updateResponse = await AdminAuthRepo.updateAdminDetails(user._id, req.body)
            console.log("update response from updateSiteDetails", updateResponse)
            if (!updateResponse) {
                req.flash("error", "Sorry could not update site details, try again")
                return res.redirect("/admin/settings/site")
            }

            req.flash("success", "Site settings updated successfully")
            return res.redirect("/admin/settings/site")
            // return res.render("pages/admin/updateDetailsPage", { title: `Update details of ${user.role}`, user, timezones: timezones.default })
        } catch (error) {
            console.error("admin updateSiteDetails controller error", error);
        }
    }

    async updateDetailsPage(req, res) {
        try {
            const user = req.user

            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            console.log("user from updateDetailsPage", user);
            return res.render("pages/admin/updateDetailsPage", { title: `Update details of ${user.role}`, siteName: siteName?.title, favicon: siteName?.favicon, user })
        } catch (error) {
            console.error("admin updateDetailsPage controller error", error);
        }
    }

    async updateDetails(req, res) {
        try {
            console.log("req body from admin updateDetails", req.body);
            const user = req.user

            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }

            // check if the email is occupied
            if (req.body.email !== user.email && await AdminAuthRepo.isUpdateEmailOccupied(user._id, req.body.email)) {
                req.flash("error", "Email is already occupied")
                return res.redirect(`/admin/updateDetailsPage`)
            }

            // check the secret key
            if (req.body.role === 'admin') {
                const checkSecret = await AdminAuthRepo.checkAdminSecretKey(req.body.secretKey)
                if (!checkSecret) {
                    req.flash("error", "You don't have the permission to register as admin")
                    return res.redirect(`/admin/updateDetailsPage`)
                }
            } else if (req.body.role === 'instructor') {
                const checkSecret = await AdminAuthRepo.checkInstructorSecretKey(req.body.secretKey)
                if (!checkSecret) {
                    req.flash("error", "You don't have the permission to register as instructor")
                    return res.redirect(`/admin/updateDetailsPage`)
                }
            }

            req.body.isEmailVerified = false
            req.body.otp = null

            // generate the otp
            const otp = Math.floor(100000 + Math.random() * 900000)
            req.body.otp = await AdminAuthRepo.hashOTP(otp.toString())

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
            const updateDetails = await AdminAuthRepo.updateAdminDetails(user.id, req.body)
            console.log("updated details from updateDetails controller", updateDetails);

            req.flash("success", "Details has been updated successfully, please verify your email")
            return res.redirect(`/admin/verifyEmailToUpdateDetailsPage`)
        } catch (error) {
            console.error("admin changeDetails controller error", error);
        }
    }

    async verifyEmailToUpdateDetailsPage(req, res) {
        try {
            const user = req.user
            console.log("user", user);

            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }
            
            const siteName = await generalCMSRepo.retrieve()
            return res.render("auth/admin/verifyEmailToUpdateDetailsPage", { title: "Change details page for admin", siteName: siteName?.title, favicon: siteName?.favicon, user })
        } catch (error) {
            console.error("admin changeDetailsPage controller error", error);
        }
    }

    async verifyEmailToUpdateDetails(req, res) {
        try {
            console.log("req body and user from admin verifyEmailToUpdateDetails", req.body, req.user);
            const user = req.user
            if (!user) {
                req.flash("error", "Unauthorized access, please login")
                return res.redirect("/admin/loginPage")
            }

            if (!req.body.otp) {
                req.flash("error", "OTP is required")
                return res.redirect(`/admin/verifyEmailToUpdateDetailsPage`)
            }

            // check if the user's email exists
            const isUserEmailExists = await AdminAuthRepo.searchByEmailAndSelect(user.email, "-__v -createdAt -updatedAt")
            console.log("is user email exists", isUserEmailExists);

            if (!isUserEmailExists) {
                req.flash("error", "Email is incorrect")
                return res.redirect(`/admin/verifyEmailToUpdateDetailsPage`)
            }

            //compare the otp
            const isOtpMatched = await AdminAuthRepo.compareOTP(req.body.otp.toString(), isUserEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/admin/verifyEmailToUpdateDetailsPage`)
            }

            //save the data to the database
            console.log("data to be saved", isUserEmailExists);

            const savedData = await AdminAuthRepo.updateAdminDetails(isUserEmailExists._id, { isEmailVerified: true, otp: null })
            console.log("saved data", savedData);
            req.flash("success", "You have successfully registered, please login")
            return res.redirect("/admin/loginPage")

        } catch (error) {
            console.error("admin verifyEmail controller error", error);
        }
    }

    async changePasswordUsingPasswordPage(req, res) {
        try {
            const user = req.user
            console.log("user", user);
            const siteName = await generalCMSRepo.retrieve()
            return res.render("auth/admin/changePasswordUsingPasswordPage", { title: "Change password page for admin", siteName: siteName?.title, favicon: siteName?.favicon, user })
        } catch (error) {
            console.error("admin changePasswordPage controller error", error);
        }
    }

    async changePasswordUsingPassword(req, res) {
        try {
            console.log("req body from admin changePasswordUsingPassword", req.body);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/admin/loginPage")
            }

            if (!req.body.oldPassword) {
                req.flash("error", "Old password is required")
                return res.redirect("/admin/settings")
            }

            if (!req.body.newPassword) {
                req.flash("error", "New password is required")
                return res.redirect("/admin/settings")
            }

            //check if the email exists
            const isEmailExists = await AdminAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of admin exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/admin/registerPage")
            }

            //compare the password
            const isPasswordMatched = await AdminAuthRepo.comparePassword(req.body.oldPassword, isEmailExists.password)
            console.log("is password matched", isPasswordMatched);
            if (!isPasswordMatched) {
                req.flash("error", "Old password is incorrect")
                return res.redirect("/admin/settings")
            }

            //hash the new password
            req.body.password = await AdminAuthRepo.hashPassword(req.body.newPassword)
            console.log("hashed password", req.body.password);

            //update the password
            const updatePassword = await AdminAuthRepo.updateAdminPassword(req.body.email, req.body.password)
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
            return res.redirect("/admin/settings")

        } catch (error) {
            console.error("admin changePasswordUsingPassword controller error", error);
        }
    }

    async changeImagePage(req, res) {
        try {
            const user = req.user
            console.log("user", user);
            const siteName = await generalCMSRepo.retrieve()
            return res.render("pages/admin/changeImagePage", { title: "Change image page for admin", siteName: siteName?.title, favicon: siteName?.favicon, user })
        } catch (error) {
            console.error("admin changeImagePage controller error", error);
        }
    }

    async changeImage(req, res) {
        try {
            console.log("req body from admin changeImage", req.body, req.file);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/admin/loginPage")
            }

            if (!req.file) {
                req.flash("error", "Profile image is required")
                return res.redirect("/admin/changeImagePage")
            }

            //check if the email exists
            const isEmailExists = await AdminAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of admin exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/admin/registerPage")
            }

            //get the file name from req.file
            req.body.image = req.file.filename

            //update the image
            const updateImage = await AdminAuthRepo.updateAdminImage(req.body.email, req.body.image)
            console.log("updated image", updateImage);

            // delete the previous image
            fs.unlink(`public/uploads/profile_picture/admin/${isEmailExists.image}`, (err) => {
                if (err) throw err;
                console.log('previous profile image is deleted now');
            });

            req.flash("success", "Profile image has been changed successfully")
            return res.redirect("/admin/settings")
        } catch (error) {
            console.error("admin changeImage controller error", error);
        }
    }

    async forgotPasswordPage(req, res) {
        try {
            const siteName = await generalCMSRepo.retrieve()
            return res.render("auth/admin/forgotPasswordPage", { title: "Forgot password page for admin", siteName: siteName?.title, favicon: siteName?.favicon, })
        } catch (error) {
            console.error("admin forgotPasswordPage controller error", error);
        }
    }

    async forgotPasswordOTPPage(req, res) {
        try {
            console.log("req body from admin forgotPasswordPage", req.body);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/admin/forgotPasswordPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            //is email exists
            const isEmailExists = await AdminAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of admin exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/admin/registerPage")
            }

            //Generate OTP and hash it
            const otp = Math.floor(100000 + Math.random() * 900000)
            const hashedOTP = await AdminOtpRepo.hashOTP(otp.toString())

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
            const saveToAdminOtp = await AdminAuthRepo.updateAdminOTP(req.body.email, hashedOTP)
            console.log("saved admin otp", saveToAdminOtp);
            return res.render("auth/admin/forgotPasswordOTPPage", { title: "Forgot password OTP verification page for admin", siteName: siteName?.title, favicon: siteName?.favicon, userEmail: req.body.email })
        } catch (error) {
            console.error("admin forgotPasswordOTPVerificationPage controller error", error);
        }
    }

    async forgotPasswordOTPVerification(req, res) {
        try {
            console.log("req body from admin forgotPasswordOTPVerification", req.body);
            if (!req.body.email) {
                req.flash("error", "Email is required")
                return res.redirect("/admin/forgotPasswordPage")
            }
            if (!req.body.otp) {
                req.flash("error", "OTP is required")
                return res.redirect("/admin/forgotPasswordOTPPage")
            }
            const siteName = await generalCMSRepo.retrieve()

            //check if the email exists
            const isEmailExists = await AdminAuthRepo.searchByEmail(req.body.email)
            console.log("is Email of admin exists? ", isEmailExists);
            if (!isEmailExists) {
                req.flash("error", "This email is not registered, please register")
                return res.redirect("/admin/registerPage")
            }

            //check if the otp is correct
            const isOtpMatched = await AdminAuthRepo.compareOTP(req.body.otp, isEmailExists.otp)
            console.log("is otp matched", isOtpMatched);
            if (!isOtpMatched) {
                req.flash("error", "OTP is incorrect")
                return res.redirect(`/admin/forgotPasswordOTPPage`)
            }

            // ask user if they want to change the password
            return res.render("auth/admin/changePassOrLoginPage", { title: "Change password or Login page for admin", siteName: siteName?.title, favicon: siteName?.favicon, user: isEmailExists, userOTP: req.body.otp })
        } catch (error) {
            console.error("admin forgotPasswordOTPVerification controller error", error);
        }
    }

    async logout(req, res) {
        try {
            req.session.destroy()
            return res.redirect("/admin/loginPage")
        } catch (error) {
            console.error("admin logout controller error", error);
        }
    }
}

module.exports = new AdminAuthController
