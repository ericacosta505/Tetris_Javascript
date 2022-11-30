document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    let squares = Array.from(document.querySelectorAll('.grid div'))
    const ScoreDisplay = document.querySelector('#score')
    const LineDisplay = document.querySelector('#linesCleared')
    const LevelDisplay = document.querySelector('#level')
    const StartBtn = document.querySelector('#start-button')
    const PauseBtn = document.querySelector('#pause-button')
    let nextRandom = 0
    const width = 10
    let timerID
    let score = 0
    let linesCleared = 0
    let level = 0

    const colors = [
        'thistle',
        'plum',
        'violet',
        'orchid',
        'purple',
        'indigo',
        'slateblue'
    ]

    //Tretrominoes
    const lTetromino = [
        [1, width+1, width*2+1,2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ]

    const zTetromino = [
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1]
    ]

    const tTetromino = [
        [1, width, width+1,width+2],
        [1, width+1, width+2, width*2+1],
        [width, width+1, width+2,width*2+1],
        [1, width, width+1, width*2+1]
    ]

    const oTetromino = [
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1]
    ]

    const iTetromino = [
        [1,width+1,width*2+1,width*3+1],
        [width, width+1, width+2, width+3],
        [1,width+1,width*2+1,width*3+1],
        [width, width+1, width+2, width+3]
    ]
    
    const lrTetromino = [
        [0, 1, width+1, width*2+1],
        [width, width+1, width+2, width*2],
        [1, width+1, width*2+1, width*2+2],
        [2, width, width+1, width+2]
    ]

    const zrTetromino = [
        [width, width+1, width*2+1, width*2+2],
        [1, width, width+1, width*2],
        [width, width+1, width*2+1, width*2+2],
        [1, width, width+1, width*2]
    ]

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, lrTetromino, zrTetromino]

    let currentPosition = 4
    let currentRotation = 0
    
    //randomly select a tetromino and its first rotation
    let random = Math.floor(Math.random()*theTetrominoes.length)
    let current = theTetrominoes[random][currentRotation]

    //draw the tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino')
            squares[currentPosition + index].style.backgroundColor = colors[random]
        })
    }

    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    function moveDown() {

        if(!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))){
            undraw()
            currentPosition += width
            draw()
        }else{
            freeze()
        }
    }

    //freeze function
    function freeze() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            //start a new tetromino falling
            random = nextRandom
            nextRandom = Math.floor(Math.random() * theTetrominoes.length)
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4
            addScore()
            draw()
            displayShape()
            gameOver()
        }
    }

    //fast drop the tetromino
    function fastDrop(){
        while(!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))){
            undraw()
            currentPosition += width
            draw()
        }
        freeze()
    }

    //move the tetromino left, unless is at the edge or there is a blockage
    function moveLeft() {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
        if(!isAtLeftEdge) currentPosition -=1
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition +=1
        }
        draw()
    }

    //move the tetromino right, unless is at edge or there is a blockage
    function moveRight() {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
        if(!isAtRightEdge) currentPosition +=1
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -=1
        }
        draw()
    }

    function isAtRight() {
        return current.some(index=> (currentPosition + index + 1) % width === 0)  
    }
      
    function isAtLeft() {
        return current.some(index=> (currentPosition + index) % width === 0)
    }
      
    function checkRotatedPosition(P){
        P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
        if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
          if (isAtRight()){            //use actual position to check if it's flipped over to right side
            currentPosition += 1    //if so, add one to wrap it back around
            checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
            }
        }
        else if (P % width > 5) {
          if (isAtLeft()){
            currentPosition -= 1
          checkRotatedPosition(P)
          }
        }
    }

    //rotate the tetromino
    function rotate() {
        undraw()
        currentRotation ++
        if(currentRotation === current.length) {
            currentRotation = 0
        }
        current = theTetrominoes[random][currentRotation]
        checkRotatedPosition()
        draw()
    }

    //show next tetromino
    const displaySquares = document.querySelectorAll('.mini-grid div')
    const displayWidth = 4
    const displayIndex = 0

    //tetriminos without rotations
    
    const upNextTetrominoes = [
        [1, displayWidth+1, displayWidth*2+1,2],  //l tetromino
        [0, displayWidth, displayWidth+1, displayWidth*2+1], //z tetromino
        [1, displayWidth, displayWidth+1, displayWidth+2], //t tetromino
        [0, 1, displayWidth, displayWidth+1],    //o tetromino
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1], //i tetromino
        [0, 1, displayWidth+1, displayWidth*2+1],
        [displayWidth, displayWidth+1, displayWidth*2+1, displayWidth*2+2]
    ]

    //display shape in mini-grid
    function displayShape() {
        displaySquares.forEach (square => {
            square.classList.remove('tetromino')
            square.style.backgroundColor = ''
        })
        upNextTetrominoes[nextRandom].forEach (index => {
            displaySquares[displayIndex + index].classList.add('tetromino')
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
        })
    }

    function resetBoard(){
        //reset board
        document.getElementById('container').innerHTML = ''
        populateObjects()
        //reset score
        ScoreDisplay.innerHTML = 0
        //lines
        LineDisplay.innerHTML = 0
        //levels
        LevelDisplay.innerHTML = 0
    }

    function control(e) {
        if(e.keyCode === 37) {
            moveLeft()
        } else if (e.keyCode === 38){
            rotate()
        } else if (e.keyCode === 39){
            moveRight()
        }else if (e.keyCode === 40){
            moveDown()
        }else if(e.keyCode === 32){
            fastDrop()
        }
    }

    //add functionality to the button
    StartBtn.addEventListener('click', ()=> {
        const audio = document.getElementById('audio')
        audio.play()
        document.querySelector('#start-button').style.display = 'none'
        document.querySelector('#pause-button').style.display = 'block'
        document.addEventListener('keyup', control)
        if(timerID) {
            clearInterval(timerID)
            timerID = null
        } else {
            draw()
            timerID = setInterval(moveDown, 1000)
            nextRandom = Math.floor(Math.random()*theTetrominoes.length)
            displayShape()
        }
    })

    PauseBtn.addEventListener('click', ()=> {
        const audio = document.getElementById('audio')
        audio.pause()
        document.removeEventListener('keyup', control)
        document.querySelector('#start-button').style.display = 'block'
        document.querySelector('#pause-button').style.display = 'none'
        if(timerID) {
            clearInterval(timerID)
            timerID = null
        } else {
            draw()
            timerID = setInterval(moveDown, 1000)
            nextRandom = Math.floor(Math.random()*theTetrominoes.length)
            displayShape()
        }
    })

    //add score
    function addScore() {
        for(let i = 0; i < 199; i +=width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
            if(row.every(index => squares[index].classList.contains('taken'))) {
                score +=10
                ScoreDisplay.innerHTML = score
                linesCleared +=1
                LineDisplay.innerHTML = linesCleared

                if(linesCleared % 2 === 0){
                    level +=1
                    LevelDisplay.innerHTML = level
                }

                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('tetromino')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    //game  over
    function gameOver() {
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            clearInterval(timerID)
            document.querySelector('#pause-button').style.display = 'none'
            document.querySelector('#start-button').style.display = ''
            alert('Game Over! Your score was ' + score + '!')
            document.location.reload(true)
        }
    }
})

function populateObjects(){
    const container = document.getElementById('container')
    const gridContainer = document.createElement('div')
    gridContainer.className = 'grid'
    const miniGrid = document.createElement('div')
    miniGrid.className = 'mini-grid'
    const gridTiles = []
    const gridTakenTiles = []
    const miniGridTiles = []
    for(i = 0; i < 200 ; i++){
        const tile = document.createElement('div')
        gridContainer.appendChild(tile)
    }
    for(i = 0; i < 10 ; i++){
        const tile = document.createElement('div')
        tile.className = 'taken'
        gridContainer.appendChild(tile)
    }
    for(i = 0; i < 16 ; i++){
        const tile = document.createElement('div')
        miniGrid.appendChild(tile)
    }
    container.appendChild(gridContainer)
    container.appendChild(miniGrid)
}