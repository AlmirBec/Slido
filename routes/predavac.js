var express = require('express');
var router = express.Router();
var QRCode = require('qrcode');
const provjere = require("../public/potrebe/provjeraRegistracije");
const provjeraLogin = require("../public/potrebe/provjeraLoginaPred");
const hes = require("../public/potrebe/hashiranje");
const pred = require("../public/potrebe/upiti_predavac");
const pitanja = require("../public/potrebe/upiti_pitanja");
const posaljiMail = require("../public/potrebe/nodemailer");
const admin = require("../public/potrebe/upiti_admin");
const multer = require('multer')
const path = require("path");


router.get('/', provjeriCookie,async function(req, res, next){
    let decodedId = await hes.dekriptujToken(req.cookies.cookieSesija);
    decodedId = decodedId.id;
    let listaPredavanja = await pred.prikaziPredavanja(decodedId);
    res.render('predavac', { title: 'Predavac', predavanja: listaPredavanja});
});

router.get('/registracija', function(req, res){
    res.render('registracija', { title: 'Predavac',});
});


router.post('/registracija', function(req, res) {
    provjere.provjeraUnosa(req, res);


});
router.get('/login', function(req, res, next){
    res.render('loginpredavac', { title: 'Predavac',});
});


router.post('/login', function(req, res) {
    provjeraLogin.provjeraUnosa(req, res);

});
//Smjestamo novo predavanje u bazy
router.post('/novoPredavanje', provjeriCookie,async function(req, res){
    let decodedId = await hes.dekriptujToken(req.cookies.cookieSesija);
    decodedId = decodedId.id;
    let naziv = req.body.name;
    let pocetak = req.body.startDate;
    let ponavljanje = req.body.repetition;
    let kod;
    let id = parseInt(await pred.brojPredavanja(req, res)) + 1;
    if(naziv.length > 5){
        kod = naziv.substring(0, 5) + id.toString();
    }
    else{
        kod = naziv + id.toString();
    }
    await pred.dodajPredavanje(decodedId, naziv, kod, pocetak, ponavljanje, req, res);
    res.redirect("back")
});

global.sobe = [];
let poruke = [];

