
const db = require("../../models");
const Pod = db.pod;

const deletePod = async (req, res) => {
 
    const result = await Pod.destroy({
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
  deletePod
};
