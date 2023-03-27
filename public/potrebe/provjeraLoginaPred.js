var express = require('express');
var router = express.Router({mergeParams:true});
var kript = require('./hashiranje')
var predavac = require('./upiti_predavac')
//var cookieParser = require('cookie-parser');
const admin = require('./upiti_admin')
let provjeraLogin =
{
    pokupi_podatke: function(req){
        const email = req.body.predemail;
        const password = req.body.predpassword;
        //console.log(name, email, password, password2);
        const podatci = {
            email, password
        };
        return podatci;

    },

    provjeraUnosa: async function(req, res) {
        //moguce greske tokom unosa
        let errors = [];
        try {

            let postojiMail = await predavac.provjeriMail(this.pokupi_podatke(req).email);
            if (postojiMail.length === 0) {
                errors.push({poruka: "Unijeli ste nepostojeci mail"});
                return res.render('loginpredavac', {title: "login", er: errors});
            }
            let mail = postojiMail[0].email;

            let lozinka = await predavac.izvuciHash(mail, req, res);

            if (!(await kript.provjeriPoklapanje(this.pokupi_podatke(req).password, lozinka))){
                errors.push({poruka: "Neodgovarajuci password"});
                return res.render('loginpredavac', {title: "login", er: errors});
            }
            let datum = new Date();
            let brDana = Math.abs(datum - postojiMail[0].datum_banovanja);
            brDana = Math.floor(brDana / (1000 * 60 * 60 * 24));
            if(postojiMail[0].pristup === false && brDana <= 14){
                errors.push({poruka: `Banovani ste na 14 dana, vratite se za ${14 - brDana} dana`});
                return res.render('loginpredavac', {title: "login", er: errors});
            }
            else if(postojiMail[0].pristup === false && brDana >= 14){
                await admin.odobriPristup(mail);
            }
            else {
                let token = await kript.hashirajToken(mail);
                res.cookie("cookieSesija", token, {maxAge: 5*60*60*1000});
                res.redirect("http://localhost:3000/predavac");
            }
        }
        catch(err){
            return res.send(err);
        }
    },



}

module.exports = provjeraLogin;