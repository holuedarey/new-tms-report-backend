import morgan from 'morgan';
import mongoose from "mongoose";
import bodyparser from 'body-parser';
import cors from 'cors';
import timeout from 'connect-timeout';
import express from 'express';
import Routes from './routes/index.route';
import Config from './config/config';
import Logger from './helpers/logger';
import 'dotenv/config';
import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';

const app = express();
const port = process.env.PORT || '8000';


const httpServer = http.createServer(app);
// const httpsServer = https.createServer({
//   key: fs.readFileSync(path.resolve('./src/ssl/paysure_ng.key')),
//   cert: fs.readFileSync(path.resolve('./src/ssl/paysure_ng.crt')),
//   passphrase: 'paySureNg',
// }, app);

/** connection mongodb */
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
const config = new Config();
const dbConfig = config.getConfig(process.env.NODE_ENV);
mongoose.set('debug', true);

mongoose.connect(dbConfig.DATABASE_URL, dbConfig.options, (err) => {
  if (err) Logger.log(err);
  else { Logger.log(`Connected to mongodb successfully on ${process.env.NODE_ENV}`); }
});
/** Enable Cross Origin Resource Sharing */
app.use(cors());
app.use(express.static(path.join(__dirname, '/../uploads')));



app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization")
  res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
  next();
});


app.use(timeout('5m'));
/** set parser to parse the request data in json format */
app.use(
  express.json({
    limit: "50mb",
    type: [
      "application/json",
      "text/plain",
    ],
  })
);
app.use(express.urlencoded({ extended: true }));

app.use('/test', (req, res) => {
  res.json('Bizzdesk running')
})

// app.use(bodyparser.json({ limit: '50mb' }));
// app.use(bodyparser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(morgan(':date *** :method :: :url ** :response-time'));


app.use('/api/v1', Routes);

/** Use SSL socket on production */
// if (process.env.USE_SSL) {
//   httpsServer.listen(port, () => {
//     Logger.log(`Secure server running on port: ${port}`);
//   });
// } else {
//   httpServer.listen(port, () => {
//     Logger.log(`app running on http://localhost:${port}`);
//   });
// }
app.listen(port, () => {
  // if (err) return console.error(err);
  return console.log(`Server Magic happening on port ${port}`);
});