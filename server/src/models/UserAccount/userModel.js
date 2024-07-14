module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("Users", {
      first_name: {
        type: DataTypes.STRING,
        allowNull:false       
        },
      last_name: {
        type: DataTypes.STRING,
        allowNull:false
        },
      user_name: {
        type: DataTypes.STRING,
        unique:true,
        allowNull:false
      },
      password: {
        type: DataTypes.STRING,
      },
      account_type: {
        type: DataTypes.STRING,
        allowNull:false
      },
      role: {
        type: DataTypes.STRING,
        allowNull:false
      },
      
    });
  
    return User;
  };
  