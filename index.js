const express = require("express");
// import { type } from "os";
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
// import cookie_parser from 'cookie-parser'
// import cookieParser from "cookie-parser";
const passport = require("passport")
const initPass = require('./passport-config')
// const jwt = require('jsonwebtoken')
const session = require('express-session')
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

app.post("/api/user/register", async (req , res ) => {
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
        .then(hash => {
            console.log('Hash: ', hash)
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
        if(saved[i].username === username) return saved[i]
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

app.get("/api/secret", (req, res) => {
    if(req.isAuthenticated()) {
        // console.log(session)
        res.status(200).send("ok")
    } else {
        res.status(401)
    }
})

function checkAuth(req, res, next) {
    if(req.isAuthenticated()) {
        res.status(200).send("ok")
    } else {
        res.status(401)
    }
}

app.post("/api/user/login", passport.authenticate('local', {
    successRedirect: "/api/secret"
    }),
    function (req, res){
        if(req.isAuthenticated()) {
            // console.log(session)
            res.status(200).send("ok")
        } else {
            res.status(401)
        }
        const sessionCookie = req.session.cookie;
        res.setHeader('set-cookie', [sessionCookie])
    })
// app.post("/api/user/login", (req, res) => {
//     const {username, password} = req.body;
//     if(checkUsername(username)) {
//         let user = findUser(username);
//         if(user != null) {
//             bcrypt.compare(password, user.password, (err, isMatch) => {
//                 if(err) throw err
//                 if(isMatch) {
//                     let jwtToken = {
//                         id: user?.id,
//                         username: user?.username,
//                         password: user?.password
//                     }
//                     jwt.sign(
//                         jwtToken,
//                         "gdshual",
//                         {
//                             expiresIn: 120
//                         },
//                         (err, token) => {
//                             res.status(200).send("ok", token)
//                         }
//                     );
//                 } else {
//                     res.status(401).send()
//                 }
//             })
//         }   
//     }
// })

app.listen(port, () => {
    console.log("Server listen!")
})