const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const { auth, requiresAuth } = require("express-openid-connect");
let bodyParser = require("body-parser");
let urlencodedParser = bodyParser.urlencoded({ extended: false });
require("dotenv").config();
let moment = require("moment"); //used for formatting time and date
app.engine("pug", require("pug").__express);
app.set("view engine", "pug");
let LocalStorage = require("node-localstorage").LocalStorage, //used for storing user id
  localStorage = new LocalStorage("./scratch");
let session = require("express-session");
const mysql = require("mysql");

//used for sending email to student of given year and department
let elasticemail = require("elasticemail");
let client = elasticemail.createClient({
  username: "jaykay",
  apiKey:
    "6608A6A955AAE805C390C1A738C0D0DF964FD242D1B38136E6CC8F7FD1EC212F39E8E439D880A4DB70FC833B040AB324",
});
let sess = {
  secret: "db986688af1cb4d29871b4e93673e29821657eb8f0a2183b670ff58313e8e091",
  cookie: {},
  resave: false,
  saveUninitialized: true,
};
//Used to mitigate the "checks.state argument" error in production
if (app.get("env") === "production") {
  // Use secure cookies in production (requires SSL/TLS)
  console.log("Production");
  sess.cookie.secure = false;

  // Uncomment the line below if your application is behind a proxy (like on Heroku)
  // or if you're encountering the error message:
  // "Unable to verify authorization request state"
  app.set("trust proxy", 1);
}

app.use(session(sess));

//Used to connect to the azure mysql database
let config = {
  host: "uni-pragati.mysql.database.azure.com",
  user: "pragati",
  password: "password123..",
  database: "testDB",
  port: 3306,
  ssl: true,
};
// Attempt to connect and execute queries if connection goes through
const con = new mysql.createConnection(config);
con.connect(function (err) {
  if (err) {
    console.log("!!! Cannot connect !!! Error:");
    throw err;
  } else {
    console.log("Connection established.");
  }
});
app.use(express.static(__dirname + "/public"));

//Used for auth0 authentication
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

//Token used to extract role from auth0
let token = "";
let AuthenticationClient = require("auth0").AuthenticationClient;

