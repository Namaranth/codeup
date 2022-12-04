const express = require('express');
const fs = require('fs');
var Sequelize = require("sequelize");
const router = express.Router();
const bodyParser = require('body-parser');
const spawn = require('child_process').spawn;
const dayjs = require("dayjs");

const multer = require('multer');
const { Code, User, Codesend, sequelize, Favorite } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { get } = require('http');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.get('/', (req, res) => {
    res.redirect('/code/CompileC');
});

router.get('/CompileC', async (req, res, next) => {
    try {
        const codes = await Code.findAll({
          include: {
            model: User,
            attributes: ['id', 'nick'],
          },
          where : {codeType: 'C'},
          order: [['createdAt', 'DESC']],
        });


        if( req.isAuthenticated() ) {
          const countMails = await Codesend.count({
            where:{
              UserId:req.user.id,
              state:"unread",
            }
          });
          res.render('CompileC', {
            title: '코드',
            twits: codes,
            countmail: countMails,
          });
        }else {
          res.render('CompileC', {
            title: '코드',
          });
        }
      } catch (err) {
        console.error(err);
        next(err);
      }
});
router.get('/CompileCpp', async (req, res, next) => {
    try {
        const codes = await Code.findAll({
          include: {
            model: User,
            attributes: ['id', 'nick'],
          },
          where : {codeType: 'Cpp'},
          order: [['createdAt', 'DESC']],
        });
        res.render('CompileCpp', {
          title: '코드',
          twits: codes,
        });
      } catch (err) {
        console.error(err);
        next(err);
      }
});


router.post('/code_receive', function(req,res) {
    var code = req.body.code;
    var source = code.split(/\r\n|\r\n/).join("\n");
    var file='main.c';
    var arr= [];
    var i = 0;

    fs.writeFile(file,source,'utf8',function(error) {
        console.log('write end');
    });

    var compile = spawn('gcc',[file]);
    compile.stdout.on('data',function(data) {
        console.log('stdout: '+data);
    });
    compile.stderr.on('data',function(data){
        console.log(String(data));
        arr[i]=data.toString('utf8');
        i++;
    });

    compile.on('close',function(data){
        if(arr[0] == null) {
            var run = spawn('./a.out',[]);
            run.stdout.on('data',function(output){
                console.log('컴파일 완료');
                var str = output.toString('utf8');
                var responseData = {'result':'ok','output': str};
                res.json(responseData);
            });
            run.stderr.on('data', function (output) {

            });
            run.on('close', function (output) {
                console.log('stdout: ' + output);
            });
        }else {
            var errorData = {'result':'ok','output': arr[1]};
            res.json(errorData);
        }

    });
});

router.post('/code_receiveCpp', function(req,res) {
    var code = req.body.code;
    var source = code.split(/\r\n|\r\n/).join("\n");
    var file='main.cpp';
    var arr2= [];
    var i = 0;

    fs.writeFile(file,source,'utf8',function(error) {
        console.log('write end');
    });

    var compile = spawn('g++',[file]);
    compile.stdout.on('data',function(data) {
        console.log('stdout: '+data);
    });
    compile.stderr.on('data',function(data){
        console.log(String(data));
        arr2[i]=data.toString('utf8');
        i++;
    });

    compile.on('close',function(data){
        if(arr2[1] == null) {
            var run = spawn('./a.out',[]);
            run.stdout.on('data',function(output){
                console.log('컴파일 완료');
                var responseData = {'result':'ok','output': output.toString('utf8')};
                res.json(responseData);
            });
            run.stderr.on('data', function (output) {

            });
            run.on('close', function (output) {
                console.log('stdout: ' + output);
            });
        }else {
            var errorData = {'result':'ok','output': arr2[0]};
            res.json(errorData);
        }
    });
});





const upload2 = multer();

