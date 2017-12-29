/*
Before you run this app first execute
>npm install
to load npm modules listed in package.json file

Then launch this server.
Then open several browsers to: http://localhost:3000/index.html

*/



var http = require('http');
//npm modules (need to install these first)
var WebSocketServer = require('ws').Server; //provides web sockets
var ecStatic = require('ecstatic');  //provides static file server service
var gameCheck = require('./gameCheck.js');//requirement 1.2

//static file server
var server = http.createServer(ecStatic({root: __dirname + '/html'}));
var p1Win = false;
var p2Win = false;
var players = {};
var turns = {};
turns.currTurn = 0;
players.red = false;
players.blue = false;
players.check = 1;
var p = {};

var connections = {}; //the connections object will act as an identifier of
var connectionIDCounter = 0; //clients

var wss = new WebSocketServer({server: server});

wss.on('connection', function(ws) {
  /*
  Since Connect 4 is a two player game, once two connections are established,
  the server does not allow any further connections to be made
  */
  if(connectionIDCounter == 2)
  {
    wss.clients.forEach(function(client) {
      if(client.id == ws.id)
      {
        ws.send("error1")
        ws.close();
        return;
      }
    });
  }
  console.log('Client connected');
  //For every connection being made, a unique ID is assigned. This identifies
  //clients. This is needed for accurate allocation of control of the mouse
  //while taking turns.
  ws.id = connectionIDCounter ++;
  connections[ws.id] = ws;
  //console.log(connections);
  /*
  Once two players are connected, let both clients know they may begin the
  game.
  */
  if((wss.clients.length) == 2)
  {
    wss.clients.forEach(function(client) {
      client.send("TwoPlayers")
    });
  }
  ws.on('message', function(msg) {

    console.log('Message: ' + msg);

    var oppCoordObj = '';//This variable checks whether the message sent by
    //the client is of the following form: {x: , y: , player: }

    if(msg !=  'red' && msg != 'blue')
    {
      oppCoordObj = Object.keys(JSON.parse(msg))[0];
    }

    if(oppCoordObj == "x")//if the message is a coordinate object
    {
      wss.clients.forEach(function(client) {
        if(client.id != ws.id)//send the message to the opponent
        {//so that the opponent is provided with an updated location of
          //of the opponent's circle object location
          client.send(msg);
        }
      });
    }

    //otherwise, let the client know that it may continue to the next turn
    else{
      wss.clients.forEach(function(client) {
        if(client.id != ws.id)
        {
          client.send(msg);
        }
        if(client.id == ws.id)
        {
          client.send("cont");
        }
      });


      if(msg != 'red' && msg != 'blue'){//if the msg is a board state object
        broadcast(msg);//broadcast the message to both clients
        //turns.currTurn++;

/*
Also, grant handleMouseMove permission to the client's who's turn it is,
and remove this permission from the client who's turn it isn't.
*/

        wss.clients.forEach(function(client) {
          if(client.id != ws.id)
          {
            client.send("permission");
          }
          if(client.id == ws.id)
          {
            client.send("noPermission")
          }
        });

/*
Check for win on each turn.
*/
        var gameArr = JSON.parse(msg).array;
        var currPlayer = JSON.parse(msg).player;
        winCheck(gameArr, currPlayer);// a winCheck is performed for the last
        //player that made a move.

      }
    }
  });
});

/*
broadcast takes a message and sends it to all clients currently connected to
the server.

input
msg --> the message received by the server.

*/
function broadcast(msg) {
  wss.clients.forEach(function(client) {
    client.send(msg);
  });
}

/*
winCheck inspects the current state of the board and checks for all
possible states which correspond to a win.

input
gameArr --> an object representing the state of the board
player --> the player (p1/p2) for which the winCheck is performed
*/

function winCheck(gameArr, player)
{
  if(gameCheck.winner(gameArr, 'p1') || gameCheck.winner(gameArr, 'p2'))
  {
    var win = {};//create a win object which will transmit the result of the
                 //winCheck to all clients.
    win.winner = player;
    broadcast(JSON.stringify(win));
  }
}

server.listen(3000);
console.log('Server Running at http://127.0.0.1:3000  CNTL-C to quit');
