const jwt = require('jsonwebtoken');
const config = require('../config/config');

// JWT auth middleware — replaces OVP's Keycloak middleware
module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // { id, email, role, firstName }
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
