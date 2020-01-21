var mysql = require('mysql');
var pool = mysql.createPool({
  host:'localhost',
  port:3306,
  user:'root',
  password:'1234',
  database:'miro',
  dateStrings: 'date',
  connectionLimit : 50
});
module.exports = pool;
