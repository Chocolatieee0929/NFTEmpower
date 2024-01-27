/**
 * 用 nedb 做本地数据库
 */
// const Datastore = require('nedb')
import Datastore from "nedb";
const db = new Datastore({
  filename: "./db/nft-market.db",
  autoload: true,
  timestampData: true,
});

db.ensureIndex({ fieldName: "transactionHash", unique: true }, function (err) {
  if (err) {
    console.log("db index error", err);
  }
});

export default db;
