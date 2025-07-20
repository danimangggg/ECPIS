const db = require("../../models");
const UpdateQueue = db.customerService;

const updateQueue = async (req, res) => {
  try {
    const result = await UpdateQueue.update(
      {
        next_service_point: req.body.next_service_point,
        assigned_officer_id: req.body.assigned_officer_id,
        status:req.body.status,
        completed_at: req.body.completed_at
         // ✅ Only this field is updated
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );

    if (result[0] > 0) {
      res.status(200).send({ message: 'Service updated successfully' });
    } else {
      res.status(404).send({ message: 'Service not found' });
    }
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

module.exports = {
  updateQueue
};
