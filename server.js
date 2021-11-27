const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const { auth, requiresAuth } = require("express-openid-connect");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
require("dotenv").config();
var moment = require('moment'); 
app.engine('pug', require('pug').__express)
app.set('view engine', 'pug');
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');
const { Connection, Request } = require("tedious");

var elasticemail = require('elasticemail');
var client = elasticemail.createClient({
  username: 'jaykay',
  apiKey: '6608A6A955AAE805C390C1A738C0D0DF964FD242D1B38136E6CC8F7FD1EC212F39E8E439D880A4DB70FC833B040AB324'
});

const config = {
  authentication: {
    options: {
      userName: "pragati", // update me
      password: "password123.." // update me
    },
    type: "default"
  },
  server: "engage-pragati.database.windows.net", // update me
  options: {
    database: "testDB", //update me
    encrypt: true
  }
};
const connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on("connect", err => {
  if (err) {
    console.error(err.message);
  } else {
    const request = new Request(
      `select id from student where name='PJ'`,
      (err, rowCount) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`${rowCount} row(s) returned`);
        }
      }

    );
    request.on("row", columns => {
      columns.forEach(column => {
        console.log("%s\t%s", column.metadata.colName, column.value);
      });
    });
  
    connection.execSql(request);
  }
});

connection.connect();
app.use(express.static(__dirname + '/public'));
app.use(
  auth({
    issuerBaseURL: "https://dev-kh2d5kc6.us.auth0.com",
    baseURL: "https://testpragati.azurewebsites.net/",
    clientID: "gxjResFZ3CyYq3C3ICpCA1ZhQfxANLL9",
    secret: "db986688af1cb4d29871b4e93673e29821657eb8f0a2183b670ff58313e8e091",
    authRequired: false,
    auth0Logout: true,
  })
);
let token = "";
var AuthenticationClient = require("auth0").AuthenticationClient;

var auth0 = new AuthenticationClient({
  domain: "dev-kh2d5kc6.us.auth0.com",
  clientId: "FU04qrUSSoWOH6NAYBO49vrcuYagYsoY",
  clientSecret:
    "3MszsueN33eG7OgBhLMStfPORgbUHIC-p9TrI5yXTR2B6KrseC7pmWQGxVhvA13g",
});

app.get("/", (req, res) => {
  //res.send(req.oidc.isAuthenticated()?'Logged in':'Logged out');
  auth0.clientCredentialsGrant(
    {
      audience: "https://dev-kh2d5kc6.us.auth0.com/api/v2/",
      scope: "read:users read:roles",
    },
    function (err, response) {
      if (err) {
        // Handle error.
      }
      token = response.access_token;
    }
  );
  localStorage.clear();
  if (req.oidc.isAuthenticated()) {
    user_email = req.oidc.user.email;
    user_id = req.oidc.user.sub;
    console.log(user_id);
    localStorage.setItem("user_id", user_id);
    var axios = require("axios").default;

    var opt = {
      method: "POST",
      url: `http://dev-kh2d5kc6.us.auth0.com/api/v2/users/${user_id}/roles`,
      headers: { authorization: `Bearer ${token}` },
    };
    let role = "";
    axios
      .request(opt)
      .then(function (response) {
        console.log(response.data);
        role = response.data[0].name;

        console.log(role);
        if (role == "Teacher") {
          res.sendFile("teacher_main.html", { root: __dirname });
        } else {
          res.sendFile("student.html", { root: __dirname });
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  } else {
    return res.redirect("/login");
  }
});
app.get('/teacher',requiresAuth(),(req,res)=>
{
    res.sendFile('teacher.html',{root:__dirname});
    //res.render('main');
})
app.post('/schedule-class',urlencodedParser,function(req,res){
  let dtl=req.body.dtl;
  let duration=req.body.duration;
  let subject=req.body.subject;
  console.log(dtl);
  let year=req.body.year;
  let dept=req.body.dept;
  let input_start_date=dtl.slice(0, 16).replace('T', ' ');
  console.log(input_start_date);
  let y = moment(input_start_date).add(duration, 'm').format("yyyy-MM-DD HH:mm");
  let input_end_date=y.slice(0, 16).replace('T', ' ');
  console.log(input_end_date);
  let q_get_name_of_teacher="select name from teacher where teacher_id='"+localStorage.user_id+"';";
  let name="";
  // con.query(q_get_name_of_teacher,function(err,result){
  //     name=result[0].name;
  // });
  
  // let q="select count(startDate) as overlap from classes join departments on classes.dept_id=departments.dept_id where year='"+ year+"' and name='"+dept+"' and startDate between '"+input_start_date+"' and '"+input_end_date
  //     +"' or endDate between '"+input_start_date+"' and '"+input_end_date
  //     +"' or startDate<'"+input_start_date+"' and endDate>'"+input_end_date+"' or startDate>'"+input_start_date
  //     +"' and endDate<'"+input_end_date+"';";
  //     // let query="select * from datetimes where startDate between "+input_start_date+" and "+input_end_date+"' or endDate between '"+input_start_date+"' and '"+input_end_date
  //     // +"' or startDate<'"+input_start_date+"' and endDate>'"+input_end_date+"' or startDate>'"+input_start_date+"' and endDate<'"+input_end_date;
  //     console.log(q);
  //     con.query(q, function (err, result) {
  //       if(result[0].overlap==0){
  //         let dept_id;
  //         con.query("select dept_id from departments where name='"+dept+"';", function(err,result){
  //             dept_id=result[0].dept_id;
  //             //console.log(dept);
  //             let aq="insert into classes values('"+localStorage.user_id+"','"+year+"','"+dept_id+"','"+subject+"','"+input_start_date+"','"+input_end_date+"');";
  //           console.log(aq);
  //           con.query(aq,function(er,res){
  //               console.log(res);
  //               if (err) throw err;
  //           });
  //           let get_emails_query="select email from students where dept_id='"+dept_id+"' and year='"+year+"';";
  //           if(year==1){
  //             year="1st";
  //           }
  //           else if(year==2){
  //             year="2nd";
  //           }
  //           else if(year==3){
  //             year="3rd";
  //           }
  //           else{
  //             year="4th";
  //           }
  //           res.render('sc',{
  //             dept: dept,
  //             year: year,
  //             time: input_start_date,
  //           })
  //           con.query(get_emails_query,function(er,res){
  //             console.log(res);
  //             if (err) throw err;
  //             if(res.length>0){
  //               let emails=[];
  //             let emails_str="";
  //           for(let i=0;i<res.length;i++){
  //             emails.push(res[i].email);
  //           }
  //           for(let i=0;i<res.length-1;i++){
  //             emails_str+=res[i].email+",";
  //           }
  //           emails_str+=res[res.length-1].email;
  //           console.log(emails_str);
  //           var msg = {
  //             from: "jaykay.sbp@gmail.com",
  //             from_name: 'University',
  //             to: emails_str,
  //             subject: 'Class scheduled',
  //             body_text: "Hey, "+subject+" class is scheduled at "+input_start_date+" for "+duration+" minutes", 
  //           };
             
  //           client.mailer.send(msg, function(er, res) {
  //             if (er) {
  //               return console.error(er);
  //             }
             
  //             console.log(res);
  //           });
  //             }
              
  //         });
  //         });
            
  //           //res.sendFile('scheduled.html',{root:__dirname});
            
            
  //           console.log(res);
            

            
            
  //       }
  //       else{
  //           res.render('not_scheduled');
  //       }
  //       if (err) throw err;
  //     });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
