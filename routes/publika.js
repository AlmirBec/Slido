var express = require('express')
var router = express.Router();
var app2 = express();
const pitanja = require("../public/potrebe/upiti_pitanja");
const pred = require("../public/potrebe/upiti_predavac");
global.io = null;

var poruke = [];
let indeks = 0;
let klijenti = [];
let publika = [];
router.get("/chat", async function (req, res, next){
    let k = req.query.kod;
    console.log(k);
    let postoji = await pred.dajPredavanje(k, req, res);
    let errors = [];

    if(postoji.length === 0){
        errors.push({poruka: "Ne postoji predavanje s datim kodom"});
        return res.render('index', {title: "index", er: errors});
    }
    let datum = new Date();
    let brDana = Math.abs(datum - postoji[0].vrijeme_pocetka);
    brDana = Math.floor(brDana / (1000 * 60 * 60 * 24));
    if(brDana % postoji[0].broj_ponavljanja !== 0 || (datum !== postoji[0].vrijeme_pocetka && postoji[0].broj_ponavljanja === 0)){
        errors.push({poruka: "Predavanje nije danas aktivno"});
        return res.render('index', {title: "index", er: errors});
    }

    //console.log(app.listen());
    res.redirect('/publika/chat/' + k);
});

router.get('/chat/:kod', async function(req, res, next){
    let kod1 = req.params.kod;
    sobe.push({room: kod1});
    publika.push(kod1);
    let id_predavaca = await pitanja.dajPredavaca(kod1);
    if(!io) {
        io = require('socket.io')(req.socket.server, {allowEIO3: true});
        //const publika = io.of('/publika');
        io.sockets.on('connection', async(client)=> {
            client.join(sobe[sobe.length - 1].room);
            klijenti.push(client.id);
            await pred.dodajPubliku(sobe[sobe.length - 1].room);
            sobe[sobe.length - 1].id = client.id;
            poruke = await pitanja.prikaziPitanja(sobe[sobe.length - 1].room, req, res);

            io.emit('sve_poruke', poruke);

            client.on('disconnect', function () {
                let indeks = sobe.findIndex((sobe) => sobe.id === client.id);
                sobe.splice(indeks, 1);

            })

            client.on("moja_poruka", async function (d) {
                let indeks = sobe.findIndex((sobe) => sobe.id === client.id);
                console.log(indeks);
                console.log(client.id);
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

            client.on('odgovoreno', async (id) =>{
                await pitanja.odgovoreno(id, req, res);
                let indeks = sobe.findIndex((sobe) => sobe.id === client.id);
                let soba = sobe[indeks].room;
                console.log(soba);
                let poruke = await pitanja.prikaziPitanja(soba, req, res);
                io.to(soba).emit("sve_poruke", poruke);
            });
            client.on('review', async (val) =>{
                let indeks = sobe.findIndex((sobe) => sobe.id === client.id);
                let soba = sobe[indeks].room;
                await pred.ubaciReview(soba, val, req, res);
            } )

        });
    }

    res.render('predavanjePublika', {title: 'Express', id: kod1, idP: id_predavaca});

});


module.exports = router;
