// key codes for left, right arrow keys and spacebar
const KEY_RIGHT = 39;
const KEY_LEFT = 37;
const KEY_SPACE = 32;

// set game dimensions
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// state object that holds current state of the game
const STATE = {
    // x and y representing current position of player's ship
    x_pos: 0,
    y_pos: 0,
    // width of spaceship
    spaceship_width: 50,
    // control key presses
    move_left: false,
    move_right: false,
    shoot: false,
    enemies: [],
    enemyLasers: [],
    enemy_cooldown: 0,
    enemy_width: 50,
    number_of_enemies: 16,
    lasers: [],
    cooldown: 0,
    gameOver: false,
}

// GENERAL FUNCTIONS
// sets position of an html element using translate
function setPosition($element, x, y){
    $element.style.transform =`translate(${x}px, ${y}px)`;
}

// scale ship image to the size we want according to the size of the window
function setSize($element, width){
    $element.style.width = `${width}px`;
    $element.style.height ='auto';
}

// set player boundaries
function bound(x) {
    // if player's x position is greater than the game screen, 
    // set player's x position to max 
    if(x >= GAME_WIDTH-STATE.spaceship_width) {
        STATE.x_pos = GAME_WIDTH-STATE.spaceship_width;
        return STATE.x_pos;
    // if player's x position is less than or equal to 0
    // set to 0
    } if (x <= 0) {
        STATE.x_pos = 0;
        return STATE.x_pos;
    // when x position is normal, return x 
    } else {
        return x;
    }
}

function deleteLaser(lasers, laser, $laser) {
    const index = lasers.indexOf(laser); // find index of laser in array
    lasers.splice(index, 1); // remove laser from array
    $container.removeChild($laser); // remove HTML element from the DOM
}

function collideRect(rect1, rect2) {
    return!(rect2.left > rect1.right ||
        rect2.right < rect1.left ||
        rect2.top > rect1.bottom ||
        rect2.bottom < rect1.top);
}


// PLAYER FUNCTIONS
// creates player's ship
function createPlayer($container){ 
    // sets initial position to bottom center of game area
    STATE.x_pos=GAME_WIDTH / 2; // updates STATE constants
    STATE.y_pos=GAME_HEIGHT - 50;

    // append position to our container (the spaceship png)
    const $player=document.createElement("img"); // create and store img in player variable
    $player.src="img/spaceship.png"; // set player using src to image
    $player.className="player"; // set player variable class name
    $container.appendChild($player); // append player to an html container
    setPosition($player, STATE.x_pos, STATE.y_pos); // call setPosition function, apply to ship 
    setSize($player, STATE.spaceship_width); // call setSize function, apply to ship
}

// update player or laser position based on keys pressed
function updatePlayer(){
    if(STATE.move_left){
        STATE.x_pos -= 3;
    } if(STATE.move_right){
        STATE.x_pos += 3;
    } if(STATE.shoot && STATE.cooldown == 0) {
        createLaser($container, STATE.x_pos - STATE.spaceship_width/2, STATE.y_pos);
        STATE.cooldown = 10;
    }  
    const $player = document.querySelector(".player");
    setPosition($player, bound(STATE.x_pos), STATE.y_pos-15);
    if (STATE.cooldown > 0) {
        STATE.cooldown -= 0.5;
    }
}

// player laser function
function createLaser($container, x, y) {
    // create laser image
    const $laser = document.createElement("img");
    // set laser image
    $laser.src = "img/laser.png";
    // set class name for laser
    $laser.className = "laser";
    // append laser element to container
    $container.appendChild($laser);
    // create laser object with initial position (wherever it is called)
    const laser = {x, y, $laser};
    // add laser object to the lasers array
    STATE.lasers.push(laser);
    // set initial position of the laser
    setPosition($laser, x, y);

    // laser sound effect
    const laserSound = document.getElementById("laserSound");
    laserSound.play();
}

// move laser up the screen
function updateLaser($container) {
    // get laser array
    const lasers = STATE.lasers;
    // iterate over each laser 
    for(let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y -= 2; // move laser upwards (y coordinate decreases)
        if (laser.y < 0) { // if laser flies off screen
            deleteLaser(lasers, laser, laser.$laser); // delete laser
        }
        setPosition(laser.$laser, laser.x, laser.y); // update position in the DOM
        const laser_rectangle = laser.$laser.getBoundingClientRect();
        const enemies = STATE.enemies;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            const enemy_rectangle = enemy.$enemy.getBoundingClientRect();
            if (collideRect(enemy_rectangle, laser_rectangle)) {
                // laser element is deleted
                deleteLaser(lasers, laser, laser.$laser);
                // enemy is deleted
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
                $container.removeChild(enemy.$enemy);
                // explosion sound effect plays
                const explosion = document.getElementById("explosion");
                explosion.play();
            }
        }
    }
}

