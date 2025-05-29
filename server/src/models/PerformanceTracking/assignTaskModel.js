// Employee Model Example (for Sequelize / Node.js)
module.exports = (sequelize, DataTypes) => {
  const AssignedTask = sequelize.define('AssignedTasks', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    target: {
      type: DataTypes.STRING,
      allowNull: false
    },
  });

  return AssignedTask;
};
