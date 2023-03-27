const nodemailer = require('nodemailer');
require('dotenv').config()

async function posaljiMail(primaoci, sadrzaj, naslov, req, res){
    const transporter = nodemailer.createTransport({
        service: 'Outlook',
        tls:{
            rejectUnauthorized: false
        },
        auth:{
            user: process.env.MAILUSER,
            pass: process.env.MAILPASSWORD
        }
    });
    const list = sadrzaj.split(',')
    const messageBody = `<p>Pitanja i statistika s danasnjeg predavanja</p>
                         <ul>${list.map(tekst => `<li>${tekst}</li>`).join("")}</ul>`
    const mailOptions = {
        from: process.env.MAILUSER,
        to: primaoci,
        subject: naslov,
        html: messageBody
    };
    let info = await transporter.sendMail(mailOptions);
    console.log(info.messageID);
}

module.exports = posaljiMail;