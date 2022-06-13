import 'dotenv/config';
import path from 'path';
import { Seeder } from 'mongo-seeding';
import DbConfig from '../../config/config';


const NODE_ENV = process.env.NODE_ENV ? 'production' : 'development';

const dbConfig = new DbConfig();

const configData = dbConfig.getConfig(NODE_ENV);

console.log(NODE_ENV);
console.log(`mongodb://${configData.options.user}:${encodeURIComponent(configData.options.pass)}@${configData.DATABASE_HOSTNAME}:${configData.DATABASE_PORT}`);

const config = {
  // database: {
  //   protocol: 'mongodb',
  //   host: configData.DATABASE_HOSTNAME,
  //   port: configData.DATABASE_PORT,
  //   name: configData.DATABASE_NAME,
  //   username: configData.options.user,
  //   password: configData.options.pass
  // },
  database: `mongodb://${configData.options.user}:${configData.options.pass}@${configData.DATABASE_HOSTNAME}:${configData.DATABASE_PORT}/${configData.DATABASE_NAME}`,
  dropDatabase: false,
  databaseReconnectTimeout: 10000,
  dropCollections: true,

};

console.log(config);

console.log(path.resolve(__dirname,'../../../data-import'))

const seeder = new Seeder(config);
const collections = seeder.readCollectionsFromPath(
  path.resolve(__dirname,'../../../data-import'),
  {
    transformers: [Seeder.Transformers.replaceDocumentIdWithUnderscoreId],
  },
);

console.log(collections)

seeder
  .import(collections)
  .then((data) => {
    console.log(data)
    console.log('Success seeded data');
  })
  .catch(err => {
    console.log('Error while seeding data', err);
  });