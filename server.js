const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const{auth, requiresAuth}= require('express-openid-connect');
var bodyParser= require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
require('dotenv').config();

// app.use(
//     auth(
//         {
//             issuerBaseURL: "https://dev-kh2d5kc6.us.auth0.com",
//             baseURL: "https://testapppragati.azurewebsites.net",
//             clientID: "gSKXUG162ce0u8coWBiQIJrz5kJW2fCD",
//             secret: "db986688af1cb4d29871b4e93673e29821657eb8f0a2183b670ff58313e8e091",
//             authRequired: false,
//             auth0Logout: true,
//         }
//     )
// );
// let token="";
//var AuthenticationClient = require('auth0').AuthenticationClient;

// var auth0 = new AuthenticationClient({
//     domain: 'dev-kh2d5kc6.us.auth0.com',
//     clientId: 'FU04qrUSSoWOH6NAYBO49vrcuYagYsoY',
//     clientSecret: '3MszsueN33eG7OgBhLMStfPORgbUHIC-p9TrI5yXTR2B6KrseC7pmWQGxVhvA13g'
//   });

app.get('/',(req, res) => {
    //res.send(req.oidc.isAuthenticated()?'Logged in':'Logged out');
    //res.redirect('/login')
    res.send("meow again");
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
