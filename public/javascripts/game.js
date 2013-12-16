// enchant.js本体やクラスをエクスポートする
enchant();

//定数
const MAX_PLAYER_NUM = 2;
const SERVER_IP = "172.22.198.13";

//グローバル変数
var socket;                     //socket.ioオブジェクトを格納するグローバル変数
var roomId;                     //ルームID
var userId;                     //ユーザID
var inputs = null;              //全ユーザの入力情報
var core;                       //enchant.js coreオブジェクト
var isSendInput = false;        //入力をサーバへ送信したかのフラグ  true:送信 false:未送信

// ページが読み込まれたときに実行される関数
window.onload = function() {
    socket = io.connect('http://'+SERVER_IP);
    roomId = $("#roomId").val();
    userId = $("#userId").val();
    
    socket.on("startGame",function(data){
        game(data);
    });
    
    socket.on("resp",function(data){
        inputs = data.inputs;
    });
    
    socket.emit("enterRoom",{
        roomId:roomId,
        userId:userId
    });
    
};

//ゲームメイン関数
function game(spec,my) {
    //コアオブジェクト生成
    core = new Core(320, 320);
    core.fps = 60;

    //画像ファイルの読み込み
    core.preload('/images/betty.png');

    // ファイルのプリロードが完了したときに実行される関数
    core.onload = function() {

        //プレイヤースプライト作成
        //playersに各プレイヤーのスプライトを格納する
        var players = new Array(Object.keys(spec).length);
        for (var i = 0; i < MAX_PLAYER_NUM; i++) {
            players[i] = new Sprite(48, 48);
            players[i].image = core.assets['/images/betty.png'];
            players[i].frame = 3 + i;
            players[i].x = 120 * i;
            players[i].y = 50;
            players[i].userId = spec[i].userId;
            core.rootScene.addChild(players[i]);
        }

        //リフレッシュレートごとの処理
        core.rootScene.addEventListener('enterframe', function(e) {
            //サーバに入力情報を送信していないなら、入力情報を送信する
            if(isSendInput == false) {
                input();
                isSendInput = true;
            }
            
            //サーバから入力情報のレスポンスがない場合、FPSの処理を実施しない
            if(inputs === null) {
                return;
            }
            
            //プレイヤーの挙動
            runPlayer();
            
            //入力情報送信フラグ、サーバからの入力情報を初期化する
            isSendInput = false;
            inputs = null;
        });
        
        /**
         * コマンド入力情報をサーバへ送信する 
         */
        function input() {
            socket.emit("input",{
                userId:userId,
                roomId:roomId,
                input:core.input
            });
        }

        /**
         * プレイヤーキャラの挙動
         */
        function runPlayer() {
            for (var i = 0; i < MAX_PLAYER_NUM; i++) {
                var userId = players[i].userId;
                if (inputs[userId].left) {
                    players[i].x -= 4;
                } else if (inputs[userId].right) {
                    players[i].x += 4;
                }
                if (inputs[userId].up) {
                    players[i].y -= 4;
                } else if (inputs[userId].down) {
                    players[i].y += 4;
                }
            }
        }

    };

    // ゲームスタート
    core.start();
};
