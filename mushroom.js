
// Mushroom simulator

window.onload = ()=> {
    console.log("document loaded");
    setup();
    main();
}


let board, 
    canvas, 
    ctx, // 2d context
    w, // width of canvas
    h, // height of canvas
    l, // Pixel length of cells
    X, // #Cells in x direction
    Y, // #Cells in y direction
    D0, // lower angle
    D1, // higher angle
    hue_init = Math.random()*360, // intial hue
    mutationAmount = 5,
    mutationProbability = 0.1,
    stepCounter, // label displaying _count
    _count;

let updating = false;

let setup = ()=> {
    // setup buttons
    document.getElementById('start').onclick = onClickStart;
    document.getElementById('restart').onclick = onClickRestart;
    document.getElementById('mutationProbability').onchange = onSliderChange;
    document.getElementById('mutationAmount').onchange = onSliderChange;
    document.getElementById('angle1').onchange = onSliderChange;
    document.getElementById('angle2').onchange = onSliderChange;
    document.getElementById('selectWalls').onchange = onWallSelection;
    document.getElementById('selectHues').onchange = onHueSelection;

    stepCounter = document.getElementById('stepCounter');
    
    // setup canvas
    canvas = document.getElementById('board')
    ctx = canvas.getContext("2d")

    w = 500
    h = 500
    l = 5

    X = parseInt(w/l)
    Y = parseInt(h/l)
    D0 = 30
    D1 = 60
    mutation = 0.1

    _count = 0

    canvas.width = w
    canvas.height = h

    // setup board
    board = new Object()
    board.data = [] // data is a 2d matrix in which each cell is a color vector [hue, sat, lum, isWall]

    
    for (let x = 0; x < X; x++) {
        let row = []
        for (let y = 0; y < Y; y++) {
    
            let hue = x> X/3 ? Math.random()*360 : hue_init;
            hue = hue_init;
            row.push([hue, 1, 0.79, false]) // [hue, sat, lum, isWall?]
        }

        board.data.push(row)
    }
}






let main = ()=>{
    draw();
}


let draw = ()=> {
    for (let y=0; y<Y; y++) {
        for (let x=0; x<X; x++) {
            let fillStyle = "hsl("+board.data[x][y][0]+", 100%, ";
            fillStyle += board.data[x][y][3] ? "0%)" : "79%)";

            ctx.fillStyle = fillStyle;
            ctx.fillRect( x*l, y*l, l, l );
        }
    }
}


let update = ()=>{
    if (!updating) return;
    _count += 1
    stepCounter.innerText = '#'+_count
    let next = [] // next board state

    for (let x=0; x<X; x++) {
        next.push([])
        for (let y=0; y<Y; y++) {
            next[x].push([board.data[x][y][0]])
    }}

    for (let x=0; x<X; x++) {
        let endX = (x==X-1)

        for (let y=0; y<Y; y++) {
            let endY = (y==Y-1)

            let f = board.data[x][y] // field 1
            if (f[3]) continue; // skip cell if it's a wall

            if (!endX) {
                let f2 = board.data[x+1][y] // field 2
                let result = f2[3] ? 0 : checkEat(f, f2); // check if f2 is wall
                switch( result){
                    case 1 : 
                        next[x+1][y][0] = f[0]
                        break;
                    case -1:
                        next[x][y][0] = f2[0]
                        break;
                }

            }

            if (!endY) {
                let f2 = board.data[x][y+1] // field 2
                let result = f2[3] ? 0 : checkEat(f, f2); // check if f2 is wall
                switch( result){
                    case 1 : 
                        next[x][y+1][0] = f[0]
                        break;
                    case -1:
                        next[x][y][0] = f2[0]
                        break;
                }
            }

    }}

    for (let x=0; x<X; x++) {
        for (let y=0; y<Y; y++) {
            board.data[x][y][0] = next[x][y][0]
            if (Math.random() < mutationProbability) { board.data[x][y][0] = (board.data[x][y][0]+(Math.random()-1)*mutationAmount)%360 }
            // if (Math.random() < mutationProbability) { board.data[x][y][0] = (board.data[x][y][0]-Math.random()*mutationAmount)%360 }
    }}
}

let rule = ['simple','minDifference'][1]; 

let checkEat = (f1, f2)=>{
    let d = (f2[0] - f1[0])%360

    switch (rule) {
        case 'minDifference':
            if ((d > D0 && d <= D1) || (d > -360+D0 && d <= -360+D1)) return 1;
            else if ((d < -D0 && d >= -D1) || (d < 360-D0 && d >= 360-D1)) return -1;
            else return 0;
            break;
        
        case 'simple':
            return d >0 ? 1 : -1;
            break
    }
    // if ((d > D0 && d <= D) || (d > -360+D0 && d <= -360+D)) { return 1 }
    // if ((d < -D0 && d >= -D) || (d < 360-D0 && d >= 360-D)) { return -1 }
    // return 0
    // if (d == 0 || ) { return 0}
    let result = d > 0 ? 1: -1
    let r = Math.random() <0.5 ? result : 0

    
    // if (Math.abs(d) < D0) {
    //     if (Math.random() < 0.1) { return r}
    // }

    if (Math.abs(d) > D) { 
       
        if (Math.random() < 0.1) { return r}
    }
    else {
        if (Math.random() > Math.abs(d)/D ) { return result}
        else { return r}
    }

    
}

let changeHue = (hue)=> {
    for (let x = 0; x < X; x++) {
        for (let y = 0; y < Y; y++) {
            switch(hue){
                case 'hue_init':
                    board.data[x][y][0] = hue_init;
                    break;
                case 'random':
                    board.data[x][y][0] = Math.random()*360;
                    break;
                case 'gradient':
                    board.data[x][y][0] = (x+y)%360;
                    break;
            }
        }
    }

}// change hue


let changeWall = (wallType)=>{
    console.log('wall change ', wallType)
    let isWall = false;
    for (let x = 0; x < X; x++) {
        for (let y = 0; y < Y; y++) {

            isWall = false
            switch(wallType){
                case 'noWalls':
                    isWall = false
                    break;
                case 'squares':
                    isWall = x%parseInt(X/3)==0 || y%parseInt(Y/3)==0
                    break;
                case 'squares_holed':
                    isWall = x%parseInt(X/3)==0 || y%parseInt(Y/3)==0
                    isWall = y%30==0 && y!=0 && y!=Y-1 && x!=0 && x != X-1 ? false : isWall;
                    break;
                default:
                    isWall = false;
            }
            
            board.data[x][y][3] = isWall;
        }
    }
}// changeWall

let onClickStart = (e)=> {
    updating = !updating;
    e.target.innerText = updating ? 'Pause' : 'Start';
}

let onClickRestart = ()=>{
    location.reload();
}

let onWallSelection = (e)=>{
    changeWall(e.target.value)
}

let onHueSelection = (e)=> {
    changeHue(e.target.value)
}

let onSliderChange = (e)=>{
    let slider = e.target;
    let v = parseInt(slider.value);
    switch (slider.id) {
        case 'mutationProbability':
            mutationProbability = v;
            break;
        case 'mutationAmount':
            mutationAmount = v;
            break;
        case 'angle1':
        case 'angle2':
            let v1 = document.getElementById('angle1').value;
            let v2 = document.getElementById('angle2').value;
            D0 = Math.min(v1, v2);
            D1 = Math.max(v1, v2);
            break;
    }
}

var intervalId = window.setInterval(function(){
    // console.log('test')
    update()
    main()
  }, 100);