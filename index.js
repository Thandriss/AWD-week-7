const express = require("express");
// import { type } from "os";
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
// import cookie_parser from 'cookie-parser'
// import cookieParser from "cookie-parser";
const passport = require("passport")
const initPass = require('./passport-config')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const checkAuth = require('./checkAuth.js')
// const verify = promisify(jwt.verify);

function getUserByName(username)  {
    for (let i=0; i< saved.length; i++) {
        if(saved[i].username === username) return saved[i]
    }
    return null
}

function getUserById(id)  {
    for (let i=0; i< saved.length; i++) {
        if(saved[i].id === id) return saved[i]
    }
    return null
}

initPass(passport, getUserByName, getUserById)

const app  = express()
const port  = 3000
class User {
    id;
    username;
    password;
    constructor(id , username, password ){
        this.id= id;
        this.username= username;
        this.password= password;
      }
}
let saved = [];
app.use(bodyParser.json()) ;
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(session({
    secret: "AAAABBDCDAF",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
let currectUser = 0;

let savedToDo = []

app.post("/api/user/register", isNotAuth, async (req , res ) => {
        const {username, password} = req.body;
        console.log(req.body)
        if (!checkUsername(username)) {
            let new_pass 
            await bcrypt
            .genSalt(10)
            .then(salt => {
                console.log('Salt: ', salt)
                bcrypt.hash(password, salt)
                .then((result) => {
                    new_pass = result
                    let user = new User(Date.now().toString(), username, new_pass);
                    saved.push(user)
                    res.send(user)
                })
            })
            .catch(err => console.error(err.message))
        }
        else res.status(400).send()
})
function checkUsername(username) {
    for (let i=0; i< saved.length; i++) {
        if(saved[i].username === username) return true
    }
    return false
}

function findUser(username) {
    for (let i=0; i< saved.length; i++) {
        if(saved[i].username === username) {
            return saved[i] 
        }
    }
    return null
}

app.get("/api/user/list", (req, res) =>{
    res.send(saved)
})

// app.post("/api/user/login", (req, res) => {
//     passport.authenticate('local', {
//         success: res.status(200),
//         failureMessage: res.status(401)
//     })
// })

app.get("/api/secret", checkAuth, (req, res) => {
    res.status(200).send()
})

function isAuth(req, res, next) {
    const token = req.headers["cookie"];
    console.log(token)
    if (token) next();
    res.status(401).send()
}

function isNotAuth(req, res, next) {
    if (req.headers["cookie"]) return res.redirect("/")
    next();
}

app.get("/", (req, res) => {
    res.send("redirected")
})

function findToDo(currectUser) {
    console.log("findToDo")
    console.log(currectUser)
    for (let i= 0; i < savedToDo.length; i++) {
        if (savedToDo[i].id == currectUser) {
            console.log(savedToDo[i].id)
            console.log(currectUser)
            console.log("end")
            return true
        }
    }
    return false
}

app.post("/api/todos", isAuth, (req, res) => {
    const {todo} = req.body;
    console.log(todo)
    console.log(" in todos")
    console.log(currectUser)
    if(findToDo(currectUser) || savedToDo.length != 0) {
        let ind = 0;
        for (let i= 0; i < savedToDo.length; i++) {
            if (savedToDo[i].id == currectUser) {
                ind = i;
                let ar = savedToDo[i].todos
                ar.push(todo)
                console.log(ar)
                savedToDo[i] = {id: currectUser, todos: ar}
            }
        }
        console.log(savedToDo)
        res.send(savedToDo[ind])
    } else {
        let ar = []
        ar.push(todo)
        savedToDo.push({id: currectUser, todos: ar})
        console.log(savedToDo)
        res.send({id: currectUser, todos: ar})
    }
})

app.get("/api/todos/list", (req, res) => {
    res.send(savedToDo)
})

app.post("/api/user/login", isNotAuth, async (req, res) => {
    const {username, password} = req.body;
        console.log("here")
        if(checkUsername(username)) {
            let user = findUser(username);
            if(user != null) {
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) throw err
                    if(isMatch) {
                        console.log("here")
                        currectUser = user?.id;
                        let jwtToken = {
                            id: user?.id,
                            username: user?.username
                        }
                        console.log(jwtToken)
                        jwt.sign(
                            jwtToken,
                            "AAABBBADA",
                            (err, token) => {
                                res.cookie('connect.sid', token)
                                passport.authenticate('local')
                                res.status(200).send("ok")
                            }
                        );
                    } else {
                        res.status(401).send()
                    }
                })
            }   
        }
})

app.listen(port, () => {
    console.log("Server listen!")
})