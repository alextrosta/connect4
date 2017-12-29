

var canvas = document.getElementById('canvas1');
var circleObj = {};
var redCircle = {};
var blueCircle = {};
var holeObjArray = [];
var holeObjObj = {};
var columns = [];
var timer;
var p1 = [];
var p2 = [];
var y;
var introTimer;
var errorTimer;
var gameState = {};// the game state object will corresponds to the current
//state of the game.
//intro --> display a waiting message
//pick  --> have the user pick a colour
//game  --> begin the game
//cont  --> continue to the next turn
//once all states have been reached (i.e. == 1), draw the current state of the
//board.
gameState.intro = 0;
gameState.pick = 0;
gameState.game = 0;
gameState.cont = 0;
var playerColour = "";
var intTextBox = 1;
var currPlayerColour = "";

var ws = new WebSocket('ws://' + window.document.location.host);
ws.onmessage = function(message) {
  console.log(message.data);
  if(message.data == "error1")// if less than 2 clients are connected.
  {/*
    display a waiting screen to the user connected.
    */
    clearInterval(introTimer);
    //maxPlayers();
  }
  else if(message.data == "TwoPlayers")// if 2 clients are connected
  {
    gameState.intro = 1;
    insertText();
    insertButton();
    chooseColour();//prompt the user to pick a colour
  }

  else if(message.data == 'red' || message.data == 'blue')
  {
    gameState.pick = 1;
    /*
    if a player has picked a colour, remove the colour submission box
    */
    var element = document.getElementById('msgBox');
    element.parentNode.removeChild(element);
    var button = document.getElementById('button');
    button.parentNode.removeChild(button);

    gameState.game = 1;
    //assign the opposing colour to the opponent
    if(message.data == 'blue')
    {
      playerColour = 'red';
    }
    else {
      playerColour = 'blue';
    }
  }

  //once the user has picked a colour, that user will go first.
  else if(message.data == "cont")
  {
    gameState.pick = 1;
    gameState.game = 1; //allow the game display the board
    //add an event handler for the user who's turn it is.
    document.getElementById('canvas1').addEventListener('mousedown',
    handleMouseDown);
    printOntoCanvas("Your turn", 675, 150, "black");
  }


  if(gameState.intro == 1 && gameState.pick == 1 && gameState.game == 1){
    if(message.data != "red" && message.data != "blue" && message.data != "cont")
    {
      //remove the event listener for the first turn of the user who did not
      //pick a colour
      document.getElementById('canvas1').removeEventListener("mousedown",
      handleMouseDown);
      if(message.data == 'permission')
      {
        //add an event listener for the user who's turn it is
        document.getElementById('canvas1').addEventListener('mousedown',
        handleMouseDown);
        printOntoCanvas("Your turn", 675, 150, "black");
      }
      else if(message.data == 'noPermission')
      {
        //remove an event listener for the user who's turn it isn't
        document.getElementById('canvas1').removeEventListener("mousedown",
        handleMouseDown);
        printOntoCanvas("Not your turn", 675, 150, "black");
      }

      else if(Object.keys(JSON.parse(message.data))[0] == 'winner')
      {
        //if a winning message is received, display to the user, and end the
        // game
        drawCanvas();
        displayWinner(JSON.parse(message.data));
      }

      else if(Object.keys(JSON.parse(message.data))[0] == 'x')
      {
        //if a coordinate object is received, display the current location
        //of the opponent's dragged circle
        drawOpponent(JSON.parse(message.data));
      }
      // draw the current state of the board
      else
      {
        var recievedObj = JSON.parse(message.data);
        console.log(recievedObj);
        currPlayerColour = recievedObj.player;
        holeObjArray = recievedObj.array;
        drawCanvas();
      }

    }
    else if (gameState.cont == 0){
      /*for the first turn taken by both players (before any coordinate or
      board objects are being sent to both clients, draw the initial state
      of the board, and assign control of the mouse to the player who's turn is
      first.
      */
      populateHoleObjArray();
      makeCircleObject();
      drawCanvas();
      drawCircleObject();
      if(message.data == 'blue' || message.data == 'red' )
      {
        document.getElementById('canvas1').removeEventListener("mousedown",
        handleMouseDown);
        printOntoCanvas("Not your turn", 675, 150, "black");
      }
      else if (message.data == "cont")
      {
        document.getElementById('canvas1').addEventListener('mousedown',
        handleMouseDown);
        printOntoCanvas("Your turn", 675, 150, "black");
      }
    }
  }
};
/*
function maxPlayers(){
var context = canvas.getContext('2d');
context.fillStyle = 'white';
context.fillRect(0,0,canvas.width,canvas.height);
printOntoCanvas("2 Players are currently playing, Sorry!", 400, 400, "black");
}*/

