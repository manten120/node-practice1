const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const Cookie = require('cookie');
const qs = require('querystring');

const index_ejs = fs.readFileSync('./index.ejs', 'utf8');
const style_css = fs.readFileSync('./style.css', 'utf8');

const server = http.createServer((req, res)=>{
    let urlPathName = url.parse(req.url).pathname
    console.log(urlPathName);

    switch (urlPathName) {
      case '/':
        if(req.method == 'POST'){
          let body = '';
          req.on('data', (data)=>{
            body += data
          });
          req.on('end', ()=>{
            console.log(body);
            let userName = qs.parse(body).userName;
            console.log('userName@POST: ' + userName);
            if(userName){
              const setCookie = Cookie.serialize('userName', userName, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7 // クッキーの期限(単位は秒)
              });
              res.setHeader('Set-Cookie', [setCookie]);
              console.log('setCookie: ' + setCookie);
            } else {
              const setCookie = Cookie.serialize('userName', userName, {
                httpOnly: true,
                maxAge: -1 // クッキーの期限を負にして削除
              });
              res.setHeader('Set-Cookie', [setCookie]);
              console.log('setCookie: ' + setCookie);
            }
      
            let content = ejs.render(index_ejs, {'userName': userName});
            res.writeHead(200, {'Content-Type':'text/html'});
            res.write(content);
            res.end();
          });
        } else {
          let userName = Cookie.parse(req.headers.cookie).userName;
          console.log('userName@GET: ' + userName);
      
          let content = ejs.render(index_ejs, {'userName':userName});
      
          res.writeHead(200, {'Content-Type':'text/html'});
          res.write(content);
          res.end();
        }
        break;

      case '/style.css':
        res.writeHead(200, {'Content_type':'text/css'});
        res.write(style_css);
        res.end();
        break;
    
      default:
        res.writeHead(200, {'Content-Type':'text/html'});
          res.end('はずれ');
        break;
    }
})


const port = process.env.PORT || '8000';
server.listen(port, ()=>{
  console.log(`ポート${port}番でサーバー起動`);
});