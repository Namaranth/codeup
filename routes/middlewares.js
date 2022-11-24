exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.write("<script>alert('로그인뒤 이용가능합니다.')</script>");
    res.write("<script>window.location=\"../login\"</script>");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.');
    res.redirect(`/?error=${message}`);
  }
};
