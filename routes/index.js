/*
 * ルーティング設定
 */

exports.index = function(req, res){
  res.render('index', {});
};

exports.battle = function(req, res){
  var userId = req.body.userId;
  var roomId = req.body.roomId;
  res.render('battle', {userId:userId,roomId:roomId});
};