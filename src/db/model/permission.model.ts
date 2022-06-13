import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  permission_name: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });


export default mongoose.model('Permissions', permissionSchema);
