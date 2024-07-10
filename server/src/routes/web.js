const express = require("express");
const cors = require('cors');
const app = express();
const router = express.Router();
const addContract = require("../controllers/upload");
const retriveController = require("../controllers/retrive");
const addRegion = require('../controllers/FacilityProfile-Controller/Region/addRegion')
const showRegions = require('../controllers/FacilityProfile-Controller/Region/showRegions')
const addZone = require('../controllers/FacilityProfile-Controller/Zone/addZone')
const showZone = require('../controllers/FacilityProfile-Controller/Zone/showZone')
const addWoreda = require('../controllers/FacilityProfile-Controller/Woreda/addWoreda')
const showWoreda = require('../controllers/FacilityProfile-Controller/Woreda/showWoreda')
const addFacility = require('../controllers/FacilityProfile-Controller/Facility/addFacility')
const showFacility = require('../controllers/FacilityProfile-Controller/Facility/showFacility')
const deleteContract = require('../controllers/CreaditController/DeleteCreditController')
const findOne = require('../controllers/CreaditController/fineOne')
const updateContract = require('../controllers/CreaditController/UpdateCredit')
const AddPod = require('../controllers/PodController/addPod')
const ViewPod = require('../controllers/PodController/viewPod')
const findOnePod = require('../controllers/PodController/fineOne')
const upload = require("../middleware/upload");


app.use(cors());
let routes =  (app) => {

  router.get('/api/all',retriveController.retriveFiles)

  router.post("/api/upload", upload.single('file'), addContract.uploadFiles);
  router.post("/api/addregion", upload.none(), addRegion.addRegion);
  router.get('/api/regions', showRegions.retriveRegions);
  router.post("/api/addzone", upload.none(), addZone.addZone);
  router.get('/api/zones', showZone.retriveZone);
  router.post("/api/addworeda", upload.none(), addWoreda.addWoreda);
  router.get('/api/woredas', showWoreda.retriveWoreda);
  router.post("/api/addfacility", upload.none(), addFacility.addFacility);
  router.get('/api/facilities', showFacility.retriveFacility);
  router.delete('/api/deleteContract/:id', deleteContract.deleteFiles);
  router.get('/api/find/:id', findOne.findFiles);
  router.put('/api/updateContract/:id', upload.none(), updateContract.updateFiles);

  router.post("/api/addPod", upload.single('file'), AddPod.addPod);
  router.get('/api/viewPod',ViewPod.retrivePods)
  router.get('/api/findPod/:id', findOnePod.findPod);

  return app.use("/", router);
};

module.exports = routes;