// ENEMIES
// create enemy
function createEnemy($container, x, y) {
    const $enemy = document.createElement("img");
    $enemy.src = "img/ufo.png";
    $enemy.className = "enemy";
    $container.appendChild($enemy);
    const enemy_cooldown = Math.floor(Math.random()*100);
    const enemy = {x, y, $enemy, enemy_cooldown};
    STATE.enemies.push(enemy);
    setSize($enemy, STATE.enemy_width);
    setPosition($enemy, x, y);
}

// move enemies
function updateEnemies($container) {
    const dx = Math.sin(Date.now()/1000)*40;
    const dy = Math.cos(Date.now()/1000)*30;
    const enemies = STATE.enemies;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        var a = enemy.x + dx;
        var b = enemy.y + dy;
        setPosition(enemy.$enemy, a, b);
        if (enemy.enemy_cooldown <= 0) {
            createEnemyLaser($container, a, b);
            enemy.enemy_cooldown = Math.floor(Math.random()*50)+100;
        } 
        enemy.enemy_cooldown -= 0.2;
    }
}

// create rows of enemies
function createEnemies($container) {
    for(var i = 0; i <= STATE.number_of_enemies/2; i++){
      createEnemy($container, i*80, 100);
    } for(var i = 0; i <= STATE.number_of_enemies/2; i++){
      createEnemy($container, i*80, 180);
    }
}

// create enemy lasers
function createEnemyLaser($container, x, y) {
    const $enemyLaser = document.createElement("img");
    $enemyLaser.src = "img/enemyLaser.png";
    $enemyLaser.className = "enemyLaser";
    $container.appendChild($enemyLaser);
    const enemyLaser = {x, y, $enemyLaser};
    STATE.enemyLasers.push(enemyLaser);
    setPosition($enemyLaser, x, y);
}

// control enemy laser trajectory and game over state
function updateEnemyLaser() {
    const enemyLasers = STATE.enemyLasers;
    for (let i = 0; i < enemyLasers.length; i++) {
        const enemyLaser = enemyLasers[i];
        enemyLaser.y += 2;
        if (enemyLaser.y > GAME_HEIGHT-30) {
            deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
        }
        const enemyLaser_rectangle = enemyLaser.$enemyLaser.getBoundingClientRect();
        const spaceship_rectangle = document.querySelector(".player").getBoundingClientRect();
        if (collideRect(spaceship_rectangle, enemyLaser_rectangle)) {
            STATE.gameOver = true;
        }
        setPosition(enemyLaser.$enemyLaser, enemyLaser.x + STATE.enemy_width/2, enemyLaser.y+15);
    }
}

// KEY PRESSES
function KeyPress(event) {
    if (event.keyCode === KEY_RIGHT){
        STATE.move_right = true;
        console.log("right key has been pressed")
    } else if (event.keyCode === KEY_LEFT){
        STATE.move_left = true;
        console.log("left key has been pressed")
    } else if (event.keyCode === KEY_SPACE){
        STATE.shoot = true;
    } else if (event.key === "p" || event.key === "P") {
        pauseGame();
    }
}

function KeyRelease(event){
    if (event.keyCode === KEY_RIGHT){
        STATE.move_right = false;
    } else if (event.keyCode === KEY_LEFT){
        STATE.move_left = false;
    } else if (event.keyCode === KEY_SPACE){
        STATE.shoot = false;
    }
}

// pause game when player presses P
function pauseGame() {
    // Pause the game and show the pause screen
    console.log("Game paused");
    STATE.paused = true;
    soundtrack.pause();
    document.getElementById("pauseScreen").style.display = "block";
}

// resume game
function resumeGame() {
    // Resume the game and hide the pause screen
    console.log("Game resumed");
    STATE.paused = false;
    soundtrack.play();
    document.getElementById("pauseScreen").style.display = "none";
}


// MAIN UPDATE FUNCTION
function update() {
    if (!STATE.paused) {
        updatePlayer(); // update player's position
        updateLaser($container); // update laser
        updateEnemies($container);
        updateEnemyLaser();

        window.requestAnimationFrame(update); // repaint the game window
    }

    if (STATE.gameOver) {
        document.querySelector(".lose").style.display = "block";
        gameOver.play();

        soundtrack.pause();
        soundtrack.currentTime = 0;
    } else if (STATE.enemies.length == 0) {
        document.querySelector(".win").style.display = "block";
        levelClear.play();

        soundtrack.pause();
        soundtrack.currentTime = 0;
    }
}


// INIT. GAME
// select html element with class main, store in container
const $container = document.querySelector(".main");
// call createPlayer and pass container as a variable
createPlayer($container);
createEnemies($container);

// play music
const soundtrack = document.getElementById("soundtrack");
soundtrack.play();

// EVENT LISTENERS
window.addEventListener("keydown", KeyPress);
window.addEventListener("keyup", KeyRelease);

update();