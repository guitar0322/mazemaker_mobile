var mysql = require('mysql');
var pool = mysql.createPool({
  host:'localhost',
  port:3306,
  user:'root',
  password:'!Q2w3e4r',
  database:'miro',
  dateStrings: 'date'
});
module.exports = pool;
