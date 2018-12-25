const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()

const views = require('koa-views')
const co = require('co')
const convert = require('koa-convert')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const debug = require('debug')('koa2:server')
const path = require('path')

const config = require('./config')
const routes = require('./routes')
const fs = require('fs')
const cors = require('koa2-cors')
const port = process.env.PORT || config.port

// error handler
onerror(app)



// middlewares
app.use(bodyparser())
  .use(json())
  .use(logger())
  // .use(require('koa-static')(__dirname + '/public'))
  // .use(views(path.join(__dirname, '/views'), {
  //   options: {settings: {views: path.join(__dirname, 'views')}},
  //   map: {'njk': 'nunjucks'},
  //   extension: 'njk'
  // }))
  .use(router.routes())
  .use(router.allowedMethods())

app.use(cors({
  origin: function (ctx) {
    // if (ctx.url === '/test') {
    //     return "*"; // 允许来自所有域名请求
    // }
    return "*";
    //return 'http://localhost:8080'; / 这样就能只允许 http:/ / localhost: 8080 这个域名的请求了
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url}`)
})

// router.get('/', async (ctx, next) => {
//   // ctx.body = 'Hello World'
//   ctx.state = {
//     title: 'Koa2'
//   }
//   await ctx.render('index', ctx.state)
// })


router.all('**/*.action', async (ctx, next) => {
  let fsName;
  if(/\/(\w+).action/.test(ctx.url)){
    fsName = RegExp.$1;
    ctx.response.type = 'json';
    ctx.response.body = fs.createReadStream('./data/' + fsName +'.json');
  }else{
    ctx.throw('没有这个文件');
  }


})

routes(router)

app.on('error', function(err, ctx) {
  console.log(err)

})

module.exports = app.listen(config.port, () => {
  console.log(`Listening on http://localhost:${config.port}`)
})