router.get('/predavanje/:k', provjeriCookie,async function(req, res) {
    let k = req.params.k
    sobe.push({room: k});
    let id_predavaca = await pitanja.dajPredavaca(k);
    let mail = await hes.dekriptujToken(req.cookies.cookieSesija);
    let mailPred = mail.email;
    //let url = await pred.dajSliku(k, req, res);
    if(!io) {
        io = require('socket.io')(req.socket.server, {allowEIO3: true});
        //const publika = io.of('/publika');
        io.sockets.on('connection', async(client)=> {
            client.join(sobe[sobe.length - 1].room);
            //klijenti.push(client.id);

            sobe[sobe.length - 1].id = client.id;
            console.log(sobe);

            poruke = await pitanja.prikaziPitanja(sobe[sobe.length - 1].room, req, res);

            io.to(sobe[sobe.length - 1].room).emit('sve_poruke', poruke);

            client.on('disconnect', async function () {
                console.log(req.headers.referer);
                console.log("diskonektovo se");
                let indeks = sobe.findIndex((sobe) => sobe.id === client.id);
                let sadrzaj;
                let broj_pitanja = await pitanja.prebrojPitanja(sobe[indeks].room, req, res)
                let broj_odgovorenih = await pitanja.prebrojOdgovorena(sobe[indeks].room, req, res);
                let broj_sakrivenih = await pitanja.prebrojSakrivena(sobe[indeks].room, req, res);
                let prosjek = await pred.dajProsjekReview(sobe[indeks].room, req, res);
                let poruke = await pitanja.prikaziSvaPitanja(sobe[indeks].room, req, res);
                sadrzaj = poruke.map(poruke => `${poruke.tekst}: ${poruke.broj_lajkova}`);
                sadrzaj.push(JSON.stringify(broj_pitanja));
                sadrzaj.push(JSON.stringify(broj_odgovorenih));
                sadrzaj.push(JSON.stringify(broj_sakrivenih));
                sadrzaj.push(JSON.stringify(prosjek));
                sadrzaj = sadrzaj.toString();
                console.log(sadrzaj)
                await posaljiMail(mailPred, sadrzaj, "statistika", req, res);
                sobe.splice(indeks, 1);
            });

            client.on("moja_poruka", async function (d) {
                let indeks = sobe.findIndex((sobe) => sobe.id === client.id);
                let zabranjeno = false;
                let zabRijeci = await pitanja.zabRijeci(req, res);
                for(let i = 0; i < zabRijeci.length; i++){
                    if(d.includes(zabRijeci[i].lista_rijeci)){
                        zabranjeno = true;
                        break;
                    }
                }
                let x = await pitanja.dodajPitanje(sobe[indeks].room, d, zabranjeno, req, res);
                poruke.push(x);
                if(!zabranjeno) {
                    io.to(sobe[indeks].room).emit("poruka_svima", x);
                }
            })
            client.on('like', async (id) => {
                let bl = await pitanja.povecajLike(id, req, res);
                bl = bl.broj_lajkova;
                let indeks = sobe.findIndex((sobe) => sobe.id === client.id);
                io.to(sobe[indeks].room).emit('likeCount', {id, bl});
            });

            client.on('po_broju_lajkova', async(kod) =>{
                let poruke = await pitanja.prikaziPoBrojuLajkova(kod, req, res);
                io.to(client.id).emit('sve_poruke', poruke);
            });

            client.on('prvobitni', async(kod) =>{
                let poruke = await pitanja.prikaziPitanja(kod, req, res);
                io.to(client.id).emit('sve_poruke', poruke);
            });

            client.on('odg_pit', async(kod) =>{
                let poruke = await pitanja.prikaziOdgovorena(kod, req, res);
                console.log(poruke);
                io.to(client.id).emit('sve_poruke', poruke);
            });
            client.on('zab_pit', async(kod) =>{
                let poruke = await pitanja.prikaziZabranjena(kod, req, res);
                io.to(client.id).emit('sve_poruke', poruke);
            });

            client.on('po_broju_lajkova', async(kod) =>{
                console.log(kod);
            })
            client.on('odgovoreno', async (id) =>{
                await pitanja.odgovoreno(id, req, res);
                let indeks = sobe.findIndex((sobe) => sobe.id === client.id);
                let soba = sobe[indeks].room;
                console.log(soba);
                let poruke = await pitanja.prikaziPitanja(soba, req, res);
                io.to(soba).emit("sve_poruke", poruke);
            });
            client.on('delete', async (id) =>{
                await pitanja.obrisiPitanje(id, req, res);
                let indeks = sobe.findIndex((sobe) => sobe.id === client.id);
                let soba = sobe[indeks].room;
                let poruke = await pitanja.prikaziPitanja(soba, req, res);
                io.to(soba).emit("sve_poruke", poruke);
            });
            client.on('hide', async (id) =>{
                await pitanja.sakrijPitanje(id, req, res);
                let indeks = sobe.findIndex((sobe) => sobe.id === client.id);
                let soba = sobe[indeks].room;
                let poruke = await pitanja.prikaziPitanja(soba, req, res);
                io.to(soba).emit("sve_poruke", poruke);
            });

        });
    }
        res.render('predavanje', {title: 'Express', kod: k, idP: id_predavaca});
   // }
});
router.get('/predavanje/prikazi/:kod', provjeriCookie,async function(req, res, next){
    let kod = req.params.kod;

    let qrcode = await QRCode.toDataURL("http://localhost:3000/publika/chat/" + kod);
    res.render('prikazkoda', {kod: kod, qr: qrcode});
});

router.post('/posaljikod/:kod', provjeriCookie,async function(req, res, next){
    let sadrzaj = req.params.kod;
    let mail = req.body.mail;
    mail = mail.split(";");
    console.log(mail)
    for(let i = 0; i < mail.length; i++){
        mail[i] = mail[i].trim();
    }
    console.log(mail);
    await posaljiMail(mail, sadrzaj, "Kod predavanja", req, res);
    res.redirect('back')
});
router.post('/slanjeizvjestaja/:id', provjeriCookie, function(req, res, next){
    res.redirect('http://localhost:3000/predavac')
})
router.get('/obrisi/:id', pred.delSve, function (req, res){
    res.redirect('http://localhost:3000/predavac')
});

router.post('/update/:id', provjeriCookie, async function (req, res){
    let id = req.params.id;

    let naziv = req.body.name;

    let pocetak = req.body.startDate;
    let ponavljanje = req.body.repetition;
    await pred.updatePredavanje(naziv, pocetak, ponavljanje, id, req, res);
    res.redirect('http://localhost:3000/predavac');

});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})
router.post('/uploadimage/:id', provjeriCookie, upload.single('file'), function(req, res, next){
    let id = req.params.id;
    let url = (req.file).path;
    console.log(req.file);
    console.log(url);
    pred.ubaciSliku(id, url, req, res);
    res.redirect('back');
});
router.get('/logout', function (req, res, next){
    res.cookie("cookieSesija", "", {maxAge: -1});
    res.redirect('/');
})

function provjeriCookie(req, res, next){
    let cookie = req.cookies.cookieSesija;
    if(cookie){
        next();
    }
    else{
        res.redirect('http://localhost:3000/predavac/login');
    }
}


module.exports = router;
