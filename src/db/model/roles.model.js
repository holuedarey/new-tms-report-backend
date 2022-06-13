const mongoose = require('mongoose');

const rolesSchema = new mongoose.Schema({
  role_name: String,
  // permission: String,
}, { timestamps: true });


module.exports = mongoose.model('Role', rolesSchema);