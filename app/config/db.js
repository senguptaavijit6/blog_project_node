const mongoose = require("mongoose")

class DB {
    async connectDB() {
        try {
            await mongoose.connect(process.env.DB_URI)
            console.log("Database connection successful");
        } catch (error) {
            console.error("Database could not be connected");
            throw error
        }
    }
}

module.exports = new DB