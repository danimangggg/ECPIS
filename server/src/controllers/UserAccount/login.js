
const bcrypt = require('bcryptjs');
const db = require("../../models");
const jwt = require('jsonwebtoken');
const User = db.login;

const login =  async (req, res) => {

    
        const { user_name, password } = req.body;
        const user = await User.findOne({ where: { user_name } });
        if (!user) {
          return res.status(400).json({ error: 'Invalid username or password' });
        }
        console.log(user.password)
        const isMatch = await bcrypt.compare(password, user.password);
       
        if (!isMatch) {
          return res.status(400).json({ error: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
     
}

module.exports = {
    login
  };