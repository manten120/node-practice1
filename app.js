const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const Cookie = require('cookie');
const qs = require('querystring');

const index_ejs = fs.readFileSync('./index.ejs', 'utf8');

const server = http.createServer((req, res)=>{

  if(req.method == 'POST'){
    let body = '';
    req.on('data', (data)=>{
      body += data
    });
    req.on('end', ()=>{
      let userName = qs.parse(body).userName;
      console.log('userName@POST: ' + userName);
      const setCookie = Cookie.serialize('userName', userName);
      res.setHeader('Set-Cookie', [setCookie])
      console.log('setCookie: ' + setCookie);

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

})

const port = process.env.PORT || '8000';
server.listen(port, ()=>{
  console.log(`ポート${port}番でサーバー起動`);
});