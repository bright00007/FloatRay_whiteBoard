const router = require('koa-router')();

router.get('/wb', async (ctx, next) => {
  ctx.response.redirect('/page/whiteBoard');
})

module.exports = router;
