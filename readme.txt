COMP 2406 Fall 2017

Assignment #2: Collaborative Single Page App

Due Date: Wed. Nov. 1 by 10:00pm in culearn

Alex Trostanovsky
100984702
Node.js/Javascript Collaborative App: connect4

App development:
Developed on Windows 7, running node.js and testing code with Google Chrome
web browser

A 2 user game of the connect 4 board game

App usage:

First,

> npm install 

1)  Run command (in the provided directory) $node app.js
2)  Open client in Chrome, on http://localhost:3000/assignment2.html
3)  Open another client (http://localhost:3000/assignment2.html),
    (so that two are connected to server)
4)  Type the colour of your choosing ('red' / 'blue') in the provided text box
5)  Hit 'send'

*NOTE* Once the first user picks a colour, the opposing colour is automatically
assigned to the other client.

6)  The server allocates control (by removing/adding a mousedown event) to each
    client. Each client is made aware of this by a display of the message:
    "Your turn" / "Not your turn"
7)  Use the mouse handler to manipulate the circle object, and drop a circle
    object in a desired hole.
8)  For each turn, the server performs a win check - looks at possible
    winning 'board states' for each player.
9)  Once a win is achieved, the result is displayed to both clients.