let auth0 = new AuthenticationClient({
  domain: "dev-kh2d5kc6.us.auth0.com",
  clientId: "FU04qrUSSoWOH6NAYBO49vrcuYagYsoY",
  clientSecret:
    "3MszsueN33eG7OgBhLMStfPORgbUHIC-p9TrI5yXTR2B6KrseC7pmWQGxVhvA13g",
  nonce: "lmasl66sa",
});
let role = "";
app.get("/", requiresAuth(), (req, res) => {
  if (req.oidc.isAuthenticated()) {
    //userId stored in localStorage cleared and set again
    localStorage.clear();
    user_email = req.oidc.user.email;
    user_id = req.oidc.user.sub;
    console.log(user_id);
    localStorage.setItem("user_id", user_id);
    //Axios used to send a POST request with a bearer token to get the role
    let axios = require("axios").default;
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
        let opt = {
          method: "POST",
          url: `http://dev-kh2d5kc6.us.auth0.com/api/v2/users/${user_id}/roles`,
          headers: { authorization: `Bearer ${token}` },
        };
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
            //console.error(error);
            console.log("Error in axios request");
          });
      }
    );
  } else {
    return res.redirect("/login");
  }
});
//Get request made when a teacher wants to know the class they scheduled
app.get("/scheduled_classes", requiresAuth(), (req, res) => {
  let get_classes =
    "select year,name, subject, startDate,endDate from classes join departments on classes.dept_id=departments.dept_id where teacher_id='" +
    localStorage.user_id +
    "' and startDate>CONCAT(CURDATE(),' 00:00:00') order by startDate;";
  console.log(get_classes);
  con.query(get_classes, function (err, result) {
    console.log(result);
    res.render("scheduled_classes", {
      classes: result,
    });
  });
});
//get request to show the form for scheduling classes
app.get("/teacher", requiresAuth(), (req, res) => {
  res.sendFile("teacher.html", { root: __dirname });
});
//Post request made when form in submitted for scheduling a class
app.post("/schedule-class", urlencodedParser, function (req, res) {
  let dtl = req.body.dtl;
  let duration = req.body.duration;
  let subject = req.body.subject;
  console.log(dtl);
  let year = req.body.year;
  let dept = req.body.dept;
  //Input start date and time are formatted using MomentJS to store them in MySQL database datetime format
  let input_start_date = dtl.slice(0, 16).replace("T", " ");
  console.log(input_start_date);
  let y = moment(input_start_date)
    .add(duration, "m")
    .format("yyyy-MM-DD HH:mm");
  let input_end_date = y.slice(0, 16).replace("T", " ");
  console.log(input_end_date);
  //Name of teacher is found from the logged in userId so that we can store who scheduled the class
  let q_get_name_of_teacher =
    "select name from teacher where teacher_id='" + localStorage.user_id + "';";
  let name = "";
  console.log(q_get_name_of_teacher);

  con.query(q_get_name_of_teacher, function (err, result) {
    console.log(result);
    name = result[0].name;
  });

  //Query written to find if there is any overlap between input time and date of class and classes already scheduled
  let q =
    "select count(startDate) as overlap from classes join departments on classes.dept_id=departments.dept_id where year='" +
    year +
    "' and name='" +
    dept +
    "' and startDate between '" +
    input_start_date +
    "' and '" +
    input_end_date +
    "' or endDate between '" +
    input_start_date +
    "' and '" +
    input_end_date +
    "' or startDate<'" +
    input_start_date +
    "' and endDate>'" +
    input_end_date +
    "' or startDate>'" +
    input_start_date +
    "' and endDate<'" +
    input_end_date +
    "';";
  console.log(q);
  con.query(q, function (err, result) {
    if (result[0].overlap == 0) {
      let dept_id;
      //dept_id found from dept name so that dept_id can be further inserted into classes database
      con.query(
        "select dept_id from departments where name='" + dept + "';",
        function (err, result) {
          dept_id = result[0].dept_id;
          let aq =
            "insert into classes values('" +
            localStorage.user_id +
            "','" +
            year +
            "','" +
            dept_id +
            "','" +
            subject +
            "','" +
            input_start_date +
            "','" +
            input_end_date +
            "');";
          console.log(aq);
          con.query(aq, function (er, res) {
            console.log(res);
            if (err) throw err;
          });
          //email id of students from given department and year found so that mails can be sent
          let get_emails_query =
            "select email from students where dept_id='" +
            dept_id +
            "' and year='" +
            year +
            "';";
          if (year == 1) {
            year = "1st";
          } else if (year == 2) {
            year = "2nd";
          } else if (year == 3) {
            year = "3rd";
          } else {
            year = "4th";
          }
          res.render("sc", {
            dept: dept,
            year: year,
            time: input_start_date,
          });
          con.query(get_emails_query, function (er, res) {
            //console.log(res);
            if (err) throw err;
            if (res.length > 0) {
              let emails = [];
              let emails_str = "";
              //email ids of all students concatenated as comma separated strings
              for (let i = 0; i < res.length; i++) {
                emails.push(res[i].email);
              }
              for (let i = 0; i < res.length - 1; i++) {
                emails_str += res[i].email + ",";
              }
              emails_str += res[res.length - 1].email;
              console.log(emails_str);
              let msg = {
                from: "jaykay.sbp@gmail.com",
                from_name: "University",
                to: emails_str,
                subject: "Class scheduled",
                body_text:
                  "Hey, " +
                  subject +
                  " class is scheduled at " +
                  input_start_date +
                  " for " +
                  duration +
                  " minutes",
              };

              client.mailer.send(msg, function (er, res) {
                if (er) {
                  return console.error(er);
                }

                console.log(res);
              });
            }
          });
        }
      );

      //res.sendFile('scheduled.html',{root:__dirname});

      console.log(res);
    } else {
      //If class cannot be scheduled because of overlap then this is rendered
      res.render("not_scheduled");
    }
    if (err) throw err;
  });
});

//Used in the student interface to show the classes scheduled for logged in student
app.get("/classes_stud", requiresAuth(), (req, res) => {
  let q =
    "select dept_id, year from students where student_id='" +
    localStorage.user_id +
    "';";
  con.query(q, function (err, result) {
    console.log(result);
    let dept_id = result[0].dept_id;
    let year = result[0].year;
    let query =
      "select name, subject, startDate, endDate from teacher join classes on teacher.teacher_id=classes.teacher_id where dept_id='" +
      dept_id +
      "' and year='" +
      year +
      "' and startDate>CONCAT(CURDATE(),' 00:00:00') order by startDate;";
    console.log(query);
    con.query(query, function (err, rese) {
      res.render("classes_student", {
        classes: rese,
      });
    });
  });
});
//Used to show the form for inputting year and department and showing the classes scheduled for the same
app.get("/classes", requiresAuth(), (req, res) => {
  res.sendFile("classes.html", { root: __dirname });
});

//POST request when submitting form for showing classes scheduled for input department and year
app.post("/show-classes", urlencodedParser, function (req, res) {
  let dept = req.body.dept;
  let year = req.body.year;
  let dept_id;
  console.log("show-classes");
  con.query(
    "select dept_id from departments where name='" + dept + "';",
    function (err, result) {
      dept_id = result[0].dept_id;
      console.log(dept_id);
      let get_classes =
        "select name,subject, startDate,endDate from classes join teacher on teacher.teacher_id=classes.teacher_id where year='" +
        year +
        "' and dept_id='" +
        dept_id +
        "' and startDate>CONCAT(CURDATE(),' 00:00:00') order by startDate;";
      console.log(get_classes);
      con.query(get_classes, function (err, result) {
        console.log(result);
        res.render("classes", {
          classes: result,
        });
      });

      //console.log(dept);
    }
  );
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
