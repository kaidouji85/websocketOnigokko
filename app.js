/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//ルーティング設定
app.get('/', routes.index);
app.get('/users', user.list);
app.post('/battle', routes.battle);

//httpサーバ
var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

//サーバ側のゲーム処理
var game = function(spec, my) {
    var that = {};
    var inUserInfoArray = new Array();
    var userInputs = {};
    
    /**
     * ルーム入室 
     * @param {Number} userId
     */
    that.join = function(userId,fn){
        var userInfo = {userId : userId};
        inUserInfoArray.push(userInfo);
        if(inUserInfoArray.length == 2) {
            fn(null,inUserInfoArray);    
        }
    };
    
    /**
     * コマンド入力 
     * @param {Number} userId
     * @param {input} input
     */
    that.input = function(userId,input,fn){
        userInputs[userId] = input;
        if(Object.keys(userInputs).length == 2) {
            fn(null,{inputs:userInputs});
            userInputs = {};
        }
    };
    
    return that;
};

//ルーム毎のゲーム処理クラス配列
//配列のインデックスが、ルームIDに対応します
const MAX_ROOM = 100;
var gameArray = new Array(MAX_ROOM);
for (var i = 0; i < MAX_ROOM; i++) {
    gameArray[i] = game();
}

//socket.ioサーバ
var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
    //入室
    socket.on("enterRoom", function(data) {
        var roomId = data.roomId;
        var userId = data.userId;

        socket.join(roomId);
        gameArray[roomId].join(userId, function(err, data) {
        	io.sockets.in(roomId).emit("startGame", data);
        });
    });
    
    //クライアントからの入力受付
    socket.on("input", function(data) {
        console.log("input : data");
        console.log(data);
        var roomId = data.roomId;
        var userId = data.userId;
        var input = data.input;
        
        gameArray[roomId].input(userId,input,function(err,data){
        	io.sockets.in(roomId).emit("resp", data);
        });
    });
}); 