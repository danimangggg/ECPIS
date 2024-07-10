const express = require("express");
const cors = require('cors');
const app = express();
const db = require('./src/models');
const initRoutes = require("./src/routes/web");


app.use(cors())
app.use(express.json())
global.__basedir = __dirname;

app.use(express.urlencoded({ extended: true }));
initRoutes(app);

app.use(express.static("resources/static/assets/uploads"));

db.sequelize.sync();
db.sequelize.sync().then(() => {
  console.log("Drop and re-sync db.");   
  });


let port = 4001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Running at localhost:${port}`);
});
