const mongoose = require("mongoose")

class DB {
    async connectDB() {
        console.log(process.env.SAMPLE_ID)
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