/*
drawOpponent draws the current location of the dragged circle object of the
opponent

input
oppCoords--> a coordinate object representing the current location of the
opponent's circle object.
*/

function drawOpponent(oppCoords)
{
  drawCanvas();
  var tempColour = '';
  var context = canvas.getContext('2d');
  context.fillStyle = oppCoords.colour;
  context.strokeStyle = oppCoords.colour;
  context.beginPath();
  context.arc(oppCoords.x,oppCoords.y, 40, 0, 2*Math.PI);
  context.stroke();
  context.fill();
}

/*
<div id='messages'></div>
<input type='text' placeholder='CHOOSE REDS/BLUES' id='msgBox' onkeypress ='return handleKeyPress(event)'>
<input type='button' id= 'button' onclick='sendMessage()' value='Send'>
<script src='canvas.js'></script>
*/

function insertText(){

  var element = document.createElement("input");

  element.setAttribute("type", "text");
  element.setAttribute("placeholder", "CHOOSE RED/BLUE");
  element.setAttribute("id", "msgBox");
  element.setAttribute("onkeypress", "return handleKeyPress(event)");

  var temp = document.getElementById("messages");

  temp.appendChild(element);

}

function insertButton(){

  var element = document.createElement("input");

  element.setAttribute("type", "button");
  element.setAttribute("id", "button");
  element.setAttribute("onclick", "sendMessage()");
  element.setAttribute("value", "Send");

  var temp = document.getElementById("messages");

  temp.appendChild(element);

}


/*
displayWinner will display a winning message to both clients detailing which
player has won.

input
obj --> the winner obj which contains the colour of the winner
*/

function displayWinner(obj)
{
  document.getElementById('canvas1').removeEventListener("mousedown",
  handleMouseDown);
  printOntoCanvas("Winner: " + obj.winner, 675, 150, obj.winner);
}

/*
printOntoCanvas draws a message onto the canvas

input
text   --> the text of the message
x      --> the x coordinate of the message
y      --> the y coordinate of the message
colour --> the colour of the message
*/

function printOntoCanvas(text, x, y, colour)
{
  var context = canvas.getContext('2d');
  context.fillStyle = colour;
  context.strokeStyle = colour;
  context.fillText(text, x, y);
  context.strokeText(text, x, y);
}

/*
function displayChoice(choice){
var context = canvas.getContext('2d');
context.fillStyle = 'white';
context.fillRect(0,0,canvas.width,canvas.height);

context.fillStyle = 'black';
context.strokeStyle = 'black';
context.fillText("YOU PICKED", 290, 400);
context.strokeText("YOU PICKED", 290, 400);
context.fillStyle = choice;
context.strokeStyle = choice;
context.fillText(choice.toUpperCase(), 290, 450);
context.strokeText(choice.toUpperCase(), 290, 450);
playerColour = choice;
//  console.log(JSON.stringify(playerColour));
//ws.send(JSON.stringify(playerColour));
}*/


/*
sendMessage takes the value of the msgBox text field and sends it to the
server
The msgBox text field is subsequently removed
*/
function sendMessage() {
  var message = document.getElementById('msgBox').value;
  //displayChoice(message);
  if(message.toLowerCase() != 'red' && message.toLowerCase() != 'blue')
  {
    displayInputError(message);
    setTimeout(chooseColour, 3000);
  }
  else{
    playerColour = message.toLowerCase();
    ws.send(message.toLowerCase());
    document.getElementById('msgBox').value = '';
    var element = document.getElementById('msgBox');
    element.parentNode.removeChild(element);
    var button = document.getElementById('button');
    button.parentNode.removeChild(button);
  }
}

function displayInputError(message) {

printOntoCanvas(message + " is not a valid choice", 125, 500, "black");

}

