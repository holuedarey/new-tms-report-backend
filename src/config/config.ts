import "dotenv/config"

export default class Config {

        public configObject: any;

        constructor() {
            this.configObject = {
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
        }

        public getConfig(env: string) {

            return env === "development" ? this.configObject.development : this.configObject.production;

        }
}
