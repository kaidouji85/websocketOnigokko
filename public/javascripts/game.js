// enchant.js本体やクラスをエクスポートする
enchant();

//定数
const MAX_PLAYER_NUM = 2;

//グローバル変数
var socket;                     //socket.ioオブジェクトを格納するグローバル変数
var roomId;                     //ルームID
var userId;                     //ユーザID
var G_inputs = null;
var core;

// ページが読み込まれたときに実行される関数
window.onload = function() {
    socket = io.connect('http://localhost');
    roomId = $("#roomId").val();
    userId = $("#userId").val();
    
    socket.on("startGame",function(data){
        game();
    });
    
    socket.on("resp",function(data){
        console.log(data);
    });
    
    socket.emit("enterRoom",{roomId:roomId,userId:userId});
    
};

//ゲームメイン関数
function game() {
    //コアオブジェクト生成
    core = new Core(320, 320);
    core.fps = 1;

    //画像ファイルの読み込み
    core.preload('/images/betty.png');

    // ファイルのプリロードが完了したときに実行される関数
    core.onload = function() {

        //プレイヤースプライト作成
        //playersに各プレイヤーのスプライトを格納する
        //playersの添え字がプレイヤーIDとなる
        var players = new Array(MAX_PLAYER_NUM);
        for (var i = 0; i < MAX_PLAYER_NUM; i++) {
            players[i] = new Sprite(48, 48);
            players[i].image = core.assets['/images/betty.png'];
            players[i].frame = 3 + i;
            players[i].x = 120 * i;
            players[i].y = 50;
            core.rootScene.addChild(players[i]);
        }

        //コマンド入力保持変数初期化
        //inputsに各プレイヤーの入力を格納する
        //inputsの添え字がプレイヤーIDとなる
        var inputs = new Array(MAX_PLAYER_NUM);
        for (var i = 0; i < MAX_PLAYER_NUM; i++) {
            inputs[i] = {};
        }

        //リフレッシュレートごとの処理
        core.rootScene.addEventListener('enterframe', function(e) {
            //コマンド入力保持変数にキーボード入力を代入する
            input();
            
            //プレイヤーの挙動
            runPlayer();
        });
        
        /**
         * 各プレイヤーの入力情報を取得する 
         */
        function input() {
            for (var i = 0; i < MAX_PLAYER_NUM; i++) {
                inputs[i] = core.input;
            }
            
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
                if (inputs[i].left) {
                    players[i].x -= 4;
                } else if (inputs[i].right) {
                    players[i].x += 4;
                }
                if (inputs[i].up) {
                    players[i].y -= 4;
                } else if (inputs[i].down) {
                    players[i].y += 4;
                }
            }
        }

    };

    // ゲームスタート
    core.start();
};
