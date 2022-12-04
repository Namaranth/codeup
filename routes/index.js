const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const bcrypt = require('bcrypt');
var Sequelize = require("sequelize");
const crypto = require("crypto");
const { Post, User, Comment, Recommend } = require('../models');
const nodemailer = require('nodemailer');



const router = express.Router();
router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
// GET / 라우터
router.get('/', (req, res) => {
    res.render('Main', {title: '메인'});
});

router.get('/login', isNotLoggedIn, (req, res) => {
    res.render('Login', {title: '로그인'});
})

router.get('/register', isNotLoggedIn, (req, res) => {
  res.render('mail', {title: '회원가입'});
});

router.post('/mail', async function (req, res) {
try {
  let user_email = req.body.email;     //받아온 email user_email에 초기화
  if(user_email[0] == null) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.write("<script>alert('이메일을 입력해주세요.')</script>");
    res.write("<script>window.location=\"../register\"</script>");
  }else {
    const exUser = await User.findOne({ where: { email: user_email } });
    if (exUser) {
        return res.redirect('/register?error=exist');
      }

    console.log(user_email);

    const code = crypto.randomBytes(3).toString('hex');
    const hash = await bcrypt.hash(code, 12);
      console.log(code);


    // 메일발송 함수

    const transporter = nodemailer.createTransport({
      service: "Naver",
      auth: {
          user: "wasdwxasd@naver.com",
          pass: "825462@lsh"
      },
      tls: {
          rejectUnauthorized: false
      }
    });


    let info = await transporter.sendMail({   
        from: 'wasdwxasd@naver.com',             //보내는 주소 입력
        to: user_email,                        //위에서 선언해준 받는사람 이메일
        subject: '안녕하세요 CODEUP입니다. 이메일 인증을 해주세요.',                  //메일 제목
        text: code,                      //내용
      });
      console.log("보내는거" + code);
      res.render('Certfication', {
        title: '이메일 인증',
        code:hash,
        mail:user_email,
        }
        );
    }
  }catch(error) {
    console.error(error);
    next(error);
  }
});

router.post('/certification', async (req, res, next) => {
var code = req.body.code;
var certification = req.body.certfication;
var compare = await bcrypt.compare(certification, code);
var mail = req.body.mail;
const error = "인증번호를 다시 확인해주세요.";

if(compare){
res.render('Signup',{
  title: '회원정보입력',
  userMail:mail,
})
}else{
  res.render('Certfication', {
    title: '로그인',
    code: code,
    mail: mail,
    error: error,
    });
}
});

//비밀번호 변경

router.get('/password', isNotLoggedIn, (req, res) => {
  res.render('password', {title: '비밀번호찾기'});
});

router.post('/password/mail', async function (req, res) {

let user_email = req.body.email;     //받아온 email user_email에 초기화

const exUser = await User.findOne({ where: { email: user_email } });
if (exUser) {
  console.log(user_email);

  const code = crypto.randomBytes(3).toString('hex');
  const hash = await bcrypt.hash(code, 12);
    console.log(code);
  
  
  // 메일발송 함수
  
  const transporter = nodemailer.createTransport({
    service: "Naver",
    auth: {
        user: "wasdwxasd@naver.com",
        pass: "825462@lsh"
    },
    tls: {
        rejectUnauthorized: false
    }
  });
  
  
  let info = await transporter.sendMail({   
      from: 'wasdwxasd@naver.com',             //보내는 주소 입력
      to: user_email,                        //위에서 선언해준 받는사람 이메일
      subject: '안녕하세요',                  //메일 제목
      text: code,                      //내용
    });
    console.log("보내는거" + code);
    res.render('passwordCertify', {
      title: '이메일 인증',
      code:hash,
      mail:user_email,
      }
      );
  }



});

//비밀번호 변경: 메일 코드 인증 

router.post('/password/certify', async (req, res, next) => {
var code = req.body.code;
var certification = req.body.certification;
var compare = await bcrypt.compare(certification, code);
var mail = req.body.mail;

if(compare){
res.render('PasswordEdit',{
  title: '회원정보입력',
  userMail:mail,
})
}else{
res.render('passwordCertify', {
  title: '로그인',
  code:code,
  mail:mail,
  });
}
});

