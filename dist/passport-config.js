"use strict";
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
const LocalStrategy = require('passport-local').Strategy;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function init(passport, getUserByName, getUserById) {
    const authenticateUser = (username, password, done) => __awaiter(this, void 0, void 0, function* () {
        const user = getUserByName(username);
        if (user == null) {
            return done(null, false);
        }
        try {
            if (yield bcryptjs_1.default.compare(password, user.password)) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        }
        catch (e) {
            return done(e);
        }
    });
    passport.use(new LocalStrategy(authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    });
}
module.exports = init;
