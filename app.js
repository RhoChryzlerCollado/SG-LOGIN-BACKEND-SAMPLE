const express = require("express");
const path = require ("path")
const mysql = require("mysql2")

const PORT = process.env.PORT || 3000;

const app = express();
const session = require('express-session');


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.static('./view'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const pool = mysql.createPool({
    connectionLimit: 10,
	host     : 'localhost',
	user     : 'root',
	database : 'streetwisegraphics'
});

pool.getConnection(function(err, connection) {
    console.log("connected");
    connection.release();
});
//Registration
app.post("/create-user", (req,res) => {
    const user_Email = req.body.user_Email
    const user_Password = req.body.user_Password
    const first_Name = req.body.first_Name
    const last_Name =req.body.last_Name


    const queryString = "INSERT INTO user (user_Email, user_Password, First_Name, Last_Name) VALUES (?,?,?,?)"
        
    pool.query(queryString, [user_Email, user_Password, first_Name, last_Name],(err, results, fields)=>{
        if (!err){
            console.log("Registered User");
			return res.redirect('/login.html');
        }else
		res.send("User already exists")
       
    })
});    
//login user
app.post('/login', function(request, response) {
	let email = request.body.email;
	let password = request.body.password;
	
	if (email && password) {
		
		pool.query('SELECT * FROM user WHERE user_Email = ? AND user_Password = ?', [email, password], function(error, results, fields) {
			
			if (error){
                console.log("User not found")};
			
			if (results.length > 0) {
				
				request.session.loggedin = true;
				request.session.email = email;
				
				response.redirect('/homepage.html');
			} else {
				response.send('Incorrect Email and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Email and Password!');
		response.end();
	}
});


app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './view', 'homepage.html'));
  });

app.listen(PORT, () =>{
    console.log("Listening to port " + PORT);
});
