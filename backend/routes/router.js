
const express=require('express');
const router=express.Router();
const multer = require("multer");

//Midleware
router.use(express.urlencoded({extended: false}));
//importation
const prod=require('../controllers/Controller');
const fileUpload=require('../utils/fileUpload');
//Router

router.get("/",(req,res,next)=>{
    res.send("ANDRIAMIHAJA Joelson Emile ");
});

//Concernant le user
router.post("/signup",prod.singup);
router.post("/login",prod.login);
router.get("/getuserby",prod.findUserByPartialMatch);
router.get("/finduser/:id",prod.findUser);
router.get("/getuser",prod.getuser);
router.delete("/deleteuser/:id",prod.deleteuser);
router.post("/registeruser",prod.registerUser);

//Concernant le user loca!
router.post("/adduserlocal",prod.adduserlocal);
router.get("/getuserlocal",prod.getuserlocal);
router.get("/countuserlocal",prod.countUserlocals);
router.get("/calculatetotalpriceuserlocal",prod.calculateTotalPriceuserlocal);

//Concernant le retrait
router.post("/addretrait",prod.addretrait);
router.get("/calculatetotalretrait",prod.calculateTotalRetrait);

//Concernant le devis
router.post("/addDevis",prod.addDevis);
router.get("/getdevis",prod.getdevis);
//Concernant le produit
router.post("/uploadProduct",prod.uploadproduct);
router.get("/getproduct",prod.getproduct);
router.get("/getproductonweekago",prod.getproductonweekago);
router.delete("/deleteproduct/:id",prod.deleteproduct);
router.put("/updateproduct/:id",prod.updateproduct);
router.post("/checkoutpayement/",prod.checkoutpayement);

//Concernant le contact
router.post("/addcontact",prod.addcontact);
router.get("/getcontact",prod.getcontact);
router.get("/countcontact",prod.countContacts);

//Concernant la facture
router.post("/createInvoice",prod.createInvoice);
router.get("/getInvoice",prod.getInvoice);


//Concernant le client
router.get("/countclient",prod.countClients);

//Revenu Aujourdui
router.get("/getsumofpricetoday",prod.getSumOfPricesToday);

//Revenu cette semaine
router.get("/getsumofpricethisweek",prod.getSumOfPricesThisWeek);
//Revenu par jour dans pour cette semaine
router.get("/getsumofpricesperdaythisweek",prod.getSumOfPricesPerDayThisWeek);

//Revenu ce mois
router.get("/getsumofpricethismonth",prod.getSumOfPricesThisMonth);

// Revenu cette année
router.get("/getsumofpricethisyear",prod.getSumOfPricesThisYear);
//Revenu par jour dans pour cette semaine
router.get("/getsumofpricespermonththisyear",prod.getSumOfPricesPerMonthThisYear);

//Create a temoignage
router.post("/createtemoignage",prod.createTemoignage)
//To get all temoignage
router.get("/gettemoignage",prod.getTemoignage)

//To add deal du jour 
router.post("/adddealdujour",prod.adddealdujour)
router.get("/getdealdujour",prod.getdealdujour)
router.put("/updatedealdujour/:id",prod.updatedealdujour)
router.get("/getalldealdujour",prod.getalldealdujour)
router.delete("/deletedealdujour/:id",prod.deletedealdujour)
module.exports=router;