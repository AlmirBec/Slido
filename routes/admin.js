var express = require('express');
var router = express.Router();
var admin = require("../public/potrebe/upiti_admin")
var pitanja = require("../public/potrebe/upiti_pitanja");

/* GET home page. */
router.get('/', provjeriCookie, function(req, res, next) {
  res.render('admin', { title: 'ADMIN PAGE' });
});

router.get('/login', function(req, res, next) {
  res.render('adminlogin', { title: 'Loginpage' });
});

router.post('/login', function(req, res, next){
  admin.provjeriLogin(req, res, next);
});

router.get('/loginhash', function (req, res, next){
  res.render('adminhash');
});

router.post('/loginhash', function (req, res, next){
  admin.hashirajIizmijeni(req.body.adminpassword, req.body.adminpassword2, req, res);
});

router.get('/predavac', provjeriCookie, admin.getPredavaci, function(req, res, next) {
  res.render('apredavac', { title: 'Predavac', predavaci: req.predavac });
});
router.get('/vulgarizmi', provjeriCookie, admin.getVulgarizmi, function(req, res, next) {
  res.render('adminvulgarizmi', { title: 'Predavac', vulgarizmi: req.vulgarizmi });
});
router.get('/vulgarizmi/obrisi/:id', provjeriCookie, admin.delVulgarizam, function(req, res, next) {
  res.redirect("http://localhost:3000/admin/vulgarizmi");
});
router.get('/predavac/obrisi/:id', provjeriCookie,admin.delSve, admin.delPredavaci, function(req, res, next) {
  res.redirect("http://localhost:3000/admin/predavac");
});
router.post('/predavac/ban/:id', provjeriCookie, async function(req, res, next) {
  let id = req.params.id;
  let datum = new Date();
  await admin.banuj(id, datum, req, res);
  res.redirect("http://localhost:3000/admin/predavac");
});
router.post('/predavac/unban/:id', provjeriCookie, async function(req, res, next) {
  let id = req.params.id
  await admin.odobriPristup(id, req, res);
  res.redirect("http://localhost:3000/admin/predavac");
});

router.post('/predavac/dodaj', provjeriCookie, admin.dodajPredavaca, function (req, res, next){
  res.redirect("http://localhost:3000/admin/predavac");
});

router.get('/predavanje', provjeriCookie, admin.getPredavanja, function(req, res, next) {
  res.render('adminpredavanje', { title: 'Predavanja', predavanja: req.predavanja });
});
router.get('/predavanja/obrisi/:id',provjeriCookie,admin.delPitanjaKod, admin.delPredavanja, function(req, res, next) {
  res.redirect("http://localhost:3000/admin/predavanje");
});

router.get('/pitanja', provjeriCookie, admin.getPitanja, function (req, res, next){
  res.render('adminpitanja', { title: 'Pitanja', pitanja: req.pitanja });
});

router.get('/pitanja/obrisi/:id', provjeriCookie, admin.delPitanja, function(req, res, next) {
  res.redirect("http://localhost:3000/admin/pitanja");
});
router.get('/logout', function (req, res, next){
  res.cookie("adminCookie", "", {maxAge: -1});
  res.redirect('/');
});
router.post('/vulgarizmi/dodaj', provjeriCookie, admin.dodajVulgarizam, function (req, res, next){
  res.redirect("http://localhost:3000/admin/vulgarizmi");
});

function provjeriCookie(req, res, next){
  let cookie = req.cookies.adminCookie;
  if(cookie){
    next();
  }
  else{
    res.redirect('/');
  }
}
module.exports = router;
