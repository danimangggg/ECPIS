const db = require("../../models");
const UpdateQueue = db.customerService;

const updateQueue = async (req, res) => {
  try {
    const {
      id,
      next_service_point,
      assigned_officer_id,
      status,
      completed_at,
      aa1_odn,
      aa2_odn,
      aa3_odn,
      store_id_1,
      store_id_2,
      store_id_3,
      store_completed_1,
      store_completed_2,
      store_completed_3,
    } = req.body;

    const result = await UpdateQueue.update(
      {
        next_service_point: next_service_point,
        assigned_officer_id: assigned_officer_id,
        status: status,
        completed_at: completed_at,
        // EWM-specific fields
        aa1_odn: aa1_odn,
        aa2_odn: aa2_odn,
        aa3_odn: aa3_odn,
        store_id_1: store_id_1,
        store_id_2: store_id_2,
        store_id_3: store_id_3,
        // Convert boolean to 1 or 0 for MySQL TINYINT(1)
        store_completed_1: store_completed_1 ? 1 : 0,
        store_completed_2: store_completed_2 ? 1 : 0,
        store_completed_3: store_completed_3 ? 1 : 0,
      },
      {
        where: {
          id: id,
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

const completeEWMTask = async (req, res) => {
    try {
        const { id, store_completed_1, store_completed_2, store_completed_3 } = req.body;

        let updateData = {};
        if (store_completed_1 !== undefined) {
            updateData.store_completed_1 = 1; 
        }
        if (store_completed_2 !== undefined) {
            updateData.store_completed_2 = 1; 
        }
        if (store_completed_3 !== undefined) {
            updateData.store_completed_3 = 1; 
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ message: 'No completion status provided.' });
        }

        const result = await UpdateQueue.update(updateData, {
            where: {
                id: id,
            },
        });

        if (result[0] > 0) {
            const customer = await UpdateQueue.findByPk(id);
            const allStoresCompleted = (customer.store_id_1 ? customer.store_completed_1 === 1 : true) &&
                                       (customer.store_id_2 ? customer.store_completed_2 === 1 : true) &&
                                       (customer.store_id_3 ? customer.store_completed_3 === 1 : true);

            if (allStoresCompleted) {
                await UpdateQueue.update({ status: 'Completed', next_service_point: null }, { where: { id: id } });
                return res.status(200).send({ message: 'Task completed and service finalized.', status: 'Completed' });
            } else {
                return res.status(200).send({ message: 'Task completed for your store.', status: 'Partial' });
            }
        } else {
            return res.status(404).send({ message: 'Service not found.' });
        }
    } catch (error) {
        console.error("Error completing EWM task:", error);
        return res.status(500).send({ message: 'Internal server error.' });
    }
};

module.exports = {
  updateQueue,
  completeEWMTask
};