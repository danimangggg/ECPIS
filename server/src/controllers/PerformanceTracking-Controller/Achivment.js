const db = require('../../models');
const Achive = db.achivement;

const AddAchivment = async (req, res) => {
  try {
    const result = await Achive.create({
      assignmentId: req.body.assignmentId,
      achieved: req.body.achieved,
      savedDate: req.body.savedDate
    });

    res.status(200).send({ message: "Achievement created successfully", task: result });
  } catch (error) {
    console.error("Error saving task:", error);
    res.status(500).send({ message: "Failed to save Achievment", error: error.message });
  }
};

module.exports = {
  AddAchivment
};
