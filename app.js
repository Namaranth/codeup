const express = require('express');
const cookieParser = require('cookie-parser');
const nunjucks = require('nunjucks');
const morgan = require('morgan');
const passport = require("passport");
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const hpp = require('hpp');
const helmet = require('helmet');

dotenv.config();

const indexRouter = require('./routes/index');
const codeRouter = require('./routes/code');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const { sequelize } = require('./models');
const passportConfig = require('./passport');




const app = express();

passportConfig(); // 패스포트 설정
app.set('port', process.env.PORT || 80);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

sequelize.sync({ force : false })
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    })
   
if(process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  app.use(morgan('combined'));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(hpp());
}else {
  app.use(morgan('dev'));
}


app.use(express.static(__dirname + '/public'));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
};
if(process.env.NODE_ENV === 'production') {
  sessionOption.proxy = true;
}
app.use(session(sessionOption))
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/code', codeRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);


app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });
 
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

const server = app.listen(app.get('port'), () => {
  console.log(app.get('port'),"번 포트에서 대기중입니다.");
});

