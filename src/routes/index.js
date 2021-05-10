const router = require('koa-router')()

router.get('/wb', async (ctx, next) => {
  ctx.response.redirect('/page/whiteBoard');
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
