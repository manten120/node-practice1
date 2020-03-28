const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const Cookie = require('cookie');
const qs = require('querystring');

const index_ejs = fs.readFileSync('./index.ejs', 'utf8');
const style_css = fs.readFileSync('./style.css', 'utf8');

let commentList;
const dataFile = './data.txt'

readDataFile(dataFile);

function readDataFile(dataFile){
  fs.readFile(dataFile, 'utf8', (err, data)=>{
    // dataFileの各行(JSON文字列)を配列commentListに格納
    // dataFileが空のときcommentList=['']
    commentList = data.split('\n');
    console.log('commentList: ' + commentList)
  });
}


const server = http.createServer((req, res)=>{
    let urlPathName = url.parse(req.url).pathname
    console.log('urlPathName: '+ urlPathName);

    switch (urlPathName) {
      case '/': // トップページ
        response_index(req, res)
        break;

      case '/style.css':
        res.writeHead(200, {'Content_type':'text/css'});
        res.write(style_css);
        res.end();
        break;
    
      default:
        res.writeHead(200, {'Content-Type':'text/html'});
          res.end('no page');
        break;
    }
})


const port = process.env.PORT || '8000';
server.listen(port, ()=>{
  console.log(`ポート${port}番でサーバー起動`);
});


// トップページの処理
function response_index(req, res){

  // POSTアクセス時の処理
  if(req.method == 'POST'){
    let body = '';
    req.on('data', (data)=>{
      body += data
    });
    req.on('end', ()=>{
      console.log(body);

      let userName = qs.parse(body).userName;
      let comment = qs.parse(body).comment;
      let deleteUserName = qs.parse(body).deleteUserName;

      console.log('userName@POST: ' + userName);
      
      // ログイン時にcookieをセットする
      if (userName){
        const setCookie = Cookie.serialize('userName', userName, {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7 // クッキーの期限(単位は秒)
        });
        res.setHeader('Set-Cookie', [setCookie]);
        console.log('setCookie: ' + setCookie);
      }

      // ログアウト時にcookieを削除する
      if (deleteUserName){
        const setCookie = Cookie.serialize('userName', userName, {
          httpOnly: true,
          maxAge: -1 // クッキーの期限を負にして削除
        });
        res.setHeader('Set-Cookie', [setCookie]);
        console.log('setCookie: ' + setCookie);
      }

      // 入力したコメントの処理
      if (userName && comment) {
        let obj = {"userName": userName, "comment": comment};
        let JSON_string = JSON.stringify(obj);
        console.log('JSON_string:' + JSON_string);

        // 配列commentListの先頭に要素を加える
        commentList.unshift(JSON_string);

        // 配列の全要素を連結し文字列にする
        let data_string = commentList.join('\n');

        // dataFileにデータを保存
        fs.writeFile(dataFile, data_string, (err)=>{
          if(err){ throw err; }
        })
      }
      
      // トップページを作成
      write_Index(res, userName, commentList);
    });

  // POSTアクセス以外の処理
  } else {
    // cookieからuserNameを取得する
    let userName = Cookie.parse(req.headers.cookie).userName;
    console.log('userName@GET: ' + userName);
    write_Index(res, userName, commentList);
  }
}

// トップページを作成
function write_Index(res, userName, commentList) {
  let content = ejs.render(index_ejs, {
    'userName': userName,
    'commentList': commentList,
  });
  res.writeHead(200, {'Content-Type':'text/html'});
  res.write(content);
  res.end();
}