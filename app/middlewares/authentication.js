const passport = require("passport")
const passportJWT = require("passport-jwt")
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const UserAuthRepo = require("../modules/user/auth/repository/user.auth.repo")
const AdminAuthRepo = require("../modules/admin/auth/repository/admin.auth.repo")


const params = {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: ExtractJWT.fromExtractors([
        ExtractJWT.fromHeader("x-access-token"),
        ExtractJWT.fromHeader("token"),
        ExtractJWT.fromAuthHeaderAsBearerToken(),
    ])
}

const authentication = () => {
    const strategy = new JWTStrategy(params, async (payload, done) => {
        console.log("payload from user strategy", payload);

        if (payload.role === "admin" || payload.role === "instructor") {
            const user = await AdminAuthRepo.searchById(payload.id)
            if (user) {
                console.log("user from strategy", user);
                return done(null, user)
            }
        } else if (payload.role === "author" || payload.role === "editor") {
            const user = await UserAuthRepo.searchById(payload.id)
            if (user) {
                console.log("user from strategy", user);
                return done(null, user)
            }
        }
        console.log("user not found from strategy");
        return done(null, false)
    })

    passport.use(strategy)

    return {
        initialize: () => passport.initialize(),
        authenticate: (req, res, next) => {
            passport.authenticate("jwt", process.env.JWT_SECRET, (error, user, info) => {
                if (error) {
                    console.error("error in passport.authenticate", error)
                    next(error)
                }

                if (!user) {
                    req.flash("error", "Unauthorized access, please login")
                    return res.redirect("/loginPage")
                }
                console.log("user from passport authenticate", user);

                req.user = user
                next()
            })(req, res, next)
        },
        softAuthenticate: (req, res, next) => {
            passport.authenticate("jwt", process.env.JWT_SECRET, (error, user, info) => {
                if (error) {
                    console.error("error in passport.authenticate", error)
                    next(error)
                }

                if (!user) {
                    return next()
                }
                console.log("user from passport authenticate", user);

                req.user = user
                next()
            })(req, res, next)
        }
    }
}

module.exports = authentication