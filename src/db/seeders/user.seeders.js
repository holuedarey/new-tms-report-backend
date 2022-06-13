/* eslint-disable no-console */
/* eslint-disable func-names */
require("dotenv").config();
const mongoose =  require('mongoose');
// import permissionsModel from '../../model/permission.model';
const rolesModel = require('../model/roles.model');
// import countryCodeModel from '../../model/country_code.model';
const config = {
  development: {
    DATABASE_URL: `mongodb://localhost:${process.env.MDB_PORT}/${process.env.DATABASE_NAME_DEV}`,
    SECRET_KEY: process.env.API_SECRET_KEY,
    DATABASE_HOSTNAME: "localhost",
    DATABASE_PORT: process.env.MDB_PORT,
    DATABASE_NAME: process.env.DATABASE_NAME_DEV,
    options: {
      user: "",
      pass: "",
      keepAlive: true,
      keepAliveInitialDelay: 300000,
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
  },
  production: {
    DATABASE_URL: `mongodb://${process.env.MONGO_DB_HOST}:${process.env.MDB_LIVE_PORT}/${process.env.DATABASE_NAME}`,
    SECRET_KEY: process.env.API_SECRET_KEY,
    DATABASE_HOSTNAME: process.env.MONGO_DB_HOST,
    DATABASE_PORT: process.env.MDB_LIVE_PORT,
    DATABASE_NAME: process.env.DATABASE_NAME,
    options: {
      user: process.env.MDB_LIVE_USRNAME,
      pass: process.env.MDB_LIVE_PASSWORD,
      keepAlive: true,
      keepAliveInitialDelay: 300000,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    },
  },
};

/** connection to mongodb */
const connect = function () {
  const NODE_ENV = process.env.NODE_ENV ? 'production' : 'development';

  console.log(process.env.NODE_ENV);
  console.log(config)

  /** connection mongodb */
  mongoose.Promise = global.Promise;
  mongoose.connect(config[NODE_ENV].DATABASE_URL, config[NODE_ENV].options, (err) => {
    console.log(err);
  });
  console.log(`Connected to mongodb successfully for services seeder on ${NODE_ENV}`);
};

/** Drop existing roles if any */
const dropRoles = function () {
  return rolesModel.deleteMany({});
};

// /** Drop existing permissions if any */
// const dropPermissions = function () {
//   return permissionsModel.deleteMany({});
// };

// /** Drop existing countrycodes if any */
// const dropCountryCodes = function () {
//   return countryCodeModel.deleteMany({});
// };

/** close mongodb connection */
const closeConnection = function () {
  return new Promise((resolve) => {
    mongoose.connection.close(() => {
      console.log('mongodb connection closed');
      resolve();
    });
  });
};

/** seed default permissions and roles to db */
const Seeders = {
  async seedRoles() {
    return rolesModel.insertMany([
      {
        role_name: 'admin',
      },
      {
        role_name: 'user',
      },
      {
        role_name: 'agent',
      },
      {
        role_name: 'super-agent',
      },
      {
        role_name: 'merchant',
      },
      {
        role_name: 'support',
      },
    ]);

    /** Bulk insert mongodb default roles data */
  },


};

const migration = async function () {
  await connect();
  await dropRoles();
  await Seeders.seedRoles();
  await closeConnection();

  console.log('db migration successful for user-managment');
};


migration();
