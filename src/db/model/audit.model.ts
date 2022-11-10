import mongoose from 'mongoose';

/**
 * Audit Model
 * Store Audit Logs
 */
 import { ObjectId } from 'mongoose';

 const { Schema } = mongoose;
 
 const schema = new mongoose.Schema({
   auditActivity: String,
   auditType: String,
   description: String,
   user: {
     name: {type: String, trim: true},
     email: {type: String, trim: true},
     role: {type: String, },
   },
   ipAddress: String,
 }, {
   timestamps: true,
 });
 schema.index({ auditActivity: 1, auditType: 1, createdAt: 1 }, { unique: true });
 
 const Audit = mongoose.model('Audit', schema);
 
 export default Audit;
 

 export enum AuditEventResources {
  DashboardView = 'pages:dashboard-view',
  UsersView = 'User Management',
  TerminalView = 'pages:service-band-view',
  MerchantView = 'pages:analytics-module-view',
  NotificationView = 'pages:load-point-analytics-view',
  LoadPointsView = 'pages:load-point-analytics-view'
}

export enum AuditActionResources {
  DashboardView = 'pages:dashboard-view',
  UsersCreate= 'User Creatiion',
  UsersUpdate= 'User Update',
  UsersLogin= 'User Login',
  UsersActivate= 'User Activation',
  TerminalView = 'pages:service-band-view',
  MerchantView = 'pages:analytics-module-view',
  NotificationView = 'pages:load-point-analytics-view',
  LoadPointsView = 'pages:load-point-analytics-view'
}