router.post('/C', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
      var title = req.body.codetitle;
      var now = dayjs();
      now = now.add(9, "hour");

      const exTitle = await Code.findOne({
        where: {codetitle: title, UserId: req.user.id}
      });
    
      

      if(title[0] == null){
        const post = await Code.create({
          codetitle: now.get("year")+"년"+" "+(now.get("month")+1)+"월"+ " " +now.get("date")+"일"+ " " +now.get("hour")+"시"+ " " +now.get("minute")+"분"+ " " +now.get("second")+"초에 저장된 글입니다.",
          code: req.body.code,
          codeType:'C',
          UserId: req.user.id,
        });
        res.redirect('/code/CompileC');
      } else if(exTitle) {
        const reWrite = await Code.update({
          code: req.body.code,
        },
         {where: {codetitle: title, UserId: req.user.id}});
      }else {
        const post = await Code.create({
          codetitle: req.body.codetitle,
          code: req.body.code,
          codeType:'C',
          UserId: req.user.id,
        });
        res.redirect('/code/CompileC');
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

  router.post('/Cpp', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
      var title = req.body.codetitle;
      var now = dayjs();
      now = now.add(9, "hour");
      
      if(title[0] == null) {

        const post = await Code.create({
          codetitle: now.get("year")+"년"+" "+(now.get("month")+1)+"월"+ " " +now.get("date")+"일"+ " " +now.get("hour")+"시"+ " " +now.get("minute")+"분"+ " " +now.get("second")+"초에 저장된 글입니다.",
          code: req.body.code,
          codeType:'Cpp',
          UserId: req.user.id,
        });
        res.redirect('/code/CompileCpp');
      }else{
        const post = await Code.create({
          codetitle: req.body.codetitle,
          code: req.body.code,
          codeType:'Cpp',
          UserId: req.user.id,
        });
        res.redirect('/code/CompileCpp');
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

  //코드 전송
router.post('/C/send/:idx', isLoggedIn, async (req, res, next) => {
  var id = req.params.idx;
  try {
    var nick = req.body.receiver;
    var title = req.body.title;
    var content = req.body.content;
    var now = dayjs();
    now = now.add(9, "hour");

    const receiver = await User.findOne({
      where:{nick:nick}
    })
  
    const code = await Code.findOne({
      where:{id:id}
    })
  
    if(receiver){
      if(title[0] == null){
          
        const post = await Codesend.create({
          title: req.user.nick+" 님이 보낸 코드입니다.",
          content:content,
          codetitle: code.codetitle,
          code: code.code,
          codeType: code.codeType,
          sendUsernick: req.user.nick,
          UserId: receiver.id,
          userNick: receiver.nick,
          sendUserId: req.user.id,
          created: now.format("YY.MM.DD HH:mm:ss"),
        });
        res.redirect('/code/CompileC');
      } else {
        const post = await Codesend.create({
          title: title,
          content:content,
          codetitle: code.codetitle,
          code: code.code,
          codeType: code.codeType,
          sendUsernick: req.user.nick,
          UserId: receiver.id,
          userNick: receiver.nick,
          sendUserId: req.user.id,
          created: now.format("YY.MM.DD HH:mm:ss"),
        });
        res.redirect('/code/CompileC');
      }
    }else{
      res.redirect('/code/CompileC');
    }

  }catch(error) {
      console.error(error);
      return next(error);
  }
});

//코드 받은거 보기
router.get('/receiveCode', async (req, res, next) => {
  try {      
    var page = Math.max(1, parseInt(req.query.page));
    var limit = Math.max(1, parseInt(req.query.limit));

    page = !isNaN(page)?page:1;
    limit = !isNaN(limit)?limit:10;

    const mails = await Codesend.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      where:{UserId:req.user.id},
      order: [['createdAt', 'DESC']],
      offset: (page-1)*10, limit: 10
    });

     const countMails = await Codesend.count({
      where:{UserId:req.user.id}
     });
     var skip = (page-1)*limit;
     var maxPage = Math.ceil(countMails/limit);

     var max = [];
     max.length = maxPage;

     for(i = 0; i < maxPage; i++) {
      max[i] = i+1;
     }

      res.render('CodeReceiver', {
        title: '커뮤니티',
        twits: mails,
        count: countMails,
        currentPage: page,
        maxPage: max,
        limit: limit
      });
      
    } catch (err) {
      console.error(err);
      next(err);
    }
});


// 즐겨찾기
router.get('/mail/favorite', async (req, res, next) => {
  const UserId = req.query.id;
  const favoriteId = req.query.favorite;

  await Favorite.create({
    UserId: UserId,
    favoriteId: favoriteId,
  })
});

// 즐겨찾기 삭제
router.post('/mail/favoriteDelete', async (req, res, next) => {
  const nick = req.body.favoritedNick; 
  const codeId = req.body.codeid;

  const idFromNick = await User.findOne({
    attributes: ['id'],
    where: {nick: nick}
  })

  const deleteQuery = `DELETE FROM favorites WHERE UserId = ? AND favoriteId = ?`;
  await sequelize.query(deleteQuery, {
    type: Sequelize.QueryTypes.DELETE,
    replacements: [req.user.id, idFromNick.id],
  })
  res.redirect(`/code/C/mail/${codeId}`);
});

//코드 받은거 검색
router.get('/receiver/search/', async (req, res, next) => {
  var query = req.query.word;
  const Op = Sequelize.Op;
  console.log(query);
  try {
      const content = await Codesend.findAll({
          include: {
              model: User,
              attributes: ['id', 'nick'],
          },
          order: [['createdAt', 'DESC']],
          where : {
                title: {
                  [Op.like]: "%"+query+"%"
                },  
                UserId: req.user.id 
          },
       });
       const count = await Codesend.count({});
       res.render('CodeReceiver', {
          title: '커뮤니티',
          twits: content,
          count: count,
       });
  }catch(error) {
      console.error(error);
      return next(error);
  }
});


  // 코드 포스트 겟
router.get('/C/:idx', async (req, res, next) => {
  var id = req.params.idx;

  try {
      const codes = await Code.findOne({
          include: {
              model: User,
              attributes: ['id', 'nick'],
          },
          where : {id, UserId: req.user.id},
       });
       const codeC = await Code.findAll({
          include: {
            model: User,
            attributes: ['id', 'nick'],
          },
          where : {codeType: 'C'},
          order: [['createdAt', 'DESC']],
        });

       res.render('CompileC', {
          title: '코드',
          read: codes,
          twits: codeC
       });


  }catch(error) {
      console.error(error);
      return next(error);
  }
});

router.get('/Cpp/:idx', async (req, res, next) => {
  // community/다음의 값을 idx로 가져옴
  var id = req.params.idx;
  try {
      const codes = await Code.findOne({
          include: {
              model: User,
              attributes: ['id', 'nick'],
          },
          where : {id},
       });

       const codeCpp = await Code.findAll({
          include: {
            model: User,
            attributes: ['id', 'nick'],
          },
          where : {codeType: 'Cpp'},
          order: [['createdAt', 'DESC']],
        });

       res.render('CompileCpp', {
          title: '코드',
          read: codes,
          twits: codeCpp,
       });
  }catch(error) {
      console.error(error);
      return next(error);
  }
});


router.get('/C/delete/:idx', async (req, res) => {
  const id = req.params.idx;
  await Code.destroy({
    where: {id:id}
  });

  res.redirect("/code/compileC");
})

router.get('/Cpp/delete/:idx', async (req, res) => {
  const id = req.params.idx;
  await Code.destroy({
    where: {id:id}
  });

  res.redirect("/code/compileCpp");
})

//받은거 읽어보기
router.get('/receiver/:idx', isLoggedIn, async (req, res, next) => {
  var id = req.params.idx;
  try {
      const content = await Codesend.findOne({
          where : {id, UserId: req.user.id},
       });
      if(content.UserId == req.user.id){
        const read = await Codesend.update(
          {state : "read"},
          {where : { id },
      });

      const favorite = await Favorite.findOne({
        where:{UserId : req.user.id, favoriteId : content.sendUserId},
      })

      res.render('codecontent', {
        title: '커뮤니티',
        read: content,
        favorite: favorite,
       });
       }else{
         res.redirect('/code/receiveCode')
       }
       
  }catch(error) {
      console.error(error);
      return next(error);
  }
});

//삭제
router.post('/mail/delete/:idx',isLoggedIn, async (req, res) => {
  const id = req.params.idx;
  await Codesend.destroy({
    where: {id:id}
  });

  res.redirect("/code/receiver");
});

//저장
router.post('/mail/save/:idx', isLoggedIn, async (req, res, next) => {
  // community/다음의 값을 idx로 가져옴
  var id = req.params.idx;
  try {
      const CodeReceiver = await Codesend.findOne({
          where : {id},
       });

       const post = await Code.create({
        codetitle: req.body.codetitle,
        code: CodeReceiver.code,
        codeType:CodeReceiver.codeType,
        UserId: req.user.id,
      });
      res.redirect("/code/compileC")
  }catch(error) {
      console.error(error);
      return next(error);
  }
});

router.get('/json', async (req, res) => {
  var text = req.query.term;
  const Op = Sequelize.Op;
  var nick = await User.findAll({
    where: { 
      nick: {
        [Op.like]: "%"+text+"%"
      }
    }
  });

  var responseData = nick;
  var n = JSON.stringify(responseData, ['nick']);
  n = JSON.parse(n);
  var jsonNick = [];
  for(var i = 0; i < n.length; i++) {
    jsonNick.push(n[i][Object.keys(n[i])[0]]);
  }
  // 닉네임 검색했을때 결과
  console.log(jsonNick);
  res.json(jsonNick);
})

router.get('/C/mail/:idx', async (req, res, next) => {
  var id = req.params.idx;
  const Op = Sequelize.Op;
  try {
      const code = await Code.findOne({
          where : {id, UserId: req.user.id},
       });

      const recentQuery = `SELECT DISTINCT nick FROM users WHERE id IN (SELECT UserId FROM codesends WHERE sendUserId = ? ORDER BY codesends.id DESC)`;
      const recent = await sequelize.query(recentQuery, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [req.user.id],
      });

      const receptionQuery = `SELECT DISTINCT nick FROM users WHERE id IN (SELECT sendUserId FROM codesends WHERE UserId = ? ORDER BY codesends.id DESC)`;
      const reception = await sequelize.query(receptionQuery, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [req.user.id],
       });
       
      const favoritQuery = `SELECT nick, id FROM users WHERE id IN (SELECT favoriteId FROM favorites WHERE UserId = ?)`;
      const favorite = await sequelize.query(favoritQuery, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: [req.user.id],
      })

      res.render('Codemail',{
        title:'코드 공유',
        code:code,
        recentSend: recent,
        recentReception: reception,
        favorites: favorite,
      })

  }catch(error) {
      console.error(error);
      return next(error);
  }
});

module.exports = router;
