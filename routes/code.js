const express = require('express');
const fs = require('fs');
const router = express.Router();
const bodyParser = require('body-parser');
const spawn = require('child_process').spawn;
const dayjs = require("dayjs");

const multer = require('multer');
const { Code, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

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
        res.render('CompileC', {
          title: '코드',
          twits: codes,
        });
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


  // 코드 포스트 겟
router.get('/C/:idx', async (req, res, next) => {
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

module.exports = router;