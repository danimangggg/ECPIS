const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.creadit = require("./creadit.model.js")(sequelize, Sequelize);
db.region = require("./FacilityProfile-Model/regionModel.js")(sequelize, Sequelize);
db.zone = require("./FacilityProfile-Model/zone_subcityModel.js")(sequelize, Sequelize);
db.woreda = require("./FacilityProfile-Model/woredaModel.js")(sequelize, Sequelize);
db.facility = require("./FacilityProfile-Model/facilityModel.js")(sequelize, Sequelize);
db.pod = require("./pod.model.js")(sequelize, Sequelize);

module.exports = db;
