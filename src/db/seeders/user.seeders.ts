// /* eslint-disable no-console */
// /* eslint-disable func-names */

// import mongoose from 'mongoose';
// import permissionsModel from '../model/permission.model';
// import rolesModel from '../model/roles.model';
// import config from '../../config/config';
// import {Permissions, Roles} from '../../interfaces/db.models';
// const { getObjectId } = require("mongo-seeding");


// /** connection to mongodb */
// const connect = function () {
//   const NODE_ENV = process.env.NODE_ENV ? 'production' : 'development';

//   /** connection mongodb */
//   mongoose.Promise = global.Promise;
//   mongoose.connect(config[NODE_ENV].DATABASE_URL, config[NODE_ENV].options, (err) => {
//     console.log(err);
//   });
//   console.log(`Connected to mongodb successfully for services seeder on ${NODE_ENV}`);
// };

// /** Drop existing roles if any */
// const dropRoles = function () {
//   return rolesModel.deleteMany({});
// };

// /** Drop existing permissions if any */
// const dropPermissions = function () {
//   return permissionsModel.deleteMany({});
// };


// /** close mongodb connection */
// const closeConnection = function () {
//   return new Promise((resolve) => {
//     mongoose.connection.close(() => {
//       console.log('mongodb connection closed');
//       resolve(true);
//     });
//   });
// };

// /** seed default permissions and roles to db */
// const Seeders = {
//   async seedRoles() {
   
//     return rolesModel.insertMany(roles);

//     /** Bulk insert mongodb default roles data */
//   },
//   async seedPermissions() {
//     return permissionsModel.insertMany();
//     /** Bulk insert mongodb default permissions data */
//   },

// };

// const migration = async function () {
//   await connect();
//   await dropRoles();
//   await dropPermissions();
//   await Seeders.seedRoles();
//   await Seeders.seedPermissions();
//   await closeConnection();

//   console.log('db migration successful for user-managment');
// };


// migration();
