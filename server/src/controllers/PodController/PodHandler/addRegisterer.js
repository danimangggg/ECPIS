
const db = require("../../../models");
const Registerer = db.registerer;

const addRegisterer = (req, res) => {
   const result = Registerer.create({
            registerer: req.body.registerer,
          });
          if(result){
            res.status(200).send({message:'Region created'})
          }
          
        }

module.exports = {
  addRegisterer
};
