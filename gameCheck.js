/*
playerCheck iterates through all indices of the game board, and looks for
horizontal, vertical, and ascending and descending diagonal combinations of 4
circle objects

input
gameArr --> the current state of the game board
p --> the current player (p1/p2) which is being checked

output
true --> a win condition has been found
false --> otherwise
*/
function playerCheck(gameArr, p){

  var height = gameArr[0].length;
  var width = gameArr.length;

  for(var a = 0; a < width ; a++)//vertical check
  {
    for (var b = 0; b < height - 3; b++)
    {
      /*
      if 4 circles are next to each other vertically
      */
      if(gameArr[a][b][p]   == 1 &&
         gameArr[a][b+1][p] == 1 &&
         gameArr[a][b+2][p] == 1 &&
         gameArr[a][b+3][p] == 1)
        {
          return true;
        }
      }
    }

    for(var a = 0; a < width - 3; a++)//horizontal check
    {
      //if 4 circles are next to each other horizontally
      for (var b = 0; b < height; b++)
      {
        if(gameArr[a][b][p]   == 1 &&
           gameArr[a+1][b][p] == 1 &&
           gameArr[a+2][b][p] == 1 &&
           gameArr[a+3][b][p] == 1)
          {
            return true;
          }
        }
      }

      for(var a = 0; a < width - 3 ; a++)//ascending
      {
        for (var b = 3; b < height; b++)
        {
          //if 4 circles are next to each other in an ascending diagonal
          if(gameArr[a][b][p]     == 1 &&
             gameArr[a+1][b-1][p] == 1 &&
             gameArr[a+2][b-2][p] == 1 &&
             gameArr[a+3][b-3][p] == 1)
            {
              return true;
            }
          }
        }

        for(var a = 3; a < width; a++)//descending
        {
          for (var b = 3; b < height; b++)
          {
            //if 4 circles are next to each other in a descending diagonal
            if(gameArr[a][b][p]   == 1 &&
               gameArr[a-1][b-1][p] == 1 &&
               gameArr[a-2][b-2][p] == 1 &&
               gameArr[a-3][b-3][p] == 1)
              {
                return true;
              }
            }
          }
          return false;
        }

exports.winner = playerCheck;// export the result of the playerCheck 
