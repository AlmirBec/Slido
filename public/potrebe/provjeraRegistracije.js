var express = require('express');
var router = express.Router({mergeParams:true});
var kript = require('./hashiranje')
var predavac = require('./upiti_predavac')


let provjere =
{
    pokupi_podatke: function(req){
        const name = req.body.predusername;
        const email = req.body.predemail;
        const password = req.body.predpassword;
        const password2 = req.body.predpassword2;
        //console.log(name, email, password, password2);
        const podatci = {
            name, email, password, password2
        };
        return podatci;

    },

    provjeraUnosa: async function(req, res) {
        //moguce greske tokom unosa
        let errors = [];
        try {
            console.log("Je l ja udjem ovdje?");
            let postojiMail = await predavac.provjeriMail(this.pokupi_podatke(req).email);
            let postojiUsername = await predavac.provjeriUsername(this.pokupi_podatke(req).name);
            if (postojiMail.length > 0) {
                errors.push({poruka: "Email je vec u upotrebi!"});
            }
            if (postojiUsername.length > 0) {
                errors.push({poruka: "Username je vec zauzaet"})
            }
            if (this.pokupi_podatke(req).password.length < 6) {
                errors.push({poruka: "Password se mora sastojati od minimalno 6 karaktera!"});
            }
            if (this.pokupi_podatke(req).password !== this.pokupi_podatke(req).password2) {
                errors.push({poruka: "Passwordi se ne poklapaju"});
            }
            console.log(errors.length);
            if (errors.length > 0) {
                res.render('registracija', {title: "registracija", er: errors});
            }

            else{
                let kriptovani_password = await kript.hashirajSifru(this.pokupi_podatke(req).password);
                await predavac.dodajPredavaca(this.pokupi_podatke(req).name,
                    this.pokupi_podatke(req).email, kriptovani_password, req, res);
                res.redirect("http://localhost:3000/predavac/login");
            }
        }
        catch(err){
            return res.send(err);
        }
    },

}

module.exports = provjere;