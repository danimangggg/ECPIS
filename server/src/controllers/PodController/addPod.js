
const db = require("../../models");
const Pod = db.pod;

const addPod = (req, res) => {

    if (req.file == undefined) {
      return res.send(`You must select a file.`);
    }
    
    Pod.create({ 
      region: req.body.region,
      zone_Subcity: req.body.zone_Subcity,
      woreda: req.body.woreda,
      facilityName: req.body.facilityName,
      dn_no: req.body.dnNo,
      order_no: req.body.orderNo,
      manual_dno: req.body.manualDelveryNo,
      pod_no: req.body.podNo,
      registered_by: req.body.registeredBy,
      received_by: req.body.receivedBy,
      //date: req.body.date,
      //image: req.file.filename
      }).then(res=> {
          console.log(__basedir)
          }).catch ((error)=>{
          console.log(error);
          return res.send(`Error when trying upload images: ${error}`);
          })
          }

module.exports = {
  addPod
};
