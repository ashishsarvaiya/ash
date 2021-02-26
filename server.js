var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql');
const bodyParser = require('body-parser');
const crypto = require('crypto');

app.use(bodyParser.json());
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
let password; 

function encrypt(password) {
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
 let encrypted = cipher.update(password);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(password) {
 let iv = Buffer.from(password.iv, 'hex');
 let encryptedText = Buffer.from(password.encryptedData, 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "vishal",
  database: "testdb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
 });

 app.post('/api/register',(req, res) => {
  password=encrypt(req.body.password);
  console.log(password.iv);
  let datauser = {employeeID: req.body.employeeID, firstname: req.body.firstname, lastname: req.body.lastname,email: req.body.email,password:password.encryptedData};
  let emp={employeeID: req.body.employeeID, OrganizaionName: req.body.OrganizaionName};
  var command = 'INSERT INTO Employees SET ?'
      con.query(command, emp, (err, result) =>{
          if (err) throw err;
          let sqluser= "INSERT INTO Users SET ?"
          con.query(sqluser, datauser,(err, results) => {
            if(err) throw err;
            console.log(result.affectedRows, results.affectedRows);
          res.end(JSON.stringify(result));
      });
  });
 });
 
 app.post('/api/login',(req, res) => {
   if(req.body.email==null || req.body.password==null) throw err;
   password=encrypt(req.body.password)
  var loginda={ email:req.body.email,password:password.encryptedData }
 var loginSql = `SELECT * FROM Users JOIN Employees ON Users.employeeID = Employees.employeeID WHERE Users.email ='`+loginda.email+`' AND Users.password ='`+loginda.password+`'`;
 con.query(loginSql, loginda,(err, result)=> {
   if (err) throw err;
   console.log(result);
   res.end(JSON.stringify(result));
   });
 });

 app.post('/api/search',(req, res) => {
   var da={ firstname:req.body.firstname,lastname:req.body.lastname,employeeID:req.body.employeeID,page:req.body.page -1,pageSize:req.body.pageSize }
   var sql = `SELECT Users.firstname,Users.lastname, Users.email, Users.employeeID,Employees.OrganizaionName FROM Users JOIN Employees ON Users.employeeID = Employees.employeeID 
   WHERE Users.firstname LIKE '%`+da.firstname+`%' OR Users.lastname LIKE '%`+da.lastname+`%' OR Users.employeeID LIKE '%`+da.employeeID+`%'
   ORDER BY Users.firstname ASC ,Users.lastname ASC, Users.email ASC, Users.employeeID ASC ,Employees.OrganizaionName ASC 
   LIMIT `+ da.page*da.pageSize+`,`+da.pageSize;
  con.query(sql, da,(err, result)=> {
    if (err) throw err;
    console.log(result);
    res.end(JSON.stringify(result));
    });
  });
  
 app.listen(3000,() =>{
   console.log('Server started on port 3000...');
 });
