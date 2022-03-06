const mysql = require('mysql')
const credentials = require('./credentials.js')
const express = require('express')
const app = express();
const bcrypt = require('bcrypt')
const session = require('express-session');

const connection = mysql.createConnection({
    host: "localhost",
    user: credentials.username,
    password: credentials.password,
    database: "Messenger"
})

app.set('view engine', 'ejs');
app.set('views', 'views'); /// folder from where express picks these templates

app.use(express.urlencoded({extended:true})) /// decoding data from HTTP request
app.use(session({secret:'aezakmi'}))
app.use(express.static('./public'))

const requireLogin = (req, res, next) => {
    if(!req.session.username){
        return res.redirect('/login')
    }
    next()
}

const ifloggedin = (req, res, next) => {
    if(req.session.username){
        return res.redirect('/home')
    }
    next()
}

app.post('/login', async(req,res ) =>{
    const username = req.body.username
    const password = req.body.password
    var sql = `SELECT * FROM users WHERE name = '${username}'`
    var present = 0
    var match = 0
    connection.query(sql,  (err, result)  => {
        for(let rows of result){
            present = 1
            if(rows.password == password ){
                match = 1
            }
        }
        if( (present == 0) || (match == 0) ){

            return res.render('login.ejs', {message:"Invalid Username/Password " } )
        }
        req.session.username = username ;
        return res.render('home.ejs', {username} )
    })
})

app.post('/register', async(req,res ) =>{
    const username = req.body.username
    const password = req.body.password
    var sql = `SELECT * FROM users WHERE name = '${username}'`
    let present = 0
    connection.query(sql, (err, result)  => {
        for(let rows of result){
            present = 1
        }
        if(present == 1 || (username == "") ){
            return res.render('register.ejs', {message:"Username not avialable."})
        }
        sql = `INSERT INTO users (name , password) values ( '${username}' , '${password}' )`
        connection.query(sql, (err, result)  => {} )
        return res.render('login.ejs', {message:"Registration Successful."} )
    })
})
app.get('/login',ifloggedin , (req,res) =>{
    return res.render("login.ejs" )
} )
app.get('/register', ifloggedin, (req,res) =>{
    return res.render("register.ejs")
} )
app.get('/home', requireLogin,  (req,res) =>{
    return res.render("home.ejs")
} )

app.listen(3000, () =>{
    console.log("Server-Running on Port 3000 !!" )
})