/*
chooseColour displays a prompt for the user to pick a colour for the game.
*/
function chooseColour(){
  clearInterval(introTimer)// remove the timer for the intro screen
  //dot animation
  var context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0,0,canvas.width,canvas.height);
  populateHoleObjArray();
  drawCanvas();

  printOntoCanvas("TYPE AND CLICK ENTER TO CHOOSE",175,100,"black");

  printOntoCanvas("RED",700,150,"red");

  redCircle.x = 724;
  redCircle.y = 200;
  redCircle.colour = "red";
  context.beginPath();
  context.arc(redCircle.x,redCircle.y,40, 0,2*Math.PI);
  context.stroke();
  context.fill();

  printOntoCanvas("BLUE",700,300,"blue");

  blueCircle.x = 724;
  blueCircle.y = 350;
  blueCircle.colour = "blue";
  context.beginPath();
  context.arc(blueCircle.x,blueCircle.y,40, 0,2*Math.PI);
  context.stroke();
  context.fill();

}

/*
sendGrid stringifies the object which corresponds to the current state of the
board, and sends it to the server.
*/

function sendGrid()
{
  holeObjObj.array = holeObjArray;
  holeObjObj.player = playerColour;
  //console.log(holeObjArray);
  let JSONStr = JSON.stringify(holeObjObj);
  ws.send(JSONStr);
}

function handleKeyPress(event){
  if(event.keyCode == 13){

    //sendMessage();

    return false; //don't propogate event
  }
}

/*
drawCanvas draws the current state of the game board and a new circle object
that the client can manipulate
*/

function drawCanvas(){

  var context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0,0,canvas.width,canvas.height); //erase canvas
  drawGrid();
  drawCircleObject();
}

//makeCircleObject initializes the x and y coordinates of the draggable
//circle object for each new turn

function makeCircleObject(){
  circleObj.x = 750;
  circleObj.y = 250;
}

//drawCircleObject draws the draggable circle object at its current location

/*
input
x --> the current x coordinate of the circle object
y --> the current y coordinate of the circle object
*/

function drawCircleObject(x, y){
  var context = canvas.getContext('2d');
  context.fillStyle = playerColour;
  context.strokeStyle = playerColour;
  context.beginPath();
  context.arc(circleObj.x,circleObj.y,40, 0,2*Math.PI);
  context.stroke();
  context.fill();
}

/*
drawP iterates through each index in board grid and draws the current state of
the board (i.e. where the red and blue circles have been dropped)
*/

function drawP()
{
  for(var a = 0; a < holeObjArray.length; a++)
  {
    for(var b = 0; b < holeObjArray[a].length; b++)
    {
      if(holeObjArray[a][b].p1 == 1)// if p1 has dropped a circle here
      {
        var context = canvas.getContext('2d');
        context.fillStyle = 'red';
        context.strokeStyle = 'red';
        context.beginPath();
        context.arc(holeObjArray[a][b].x,holeObjArray[a][b].y,40, 0,2*Math.PI);
        context.stroke();
        context.fill();
      }
      if(holeObjArray[a][b].p2 == 1)// if p2 has dropped a circle here
      {
        var context = canvas.getContext('2d');
        context.fillStyle = 'blue';
        context.strokeStyle = 'blue';
        context.beginPath();
        context.arc(holeObjArray[a][b].x,holeObjArray[a][b].y,40, 0,2*Math.PI);
        context.stroke();
        context.fill();
      }
    }
  }
}

/*
drawGrid displays the board of the connect 4 game
*/

function drawGrid(){

  var context = canvas.getContext('2d');
  context.fillStyle = 'gold';
  context.strokeStyle = 'blue';
  context.strokeRect(10,10, canvas.width-200 ,canvas.height-20);
  context.fillRect(10,10, canvas.width-200 ,canvas.height-20);
  context.fillStyle = 'white';
  for(var a = 0; a < 6; a++)
  {
    for(var b = 0; b < 7; b++)
    {
      context.beginPath();
      context.arc(holeObjArray[a][b].x, holeObjArray[a][b].y, 40, 0, 2*Math.PI);
      context.stroke();
      context.fill();
    }
  }
  drawP();
}

/*
populateHoleObjArray creates a 2D array of 'hole' objects.
Each hole object contains attributes listing the hole object's:
x coordinate, y coordinate, row and column number, and whether p1 or p1 have
placed their respective circles in the hole.
*/

