const isEnabledUser = (req, res, next) => {
    if (req.user && (req.user.isDisabled === false || req.user.role === 'admin')) {
        return next()
    }
    req.flash("error", "Your account is disabled. Please contact support.")
    return res.redirect("/dashboard")
}

module.exports = isEnabledUser