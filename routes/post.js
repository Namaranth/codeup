const express = require('express');
const multer = require('multer');
const dayjs = require("dayjs");

const { Post, Comment,Recommend } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();
const upload2 = multer();

router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    function notWord(){
      var checkString = [];
      checkString = req.body.title;
      if(checkString[0] == null) {
        console.log("true" + checkString[0]);
        return true;
      } else {
        console.log("false" + checkString[0]);
        return false;
      }
    }
    
    function notContent(){
      var checkString = [];
      checkString = req.body.content;
      if(checkString[0] == null) {
        return true;
      } else {
        return false;
      }
    }
    var now = dayjs();
    now = now.add(9, "hour");

    if(notContent()) {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.write("<script>alert('내용을 입력해주세요.')</script>");
      res.write("<script>window.location=\"../write\"</script>");
    }else if(notWord()){
      const post = await Post.create({
        title: now.get("year")+"년"+" "+(now.get("month")+1)+"월"+ " " +now.get("date")+"일"+ " " +now.get("hour")+"시"+ " " +now.get("minute")+"분"+ " " +now.get("second")+"초에 작성한 글입니다.",
        content: req.body.content,
        UserId: req.user.id,
        created: now.format("YY.MM.DD HH:mm:ss"),
      });
      res.redirect('/community');
    }else {
      const post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        UserId: req.user.id,
        created: now.format("YY.MM.DD HH:mm:ss"),
      });
      res.redirect('/community');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/edit/:idx', isLoggedIn, upload2.none(), async (req, res, next) => {
  var id = req.params.idx;
  try {
    console.log(req.user);
    const post = await Post.update({
      title: req.body.title,
      content: req.body.content,
    },{where:{id:id}});

    res.redirect('/community/'+id);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/comment/:idx', isLoggedIn, upload2.none(), async (req, res, next) => {
  var id = req.params.idx;
  try {
    var now = dayjs();
    now = now.add(9, "hour");
    
    const comment = await Comment.create({
      review: req.body.review,
      UserId: req.user.id,
      PostId: id,
      created: now.format("YY.MM.DD HH:mm:ss"),
    });
    const CountComment = await Comment.count({where: {PostId : id}});
    const PostComment = await Post.update({commentCount: CountComment},{where:{id:id}});

    res.redirect('/community/'+id);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/recommend/:idx', isLoggedIn, async (req, res, next) => {
  var id = req.params.idx;
  try {
    console.log(req.user);
    const recommends = await Recommend.create({
      UserId: req.user.id,
      PostId: id,
    });
    const CountRecommend = await Recommend.count({where: {PostId : id}});
    const goodPost = await Post.update({ Recommend :CountRecommend},{where: {id:id}});

    res.redirect('/community/'+id);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/derecommend/:idx', isLoggedIn, async (req, res, next) => {
  var id = req.params.idx;
  var user = req.user.id;
  try {
    console.log(req.user);
    const recommends = await Recommend.destroy({
      where: { PostId:id, UserId:user },
    });
    const CountRecommend = await Recommend.count({where: {PostId : id}});
    const goodPost = await Post.update({ Recommend :CountRecommend},{where: {id:id}});

    res.redirect('/community/'+id);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/community/comment/delete/:idx", async (req, res) => {
  var id = req.params.idx;

  const PostId = await Comment.findOne({where: {id:id}});


  await Comment.destroy({
    where: {id:id}
  })

  const CountComment = await Comment.count({where: {PostId : PostId.PostId}});
  const PostComment = await Post.update({commentCount: CountComment},{where:{id: PostId.PostId}});
  
  res.redirect("/community");
  
})


router.get("/community/comment/edit/:idx", async (req, res) => {
  res.write("<input>");
})
module.exports = router;
