const ensureAdmin = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "instructor")) {
        return next()
    }
    req.flash("error", "You don't have permission to access admin page")
    return res.redirect("/loginpage")
}

module.exports = ensureAdmin