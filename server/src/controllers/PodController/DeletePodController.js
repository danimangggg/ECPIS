
const db = require("../../models");
const Creadit = db.creadit;

const deleteFiles = async (req, res) => {
 
    const result = await Creadit.destroy({
      where:{
        id:  req.params.id
      }
      });
      if (result) {
        res.status(200).send({ message: 'Item deleted successfully' });
      } else {
        res.status(404).send({ message: 'Item not found' });
      }
        }

module.exports = {
  deleteFiles,
};
