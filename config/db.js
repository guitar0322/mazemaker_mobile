var mysql = require('mysql');
var conn = mysql.createConnection({
  host:'localhost',
  port:3307,
  user:'root',
  password:'111111',
  database:'miro'
});
module.exports = conn;
