const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password, checkpassword } = req.body;

  try {
    const exNick = await User.findOne({
      where: { nick }
    })
    const Error = "중복된 닉네임입니다.";
    const Null = "입력하지 않은 칸이 있는지 확인해주세요.";
    const Check = "비밀번호가 틀립니다.";
    
    if(exNick) {
      res.render("Signup", {
        userMail:email,
        error: Error
      });
    }else if (nick[0] == null || password[0] == null) {
      res.render("Signup", {
        userMail:email,
        Null: Null
      });
    }else if(password != checkpassword){
      res.render("Signup", {
        userMail:email,
        check: Check
      });
    }else if(password.length < 8) {
      res.render("Signup", {
        userMail:email,
      });
    }else {
      const hash = await bcrypt.hash(password, 12);
      await User.create({
        email,
        nick,
        password: hash,
      });
      return res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/login?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); 
});

router.get('/logout', isLoggedIn, (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});


module.exports = router;