function populateHoleObjArray(){
  for(var a = 0; a < 6; a++)
  {
    holeObjArray[a] = [];
    for(var b = 0; b < 7; b++)
    {
      holeObjArray[a][b] = {};
      holeObjArray[a][b].x = a*110+60;
      holeObjArray[a][b].y = b*90+60;
      holeObjArray[a][b].column = a+1;
      holeObjArray[a][b].row = b+1;
      holeObjArray[a][b].p1 = 0;
      holeObjArray[a][b].p2 = 0;
    }
  }
}

document.addEventListener('DOMContentLoaded', function(){
  //This is called after the broswer has loaded the web page

  //add mouse down listener to our canvas object
  //$("#canvas1").mousedown(handleMouseDown);
  //document.getElementById('canvas1').addEventListener('mousedown', handleMouseDown);

  introScreen();
});

/*
introScreen resets and fills a blank canvas
*/

function introScreen(){
  var context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0,0,canvas.width,canvas.height);
  waiting();
}

/*
waiting displays a message to the user informing the user that an opponent
has not connected to the server yet, and asking the user to wait patiently
*/

function waiting(){
  var context = canvas.getContext('2d');
  context.font = '20pt Times New Roman';

  printOntoCanvas("Waiting for another player", 250, 250, "blue");
  var dotObject = {};
  dotObject.x = 350;
  introTimer = setInterval(waitingAnimation, 1000);
  /*
  waitingAnimation displays an animation to the user informing the user that an
  opponent has not connected to the server yet, and asking the user to wait
  patiently
  */
  function waitingAnimation()
  {
    context.fillStyle = 'white';
    context.fillRect(0,0,canvas.width,canvas.height);

    printOntoCanvas("Waiting for another player", 250, 250, "blue");
    context.fillText(".", dotObject.x, 275);
    context.strokeText(".", dotObject.x, 275);
    dotObject.x += 25;
    if(dotObject.x > 475)
    {
      dotObject.x = 350;
    }
  }
}

/*
handleMouseDown retrieves the x and y coordinates of the mousedown event (w.r.t
the canvas)
*/

