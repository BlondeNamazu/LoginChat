// 1.モジュールオブジェクトの初期化
var fs = require("fs");
var url = require("url");
var server = require("http").createServer(function(req, res) {
     var output;
     if(~url.parse(req.url).pathname.indexOf('main')){
       res.writeHead(200, {"Content-Type":"text/html"});
       output = fs.readFileSync("./main.html", "utf-8");
     } else {
       res.writeHead(200, {"Content-Type":"text/html"});
       output = fs.readFileSync("./index.html", "utf-8");
     }
     res.end(output);
}).listen(8080);
var io = require("socket.io").listen(server);

// ユーザ管理ハッシュ
var userHash = {};
var maxid = 0;
var userList = {};
var activeUserList = {};
function User(name,pass,email){
  this.id = maxid ++;
  this.name = name;
  this.pass = pass;
  this.email = email;
}

// 2.イベントの定義
io.sockets.on("connection", function (socket) {

  // 接続開始カスタムイベント(接続元ユーザを保存し、他ユーザへ通知)
  socket.on("connected", function (name) {
    var msg = name + "が入室しました";
    userHash[socket.id] = name;
    io.sockets.emit("publish", {value: msg});
  });

  // メッセージ送信カスタムイベント
  socket.on("publish", function (data) {
    io.sockets.emit("publish", {value:data.value});
  });

  // 接続終了組み込みイベント(接続元ユーザを削除し、他ユーザへ通知)
  socket.on("disconnect", function () {
    if (userHash[socket.id]) {
      var msg = userHash[socket.id] + "が退出しました";
      delete userHash[socket.id];
      io.sockets.emit("publish", {value: msg});
    }
  });
});