// 비밀번호 변경
router.post('/password/edit', async (req, res, next) => {
  try {
    const pass = req.body.password;
    const repass = req.body.repassword;
    const email = req.body.mail;

    const hash = await bcrypt.hash(pass, 12);

    const Null = "입력하지 않은 칸이 있는지 확인해주세요.";
    const Check = "비밀번호가 틀립니다.";

    if(pass[0] == null) {
      res.render("passwordEdit", {
        userMail:email,
        Null: Null
      });
    } else if(pass.length < 8) {
      res.render("passwordEdit", {
        userMail:email,
      });
    } else if(pass != repass) {
      res.render("passwordEdit", {
        userMail:email,
        check: Check,
      });
    } else {
      const password = await User.update({
        password: hash,
      },
      {where:{email: req.body.mail}});
  
      res.redirect('/Login');
    }
    
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/mypage', isLoggedIn, async (req, res) => {
    try{
      const posts = await Post.count({
        where: {UserId: req.user.id}
      });
      res.render('info', { 
        title: '마이페이지',
        userPost: posts,
      });
    }catch (err) {
      console.error(err);
      next(err)
    }
    
})

//내정보 비밀번호 확인
router.get('/info/password',isLoggedIn, (req, res) => {
  res.render('InfoPassword', {title: '비밀번호 확인'});
});

//내정보 변경
router.post('/info/edit',isLoggedIn,async(req,res)=>{
  const InputPw = req.body.code;
  const pass = req.user.password;
  const user_nick =req.user.nick;
  console.log(user_nick);
  var compare = await bcrypt.compare( InputPw, pass );
  if(compare){
    res.render('InfoEdit', {
      title: '내정보 변경',
      nickname:user_nick,
  })
}
});

//변경된 내정보 업데이트
router.post('/info/update',isLoggedIn,async(req,res)=>{
  const id =req.user.id;
  const inputNick = req.body.nick;
  const user_nick = req.user.nick;
  const password = req.body.password;
  const passwordCheck = req.body.passwordcheck;
  const Error = "중복된 닉네임입니다.";
  const Check = "비밀번호가 틀립니다.";
  const PWlength="비밀번호는 8글자 이상입니다.";
  const Null="수정할 데이터가 없습니다.";
  const exNick = await User.findOne({
    where: { nick:inputNick }
  })

  if(inputNick == user_nick || inputNick == null){ // 닉네임 수정이 필요하지않다.
    console.log(inputNick);
    if(password == "" && passwordCheck == ""){//비밀번호 수정이 필요없다.
      res.render("InfoEdit", {
        nickname: user_nick,
        error: Null,
      });
    }else if(password!=passwordCheck){//비밀번호가 다르다
      res.render("InfoEdit", {
        nickname: user_nick,
        error: Check,
      });
    }else if(password.length<8){//비밀번호가 짧다
      res.render("InfoEdit", {
        nickname: user_nick,
        error: PWlength,
      });
    }else{
      const hash = await bcrypt.hash(password, 12);
      const passwordEdit = await User.update({// 비밀번호변경
        password:hash
      },{where:{id}})
      res.redirect('/mypage')
    }
  }else{// 닉네임 수정이 필요하다
    if(exNick) { // 이미존재하는 닉네임
    res.render("InfoEdit", {
      nickname: user_nick,
      error: Error
    });
}else if(password == "" && passwordCheck == ""){//비밀번호 변경할 필요가없다
    const nickEdit = await User.update({//닉네임변경
      nick: inputNick
    },{where:{id}})
    res.redirect('/mypage')
  }else if(password != passwordCheck){//비밀번호가 다르다
    res.render("InfoEdit", {
      nickname: inputNick,
      error: Check,
    });
  }else if(password.length < 8){// 비밀번호가 너무짧다
    res.render("InfoEdit", {
      nickname: inputNick,
      error: PWlength,
    });
  }else{
    const hash = await bcrypt.hash(password, 12);
    const infoEdit = await User.update({//닉네임과 비밀번호 업데이트
      nick: inputNick,
      password: hash
    },{where:{ id }})
    res.redirect('/mypage')
  }} 
});

router.get('/mypage/community/:idx', isLoggedIn, async (req, res) => {

  try {      
    var page = Math.max(1, parseInt(req.query.page));
    var limit = Math.max(1, parseInt(req.query.limit));

    page = !isNaN(page)?page:1;
    limit = !isNaN(limit)?limit:10;

      const posts = await Post.findAll({
        where: {UserId : req.user.id},
        include: {
          model: User,
          attributes: ['id', 'nick'],
        },
        order: [['createdAt', 'DESC']],
        offset: (page-1)*10, limit: 10
      });

     const countPosts = await Post.count({
     });
     var skip = (page-1)*limit;
     var maxPage = Math.ceil(countPosts/limit);

     var max = [];
     max.length = maxPage;

     for(i = 0; i < maxPage; i++) {
      max[i] = i+1;
     }

      res.render('MyPageCommunity', {
        title: '내가 쓴 글',
        twits: posts,
        count: countPosts,
        currentPage: page,
        maxPage: max,
        limit: limit
      });
      
    } catch (err) {
      console.error(err);
      next(err);
    }
  
})


router.get('/community', async (req, res, next) => {
    try {      
      var page = Math.max(1, parseInt(req.query.page));
      var limit = Math.max(1, parseInt(req.query.limit));

      page = !isNaN(page)?page:1;
      limit = !isNaN(limit)?limit:10;

        const posts = await Post.findAll({
          include: {
            model: User,
            attributes: ['id', 'nick'],
          },
          order: [['createdAt', 'DESC']],
          offset: (page-1)*10, limit: 10
        });

       const countPosts = await Post.count({
       });
       var skip = (page-1)*limit;
       var maxPage = Math.ceil(countPosts/limit);

       var max = [];
       max.length = maxPage;

       for(i = 0; i < maxPage; i++) {
        max[i] = i+1;
       }
       
       

        res.render('Community', {
          title: '커뮤니티',
          twits: posts,
          count: countPosts,
          currentPage: page,
          maxPage: max,
          limit: limit
        });
        
      } catch (err) {
        console.error(err);
        next(err);
      }
});


router.get('/bestcommunity', async (req, res, next) => {
  const Op = Sequelize.Op;
  try {
      const posts = await Post.findAll({
        include: {
          model: User,
          attributes: ['id', 'nick'],
        },
        where : {Recommend: {[Op.gte]:20}},
        order: [['createdAt', 'DESC']],
      });
     
      res.render('Community', {
        title: '커뮤니티',
        twits: posts,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
});

  router.get('/write',isLoggedIn, async (req, res, next) => {
    try {
      const posts = await Post.findAll({
        include: {
          model: User,
          attributes: ['id', 'nick'],
        },
        order: [['createdAt', 'DESC']],
      });
      res.render('write', {
        title: '글쓰기',
        twits: posts,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }

  });  

  router.get('/community/search/', async (req, res, next) => {
    var query = req.query.word;
    const Op = Sequelize.Op;
    console.log(query);
    try {
        const content = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'nick'],
            },
            order: [['createdAt', 'DESC']],
            where : {
                  title: {
                    [Op.like]: "%"+query+"%"
                  }   
            },
         });
         const count = await Post.count({});
         res.render('Community', {
            title: '커뮤니티',
            twits: content,
            count: count,
         });
    }catch(error) {
        console.error(error);
        return next(error);
    }
  });

  router.post('/community/edit/:idx', isLoggedIn, async (req, res, next) => {
    var id = req.params.idx;
  try {
      const content = await Post.findOne({
          include: {
              model: User,
              attributes: ['id', 'nick'],
          },
          where : {id},
       });

       res.render('edit', {
          title: '커뮤니티',
          read: content,
       });
  }catch(error) {
      console.error(error);
      return next(error);
  }
  });


router.get('/community/post', isLoggedIn, async (req, res, next) => {
  // community/다음의 값을 idx로 가져옴
  var id = req.query.postId;
  try {
      const content = await Post.findOne({
          include: {
              model: User,
              attributes: ['id', 'nick'],
          },
          where : {id},
       });


       const recommend = await Recommend.findOne({
        where : {PostId : id, UserId : req.user.id},
     });

       const comments = await Comment.findAll({
        include: {
          model: User,
          attributes: ['id', 'nick'],
        },
        order: [['createdAt', 'DESC']],
        where: { PostId : id }
      });

       res.render('content', {
          title: '커뮤니티',
          read: content,
          twits: comments,
          good: recommend,
       });
  }catch(error) {
      console.error(error);
      return next(error);
  }
});




router.post('/community/delete/:idx', isLoggedIn, async (req, res, next) => {
  var id = req.params.idx;
  try {
    console.log(req.user);
    await Post.destroy({
      where : { id },
    });
    res.redirect('/community');
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;