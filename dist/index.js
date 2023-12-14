"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const os_1 = require("os");
const body_parser_1 = __importDefault(require("body-parser"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// import cookie_parser from 'cookie-parser'
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const initPass = require('./passport-config');
const jwt = require('jsonwebtoken');
const session = require('express-session');
function getUserByName(username) {
    for (let i = 0; i < saved.length; i++) {
        if (saved[i].username === username)
            return saved[i];
    }
    return null;
}
function getUserById(id) {
    for (let i = 0; i < saved.length; i++) {
        if (saved[i].id === id)
            return saved[i];
    }
    return null;
}
initPass(passport_1.default, getUserByName, getUserById);
const app = (0, express_1.default)();
const port = 3000;
class User {
    constructor(id, username, password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }
}
let saved = [];
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(session({
    secret: "AAAABBDCDAF",
    resave: false,
    saveUninitialized: false
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.post("/api/user/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    console.log(req.body);
    if (!checkUsername(username)) {
        let new_pass;
        yield bcryptjs_1.default
            .genSalt(10)
            .then(salt => {
            console.log('Salt: ', salt);
            bcryptjs_1.default.hash(password, salt)
                .then((result) => {
                new_pass = result;
                let user = new User(Date.now().toString(), username, new_pass);
                saved.push(user);
                res.send(user);
            });
        })
            .then(hash => {
            console.log('Hash: ', hash);
        })
            .catch(err => console.error(err.message));
    }
    else
        res.status(400).send();
}));
function checkUsername(username) {
    for (let i = 0; i < saved.length; i++) {
        if (saved[i].username === username)
            return true;
    }
    return false;
}
function findUser(username) {
    for (let i = 0; i < saved.length; i++) {
        if (saved[i].username === username)
            return saved[i];
    }
    return null;
}
app.get("/api/user/list", (req, res) => {
    res.send(saved);
});
// app.post("/api/user/login", (req, res) => {
//     passport.authenticate('local', {
//         success: res.status(200),
//         failureMessage: res.status(401)
//     })
// })
app.get("/api/secret", checkAuth, (req, res) => {
});
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.status(200).send("ok");
    }
    else {
        res.status(401);
    }
}
app.post("/api/user/login", passport_1.default.authenticate('local', {
    successRedirect: "/api/secret"
}));
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
    console.log("Server listen!");
});
