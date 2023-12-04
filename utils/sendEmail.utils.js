const nodemailer = require("nodemailer")
const ejs = require("ejs")
const path = require("path")

async function sendEmail(options) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        }
    })

    const { email, data, subject, template } = options
    const templatePath = path.join(__dirname, "../mails", template)

    //render tempate with ejs
    const html = await ejs.renderFile(templatePath, data)
    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html
    }
    await transporter.sendMail(mailOptions)
}

module.exports = { sendEmail }