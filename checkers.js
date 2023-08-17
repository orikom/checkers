// e - empty, b - black, bk - black king, w - white, wk - white king, p - possible destination position, s -selected.  
const board = [
  [ 'e', 'b', 'e', 'b', 'e', 'b', 'e', 'b' ],
  [ 'b', 'e', 'b', 'e', 'b', 'e', 'b', 'e' ], 
  [ 'e', 'b', 'e', 'b', 'e', 'b', 'e', 'b' ],
  [ 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e' ],
  [ 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e' ],
  [ 'w', 'e', 'w', 'e', 'w', 'e', 'w', 'e' ],
  [ 'e', 'w', 'e', 'w', 'e', 'w', 'e', 'w' ],
  [ 'w', 'e', 'w', 'e', 'w', 'e', 'w', 'e' ],
 ]
 
let UIBoard = document.querySelector('#checkers_board');
let pieceToMove = null;
let isWhiteTurn = true; 
let visitedPositions;
let isCheckIfGameOverFlag = false;

function createUIBoard(){
 let isLightSquare = true;

 for(let row = 0; row < board.length; row++){
   for(let col = 0; col <board[row].length; col++){

     const square = document.createElement('div');

     if(isLightSquare){
       square.classList.add('square', 'light-square');
     }else{
       square.classList.add('square', 'dark-square');
     }

     isLightSquare = !isLightSquare;

     square.addEventListener('click', handleSquareClicked);
     UIBoard.appendChild(square);

     //create piece
     const piece = document.createElement('div');
     piece.setAttribute('row', row);
     piece.setAttribute('col', col);
     piece.addEventListener('click', handlePieceClicked);      

     square.appendChild(piece);
   }
   isLightSquare = !isLightSquare;
 }
}

function handleSquareClicked(event){
 clearAllMarksFromArray();
 printUIPieces();
}

function handlePieceClicked(event){   
 event.stopPropagation();

 let rowClicked = +event.target.getAttribute('row');
 let colClicked = +event.target.getAttribute('col');

 if(isWrongColorClicked(rowClicked, colClicked)) {
   clearAllMarksFromArray(); 
   printUIPieces();
   return;
 }

 if(isPossibleDestinationClicked(rowClicked, colClicked)) 
 {
   isCheckIfGameOverFlag = true;
   visitedPositions = []
   let pieceToMoveRow = +pieceToMove.getAttribute('row')
   let pieceToMoveCol = +pieceToMove.getAttribute('col');

   // create array of all player's pieces that can capture opponent.
   let capturingCheckers = findCapturingCheckers();

   // if curr move is not a capture
   if(!isCaptureMade(pieceToMoveRow, rowClicked)){
     // burn all pieces in array
     for(let checker of capturingCheckers){
       board[checker.row][checker.col] = 'e';
     }


   } 
   else//capture happened
   {
     removeCapturedPieces(pieceToMoveRow, pieceToMoveCol, rowClicked, colClicked, {row: pieceToMoveRow, col: pieceToMoveCol});
   }

   // approve move    
   board[rowClicked][colClicked] = board[pieceToMoveRow][pieceToMoveCol];
   board[pieceToMoveRow][pieceToMoveCol] = 'e';

   //if last rank, create a king             rowClicked because the approve already made
   if(isLastRowReached(rowClicked) && !board[rowClicked][colClicked].includes('k')){
     board[rowClicked][colClicked] += "k"  
   }

   clearAllMarksFromArray();
   
   isWhiteTurn = !isWhiteTurn;
   pieceToMove = null;
   changeTurnDisplay();
 }

 else{ //white or black checker selected
   clearAllMarksFromArray();
   pieceToMove = event.target;
   markPossibleDestinations(rowClicked, colClicked); 
   board[rowClicked][colClicked] += 's'
 }

 printUIPieces();

 if(isCheckIfGameOverFlag && isGameOver()){
  openGameOverModal(`game over! the winner is ${isWhiteTurn ? 'Black': 'White'}`);
 }

 isCheckIfGameOverFlag = false;

}

function isGameOver(){
  let playerColor = isWhiteTurn ? 'w': 'b';
  for(let row = 0; row < board.length; row++){
    for(let col = 0; col <board[row].length; col++){
      let currPiece = board[row][col];
      //if player has pieces left or has a legal move
      if(currPiece.includes(playerColor) && hasLegalMove(row, col, currPiece)){
        return false;
      }     
    }
  }
  return true;
}

function hasLegalMove(row, col, currPiece){
  let directionsY = [];
  let directionsX = [-1, 1];
  directionsY.push(currPiece.includes('w') ? -1 : 1);

  if(currPiece.includes('k')){
    directionsY.push(directionsY[0] * -1);
  }
  
  for(let i = 0; i < directionsY.length; i++){
    for(let j = 0; j < directionsX.length; j++){
      if(canCheckerMove1Step(row, col, directionsX[j], directionsY[i]) || canCheckerCapture(row, col, directionsX[j], directionsY[i]))  {
        return true;
      } 
    }
  }

  return false;
}

function markPossibleDestinations(pieceRow, pieceCol){

 visitedPositions = [];
  
 let isKingClicked = board[pieceRow][pieceCol].includes('k');
 let directionY = isWhiteTurn ? -1 : 1;

 let oneStepMoves = [
                      {row: pieceRow + directionY ,col: pieceCol + 1}, 
                      {row: pieceRow + directionY ,col: pieceCol - 1}, 
                    ]

 if(isKingClicked){
  oneStepMoves.push({row: pieceRow - directionY ,col: pieceCol + 1}, 
                    {row: pieceRow - directionY ,col: pieceCol - 1})
 }

 for(let oneStepMove of oneStepMoves){
  if(isInBounds(oneStepMove.row, oneStepMove.col) && 
   isEmptySquare(oneStepMove.row, oneStepMove.col))
  {
    board[oneStepMove.row][oneStepMove.col] = 'p';
  }
 }

 markPossibleCapturing(pieceRow, pieceCol, {row: pieceRow, col: pieceCol}); //last argument -origin 
}

function printUIPieces(){
 let allUISquares = UIBoard.children;

 for(let row = 0; row < board.length; row++){
   for(let col = 0; col <board[row].length; col++){ 
     let index = row * 8 + col; 
     let currUISquare = allUISquares[index];
     let currUIPiece = currUISquare.firstElementChild;
     currUIPiece.className = ''; //reset all classes
   
      switch(board[row][col]){
        case 'w': case 'ws':
          currUIPiece.classList.add('checker', 'white');
          break;
        case 'wk': case 'wks':
          currUIPiece.classList.add('checker', 'white', 'king');
          break;
        case 'b': case 'bs':
          currUIPiece.classList.add('checker', 'black');
          break;
        case 'bk': case 'bks':
          currUIPiece.classList.add('checker', 'black', 'king');
          break;
        case 'e':
          currUIPiece.classList.add('checker', 'green','hidden'); 
          break;
        case 'p':
          currUIPiece.classList.add('checker', 'green'); 
          break;
       }

      if(board[row][col].includes('s')){
        currUIPiece.classList.add('selected-checker'); 
      }

    }
  }
}

function markPossibleCapturing(row, col, originLocation){

  if(!(originLocation.row === row && originLocation.col === col)){
    board[row][col] = 'p';
  }

  let directionsY = [];
  let directionsX = [-1, 1];
  directionsY.push(board[originLocation.row][originLocation.col].includes('w') ? -1 : 1);
  if(board[originLocation.row][originLocation.col].includes('k')){
    directionsY.push(directionsY[0] * -1);
  }

  for(let i = 0; i < directionsY.length; i++){
    for(let j = 0; j < directionsX.length; j++){

      if(canCheckerCapture(row, col, directionsX[j], directionsY[i]) && 
         !isVisited(row + (2 * directionsY[i]), col + (2 * directionsX[j]))){

        visitedPositions.push({row, col});
        if(!(originLocation.row === row && originLocation.col === col)){
          board[row][col] = 'e';
        }
          console.log(visitedPositions)
         markPossibleCapturing(row + (2 * directionsY[i]), col + (2 * directionsX[j]), originLocation);
       }

    }
  }
}

function isVisited(currRow, currCol){  
  return visitedPositions.some(element => element.row === currRow && element.col === currCol)
}

//even 1 capture(not all sequences)
function findCapturingCheckers(){
 let capturingCheckers = [];
 const currPlayerColor = isWhiteTurn ? 'w' : 'b';
 const directionY = isWhiteTurn ? -1 : 1;  
 for(let row = 0; row < board.length; row++){
   for(let col = 0; col <board[row].length; col++){

      // if regular checker
      if((canCheckerCapture(row, col, -1, directionY) || canCheckerCapture(row, col, 1, directionY)) &&
        (board[row][col].includes(currPlayerColor))) 
      {
        capturingCheckers.push({row: row, col: col});
      }
      
      // if also a king - flip Y direction
      if((canCheckerCapture(row, col, -1, -1 * directionY) || canCheckerCapture(row, col, 1, -1 * directionY)) &&
        (board[row][col].includes(currPlayerColor)) && 
        (board[row][col].includes('k'))) 
      {
        capturingCheckers.push({row: row, col: col});
      }

    } 
   }

   return capturingCheckers;
}

function canCheckerCapture(row, col, directionX, directionY){
  return isInBounds(row + directionY, col + directionX) &&
         isInBounds(row + (2 * directionY), col + (2 * directionX)) &&
         isOpponnentInSquare(row + directionY, col +directionX) &&
         isEmptySquare(row + (2 * directionY), col + (2 * directionX));
}

function canCheckerMove1Step(row, col, directionX, directionY){
  return isInBounds(row + directionY, col + directionX) &&
         isEmptySquare(row + directionY, col + directionX);
}

function clearAllMarksFromArray(){
 for(let row = 0; row < board.length; row++){
   for(let col = 0; col <board[row].length; col++){
     if(board[row][col] === 'p'){
       board[row][col] = 'e';
     }
     board[row][col] = board[row][col].replace('s', ''); //if selected -> remove selection!
     
   }
 }
}

function removeCapturedPieces(row, col, destRow, destCol, originLocation){
  let isDestinationReached;

  if(row === destRow && col === destCol) 
    return true;

  let directionsY = [];
  let directionsX = [-1, 1];
  directionsY.push(board[originLocation.row][originLocation.col].includes('w') ? -1 : 1);
  if(board[originLocation.row][originLocation.col].includes('k')){
    directionsY.push(directionsY[0] * -1);
  }

  for(let i = 0; i < directionsY.length; i++){
    for(let j = 0; j < directionsX.length; j++){
      if(canCheckerCapture(row, col, directionsX[j], directionsY[i]) && 
        !isVisited(row + (2 * directionsY[i]), col + (2 * directionsX[j]))){

        visitedPositions.push({row, col});
        isDestinationReached = removeCapturedPieces(row + (2 * directionsY[i]), col + (2 * directionsX[j]), destRow, destCol, originLocation);
    
        if(isDestinationReached === true){
          board[row + directionsY[i]][col + directionsX[j]] = 'e';
          return true;
        }
      }
    }
  }
}

function isPossibleDestinationClicked(row, col){
 return board[row][col] === 'p';
}
function isCaptureMade(fromRow, destinationRow){ 
 return Math.abs(fromRow - destinationRow) !== 1;
}

function isLastRowReached(rowClicked){
 return (rowClicked === 0 && isWhiteTurn) || (rowClicked === 7 && !isWhiteTurn);
}

function isEmptySquare(row, col){
 return board[row][col] === 'e' || board[row][col] === 'p'
}

function isWrongColorClicked(rowClicked, colClicked){
 return (board[rowClicked][colClicked].includes('w') && !isWhiteTurn) ||
        (board[rowClicked][colClicked].includes('b') && isWhiteTurn)
}

function isOpponnentInSquare(row, col){
 let opponentColor = (isWhiteTurn ? 'b' : 'w');
 return board[row][col].includes(opponentColor);
}

function isInBounds(row, col){
 return row >= 0 && row < 8 && col >= 0 && col < 8;
}

createUIBoard();
printUIPieces();

const drawModal = document.querySelector('#draw-modal');
const drawBtn = document.querySelector('#draw-btn');
const drawModalBox =document.querySelector('#message-box-draw') 
const drawTextMessage = drawModal.querySelector('#text-message');

const resignModal = document.querySelector('#resign-modal');
const resignBtn = document.querySelector('#resign-btn');
const resignModalBox =document.querySelector('#message-box-resign') 
const resignTextMessage = resignModal.querySelector('#text-message');

const gameOverModal = document.querySelector('#game-over-modal');
const closeModalBtn = document.querySelector('#close-modal-btn');
const gameOverModalBox =document.querySelector('#message-box-game-over') 
const gameOverTextMessage = gameOverModal.querySelector('#text-message');

const turnsDisplay = document.querySelector('#turns-display');

//-------------Draw button----------------
drawBtn.addEventListener('click', () => {
  drawTextMessage.textContent = `${isWhiteTurn? 'White' : 'Black'} player offered a draw.${isWhiteTurn? 'Black': 'White'} player, do you accept the offer?` 
  drawModal.classList.remove('hidden');
})
drawModal.addEventListener('click', ()=>{
  drawModal.classList.add('hidden');
})

drawModalBox.addEventListener('click', (event)=>{
  event.stopPropagation();
  if(event.target.classList.contains('btn-accept')){
    drawModal.classList.add('hidden');
    openGameOverModal('The game has ended in a draw!');
  }
  else if(event.target.classList.contains('btn-decline')){
    drawModal.classList.add('hidden');
  }
})
//---------------Resign button--------------
resignBtn.addEventListener('click', () => {
  resignTextMessage.textContent = `${isWhiteTurn? 'White' : 'Black'} player, are you sure you want to resign?` 
  resignModal.classList.remove('hidden');
})
resignModal.addEventListener('click', ()=>{
  resignModal.classList.add('hidden');
})

resignModalBox.addEventListener('click', (event)=>{
  event.stopPropagation();
  if(event.target.classList.contains('btn-accept')){
    resignModal.classList.add('hidden');
    openGameOverModal(`${isWhiteTurn ? 'White' : 'Black'} player resigned, ${isWhiteTurn ? 'black': 'white' } wins!`);
  }
  else if(event.target.classList.contains('btn-decline')){
    console.log('not resigning, continue play');
    resignModal.classList.add('hidden');
  }
})
//--------------Game over modal--------------
function openGameOverModal(textMessage){
  gameOverTextMessage.textContent = textMessage;
  gameOverModal.classList.remove('hidden');
}

gameOverModal.addEventListener('click', ()=>{
  gameOverModal.classList.add('hidden');
})

gameOverModalBox.addEventListener('click', (event)=>{
  event.stopPropagation();
  if(event.target.classList.contains('close-modal-btn')){
    gameOverModal.classList.add('hidden');
  }
})

function changeTurnDisplay(){
  
  turnsDisplay.classList.toggle('white-text');
  turnsDisplay.textContent = `${isWhiteTurn ? 'White' : 'Black'} to play`
}



