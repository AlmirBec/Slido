//ako je sve uredu hasiramo sifru i smjestamo podatke u bazu podataka
const bcrypt = require("bcrypt");
const predavac = require("./upiti_predavac");
const jwt = require("jsonwebtoken");

kript = {
    hashirajSifru: async function (sifra, req, res) {
        console.log(sifra);

        const hasirana_sifra = await bcrypt.hash(sifra, 10);
        return hasirana_sifra;
    },

    provjeriPoklapanje : async function(sifra, hash){
        const poklapajuSe = await bcrypt.compare(sifra, hash);
        return poklapajuSe;
    },
    hashirajToken: async function(mail, req, res){
        let token = await predavac.dajPredavaca(mail, req, res);
        let hashiranToken = await jwt.sign(token, "secret",{expiresIn:"4h"});
        return hashiranToken;
    },
    dekriptujToken: async function(token){
        let decoded = await jwt.verify(token, 'secret', {expiresIn: "4h"});
        return decoded;
    }
}
module.exports = kript;