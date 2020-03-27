const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const Cookie = require('cookie');
const qs = require('querystring');

const index_ejs = fs.readFileSync('./index.ejs', 'utf8');

let userName;

const server = http.createServer((req, res)=>{
  let content = ejs.render(index_ejs, {});

  let body = '';
  
  if(req.method == 'POST'){
    req.on('data', (data)=>{
      body += data
    });
    req.on('end', ()=>{
      userName = qs.parse(body).userName;
      console.log(`userName: ${userName} をcookieに保存しました`);
      res.setHeader('Set-Cookie', [`userName=${escape(userName)}`])
      res.writeHead(200, {'Content-Type':'text/html'});
      res.write(content);
      res.end();
    });
  } else {
    res.setHeader('Set-Cookie', [`userName=${escape(userName)}`])
    res.writeHead(200, {'Content-Type':'text/html'});
    res.write(content);
    res.end();
  }

})

const port = process.env.PORT || '8000';
server.listen(port, ()=>{
  console.log(`ポート${port}番でサーバー起動`);
});