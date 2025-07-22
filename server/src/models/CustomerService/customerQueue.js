module.exports = (sequelize, DataTypes) => {
  const CustomerQueue = sequelize.define('CustomerQueue', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    facility_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customer_type: {
      type: DataTypes.ENUM('Cash', 'Credit'),
      allowNull: false,
    },
    next_service_point: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assigned_officer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('started', 'onprogress', 'completed'),
      allowNull: false,
      defaultValue: 'started',
    },
    delegate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    delegate_phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    letter_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'customer_queue',
    timestamps: false,
  });

  return CustomerQueue;
};
