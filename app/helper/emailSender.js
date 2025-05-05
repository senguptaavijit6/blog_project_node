const nodemailer = require("nodemailer")

class EmailSender {
    constructor(service, user, pass) {
        this.transporter = nodemailer.createTransport({
            service: service,
            tls: {
                rejectUnauthorized: false
            },
            auth: {
                user: user,
                pass: pass,
            }
        })
    }

    async sendMail(mailObj) {
        const mailOptions = {
            from: this.transporter.options.EMAIL_HOST,
            to: mailObj.to,
            subject: mailObj.subject,
            html: mailObj.html
        }

        try {
            const info = await this.transporter.sendMail(mailOptions)
            console.log("A mail successfully sent with the messageId", info.messageId);
        } catch (error) {
            console.error("Mail could not be sent, the error is", error);
            throw error
        }
    }
}

module.exports = EmailSender