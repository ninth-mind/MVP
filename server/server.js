var express = require('express');
var app = express();
var parser = require('body-parser');
var db = require('./db/connection.js').connection

module.exports.app = app;


//We need body parser middleware
app.use(parser.json());
app.use(express.static('client'));

//~~~~~~ REFACTOR INTO MODEL ~~~~~~~

app.post('/login', function(req, res){
  var un = req.body.username;
  var pw = req.body.password
  //SHOULD HANDLE THIS WITH CALL BACKS INSTEAD OF AN IF STATEMENT. 
  if(usernameDoesntExist(un)){
    res.send(JSON.stringify({success: true, 
                            error: 'Invalid Username',
                            username: un,
                          }))
  }else{
    res.send(JSON.stringify({success: false, error: 'Signning IN', username : un}))
  }

})

app.post('/signup', function(req, res){
 
  var un = req.body.username;
  var pw = req.body.password
  if(usernameDoesntExist(un)){
    db.query("INSERT INTO users (username, password) VALUES (? , ?)",[un,pw], function(err, results){
      //You must send back a Object -otherwise the .then client side wont run
      res.send(JSON.stringify({success: true}))
    }) 
  }else{ 
    res.send(JSON.stringify({success: false, error: 'Username taken.'}))
  }
})

app.get('/user/*', function(req, res){
  var un = req.url.slice(6)
  db.query("SELECT r.rating FROM ratings r JOIN users u ON u.id = r.user_id WHERE u.username = ?",[un], function(err, results){
    if(results.length === 0){
      res.send({success: false, error:"No ratings found for "+ un,})
    }else{
      res.send({success : true, data : results})
    }
  })
})

app.post('/user/*', function(req, res){
  var un = req.url.slice(6);
  var rating = req.body.rating
  var id = null;
  db.query('SELECT id FROM users WHERE username = ?', [un], function(error, result){
    //capture error
    console.log("THE WORDS id:", result[0].id)
    id = result[0].id;
    db.query("INSERT INTO ratings(user_id, rating) VALUES(? ,?)", [id, rating], function(err, data){
      res.send({success: true})
    })
  });

})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});


///~~~~~~~~~~~ HELPER METHODS ~~~~~~~~~~~

var usernameDoesntExist = function(username){
  //THIS IS ASYNCHRONOUS
  return db.query("SELECT * FROM users WHERE username = ?", [username], function(err, data){
    if(data.length){
      return true;
    }else{
      return false;
    }
  })  
}