import mongoose from 'mongoose';

const rolesSchema = new mongoose.Schema({
  role_name: String,
  // permission: String,
}, { timestamps: true });


export default mongoose.model('Role', rolesSchema);