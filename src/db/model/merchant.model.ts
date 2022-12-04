/**
 * Merchant Model
 * Stores merchants details
 */
 import mongoose from "mongoose";
 const { Schema } = mongoose;
 import { ObjectID } from 'mongodb';
 // @ts-ignore
 const schema = new Schema({
  //  id: Number,
  //  merchant_id: {
  //    type: String,
  //    unique: true,
  //    index: {
  //      unique: true,
  //      partialFilterExpression: { merchant_id: { $type: 'string' } },
  //    },
  //  },
  //  tams_mid: String,
  //  tams_mids: Array,
  //  mid_link: String,
  //  merchant_name: {
  //    type: String,
  //    trim: true,
  //  },
  //  username: String,
  //  merchant_phone: String,
  //  merchant_email: {
  //    type: String,
  //    lowercase: true,
  //  },
  //  password: String,
  //  emailtoken: String,
  //  roles: {
  //    type: Array,
  //    default: ['merchant'],
  //  },
  //  merchant_contact: String,
  //  merchant_address: String,
  //  merchant_account_nr: String,
  //  created_at: {
  //    type: Date,
  //    index: true,
  //  },
 
  //  ptsp: String,
  //  state_code: String,
  //  lga: String,
  //  bank_code: String,
  //  mcc: String,
  //  category: String,
 
  //  merchant_description: String,
  //  merchant_account_name: String,
  //  merchant_account_type: String,
  //  merchant_contacts: Array,
  //  rc_number: String,
  //  business_industry: Array,
  //  terminals: Array,
  //  terminals_count: Number,
  //  assigned_term_count: {
  //    type: Number,
  //    default: 0,
  //  },
  //  merchant_bank_branch: String,
  //  opening_hours: String,
  //  price_ranges: String,
 
  //  profile_compliance: Object,
  //  referral_staff: String,
  //  referral_staff_id: String,
  //  ussd_code: String,
  //  business_occupation_code: String,
  //  pan_account_nr: String,
  //  msc_rate: String,
  //  upper_limit: String,
  //  settlement_cycle: String,
 
  //  bank_branch: String,
  //  approval_level: Number,
  //  denied: Boolean,
  //  denied_by: Object,
  //  approved: Boolean,
  //  approved_by: Array,
 
  //  upload_id: String,
     name: String,
     enabled:String,
     email: String,
     phoneNumber: String,
     account: String,
     bank: String,
     band: String,
     logoUrl: String,
     supportStaff: ObjectID,
     merchantCode: String,
     isApproved: { type: Boolean, default: false }
 }, {
   timestamps: true,
 });
 
 const Merchant = mongoose.model('Merchant', schema);
 
 export default Merchant;
 