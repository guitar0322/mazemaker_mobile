var mysql = require('mysql');
var conn = mysql.createConnection({
  host:'localhost',
  port:3307,
  user:'root',
  password:'1234',
  database:'miro',
  dateStrings: 'date'
});
module.exports = conn;