function handleMouseDown(e){

  //get mouse location relative to canvas top left
  var rect = canvas.getBoundingClientRect();
  //var canvasX = e.clientX - rect.left;
  //var canvasY = e.clientY - rect.top;
  var canvasX = e.pageX - rect.left; //use jQuery event object pageX and pageY
  var canvasY = e.pageY - rect.top;
  console.log("mouse down:" + canvasX + ", " + canvasY);

  circleBeingMoved = getCircleAtLocation(canvasX, canvasY);
  //retrieve the circle (if the user clicked on a circle)
  if(circleBeingMoved != null ){
    if(circleBeingMoved.colour != null)
    {
      playerColour = circleBeingMoved.colour;
    }
    deltaX = circleBeingMoved.x - canvasX;
    deltaY = circleBeingMoved.y - canvasY;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  // Stop propagation of the event and stop any default
  //  browser action

  e.stopPropagation();
  e.preventDefault();

  drawCanvas();
}

function getCircleAtLocation(aCanvasX, aCanvasY){

  //locate the circle near aCanvasX,aCanvasY
  //Just use crude region for now. (Player should click near the centre point)

  if(Math.abs(circleObj.x - aCanvasX) < 20 &&
  Math.abs(circleObj.y - aCanvasY) < 20)
  {
    return circleObj;
  }
  if(Math.abs(redCircle.x - aCanvasX) < 20 &&
  Math.abs(redCircle.y - aCanvasY) < 20)
  {
    return redCircle;
  }if(Math.abs(blueCircle.x - aCanvasX) < 20 &&
  Math.abs(blueCircle.y - aCanvasY) < 20)
  {
    return blueCircle;
  }

  return null;
}

function handleMouseMove(e){

  console.log("mouse move");

  //get mouse location relative to canvas top left
  var rect = canvas.getBoundingClientRect();
  var canvasX = e.pageX - rect.left;
  var canvasY = e.pageY - rect.top;

  circleBeingMoved.x = canvasX + deltaX;
  circleBeingMoved.y = canvasY + deltaY;
  circleBeingMoved.colour = playerColour;

  e.stopPropagation();

  var circleObj = JSON.stringify(circleBeingMoved);
  ws.send(circleObj);
  drawCanvas();
}

function handleMouseUp(e){
  console.log("mouse up");

  e.stopPropagation();

  //remove mouse move and mouse up handlers but leave mouse down handler
  document.removeEventListener("mousemove", handleMouseMove); //remove mouse move handler
  document.removeEventListener("mouseup", handleMouseUp); //remove mouse up handler

  findHole();//find the hole closest to where the circle object is dropped
}

/*
findHole locates the 2D location of the grid hole closest to the current
location of the circle object
*/

function findHole(){

  for(var a = 0; a < holeObjArray.length; a++)
  {
    for(var b = 0; b < holeObjArray.length; b++)
    {
      if(Math.abs(circleObj.x - holeObjArray[a][b].x) < 20 &&
      Math.abs(circleObj.y - holeObjArray[a][b].y) < 20)
      {
        circleObj.x = holeObjArray[a][b].x;
        circleObj.y = holeObjArray[a][b].y;
        dropCircle();
      }
    }
  }
  drawCanvas();
}

/*
dropCircle initiates an animation (which refreshes every 50 ms - creates the
effect of a dropping circle object)
*/

function dropCircle(){
  timer = setInterval(handleTimer, 50);
}

/*
handleTimer moves the circleObj 'down 1 hole' in the game array, for every
iteration of setInterval
*/

function handleTimer(){

  circleObj.y += 90; //y difference between each hole in a column
  var droppedOppCircle = {'x': circleObj.x, 'y': circleObj.y, 'colour': circleObj.colour}
  ws.send(JSON.stringify(droppedOppCircle));//send the location to the server
  //this allows for an updated image of the 'drop' animation for all clients

  drawCanvas();
  bottomLocationCheck();

}

/*
columnCheck looks at a column and finds where the first column appears (i.e.
how tall (in terms of circle objects) a column is)
*/

function columnCheck(){
  var column = [];
  for(var a = 0; a < holeObjArray[Math.floor((circleObj.x)/110)].length; a++)//iterate through columns
  {
    if((holeObjArray[Math.floor((circleObj.x)/110)][a].p1 == 1) ||
    (holeObjArray[Math.floor((circleObj.x)/110)][a].p2 == 1))//if there exists
    //a circle object for p1 or p2 in the current hole
    {
      return holeObjArray[Math.floor((circleObj.x)/110)][a];
    }
  }
}

/*
bottomLocationCheck calculates the location of the bottom circle in a column
*/

function bottomLocationCheck(){
  var check = columnCheck();//check if the column contains circle objects
  //if so, the bottom of the column is updated
  if(typeof check !== 'undefined')
  {
    if(circleObj.y > check.y)
    {
      circleObj.y = check.y - 75;//the current circle object will drop
      //75 pixels above the bottom most circle object

      if(playerColour == "red")
      {
        holeObjArray[Math.floor((circleObj.x)/110)]
        [Math.floor((circleObj.y)/90)].p1 = 1;//update the state of
        //the board array object (holeObjArray)
      }
      if(playerColour == "blue")
      {
        holeObjArray[Math.floor((circleObj.x)/110)]
        [Math.floor((circleObj.y)/90)].p2 = 1;//update the state of
        //the board array object (holeObjArray)
      }
      clearInterval(timer);//stop the 'drop' animation
      makeCircleObject();//redraw a new circle object for the next turn
      drawCircleObject();
      sendGrid();//send the grid to server for broadcast
    }
  }
  if(circleObj.y > 650)//if the column is empty
  {
    circleObj.y = 600;//place the circle object at the bottom of the column

    if(playerColour == "red")
    {
      holeObjArray[Math.floor((circleObj.x)/110)]
      [Math.floor((circleObj.y)/90)].p1 = 1;//update the state of
      //the board array object (holeObjArray)
    }
    if(playerColour == "blue")
    {
      holeObjArray[Math.floor((circleObj.x)/110)]
      [Math.floor((circleObj.y)/90)].p2 = 1;//update the state of
      //the board array object (holeObjArray)
    }

    clearInterval(timer);//stop the 'drop' animation
    makeCircleObject();//redraw a new circle object for the next turn
    drawCircleObject();
    sendGrid();//send the grid to server for broadcast
  }

  drawCanvas();
}
