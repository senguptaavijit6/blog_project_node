const express = require("express")
const app = express()
const session = require("express-session")
const flash = require("connect-flash")
require("dotenv").config()
const db = require("./app/config/db")
const path = require("node:path")
const BlogRepo = require("./app/modules/blogs/repo/blog.repo")

app.use(express.static(path.join(__dirname, "public")))

app.set("view engine", "ejs")
app.set("views", "views")
app.set("trust proxy", true)

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json())

app.use(session({
    secret: "535510N^!#53CR8",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(flash())

app.use((req, res, next)=> {
    //import auth module and initialize with (req, res, next)
    const auth = require("./app/middlewares/authentication")(req, res, next)
    // call auth.initialize method inside app.use()
    app.use(auth.initialize())
    // set the token in headers
    if (req.session.token && req.session.token !== null) {
        req.headers["x-access-token"] = req.session.token
    }
    res.locals.SUCCESS_MSG = req.flash("success")
    res.locals.ERROR_MSG = req.flash("error")
    next()
})

app.use("/admin", require("./app/router/admin/admin.routes"))
app.use("/", require("./app/router/user/user.routes"))

// check and publish future blogs every minutes
BlogRepo.publishFutureBlogs()

app.listen(process.env.PORT, ()=>{
    db.connectDB()
    console.log(`server is running on http://127.0.0.1:${process.env.PORT}`);    
})