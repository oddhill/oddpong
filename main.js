// RequestAnimFrame: a browser API for getting smooth animations.
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function( callback ){
      return window.setTimeout(callback, 1000 / 60);
    };
})();

window.cancelRequestAnimFrame = ( function() {
  return window.cancelAnimationFrame         ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame    ||
    window.oCancelRequestAnimationFrame      ||
    window.msCancelRequestAnimationFrame     ||
    clearTimeout
} )();

window.onresize = function(event) {
  game();
};

function game() {
  // Initialize canvas and required variables.
  var canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d"), // Create canvas context.
      W = window.innerWidth, // Window's width.
      H = window.innerHeight, // Window's height.
      ball = {}, // Ball object.
      paddles = [2], // Array containing two paddles.
      mouse = {}, // Mouse object to store it's current position.
      points = 0, // Varialbe to store points.
      fps = 60, // Max frames per second.
      flag = 0, // Flag variable which is changed on collision.
      startBtn = {}, // Start button object.
      over = 1, // Flag varialbe, cahnged when the game is over.
      init, // Variable to initialize animation.
      paddleHit,
      speedX = 10, // Default horisontial ball speed.
      speedY = 20, // Default vertical ball speed.
      initPosX = W / 2, // Default ball x position.
      initPosY = H / 2, // Default ball y position.
      xDir = Math.round(Math.random()),
      yDir = Math.round(Math.random());

  // Add mousemove and mousedown events to the canvas.
  canvas.addEventListener("mousemove", trackPosition, true);
  canvas.addEventListener("mousedown", btnClick, true);

  // Initialise the collision sound.
  collision = document.getElementById("collide");

  // Set the canvas's height and width to full screen.
  canvas.width = W;
  canvas.height = H;

  // Function to paint canvas.
  function paintCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, W, H);
  }

  // Function for creating paddles.
  function Paddle(pos) {
    // Height and width.
    this.h = 10;
    this.w = canvas.width / 5;

    // Paddle's position.
    this.x = W / 2 - this.w / 2;
    this.y = (pos == "top") ? 0 : H - this.h;
  }

  // Push two new paddles into the paddles[] array.
  paddles.push(new Paddle("bottom"));
  paddles.push(new Paddle("top"));

  // Ball object.
  ball = {
    x: initPosX,
    y: initPosY,
    r: 20,
    c: "white",
    vx: speedX,
    vy: speedY,

    // Function for drawing ball on canvas.
    draw: function() {
      ctx.beginPath();
      ctx.fillStyle = this.c;
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = 'black';
      ctx.arc(this.x, this.y, this.r / 2, 0, Math.PI * 2, false);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = this.c;
      ctx.arc(this.x + 27, this.y + 14, this.r / 3.5, 0, Math.PI * 2, false);
      ctx.fill();
    }
  };

  // Start Button object.
  startBtn = {
    w: 200,
    h: 100,
    x: W / 2,
    y: H / 2,
    r: 60,

    draw: function() {
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
      ctx.arc(this.x + 72, this.y + 43, this.r / 3.5, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = 'black';
      ctx.arc(this.x, this.y, this.r / 2, 0, Math.PI * 2, false);
      ctx.fill();
    }
  };

  // Draw everything on canvas.
  function draw() {
    paintCanvas();
    for (var i = 0; i < paddles.length; i++) {
      p = paddles[i];

      ctx.fillStyle = "white";
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }

    ball.draw();
    update();
  }

  // Function to increase speed after every 5 points.
  function increaseSpd() {
    if (points % 4 == 0) {
      if (Math.abs(ball.vy) < 40) {
        ball.vx += (ball.vx < 0) ? -1 : 1;
        ball.vy += (ball.vy < 0) ? -2 : 2;
      }
      // Decrease paddle size.
      for (var i = 0; i < paddles.length; i++) {
        p = paddles[i];
        if (p.w > 20) {
          p.w = p.w - 20;
        }
      }
    }
  }

  // Track the position of mouse cursor.
  function trackPosition(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  }

  // Function to update positions, score and everything.
  // Basically, the main game logic is defined here.
  function update() {

    // Move the paddles on mouse move.
    if (mouse.x && mouse.y) {
      for (var i = 1; i < paddles.length; i++) {
        p = paddles[i];
        p.x = mouse.x - p.w / 2;
      }
    }

    // Move the ball.
    xDir == 1 ? ball.x -= ball.vx : ball.x += ball.vx;
    yDir == 1 ? ball.y += ball.vy : ball.y -= ball.vy;

    // Collision with paddles.
    p1 = paddles[1];
    p2 = paddles[2];

    // If the ball strikes with paddles,
    // invert the y-velocity vector of ball,
    // increment the points, play the collision sound,
    // save collision's position so that sparks can be
    // emitted from that position, set the flag variable,
    // and change the multiplier.
    if (collides(ball, p1)) {
      collideAction(ball, p1);
    }
    else if (collides(ball, p2)) {
      collideAction(ball, p2);
    }

    else {
      // Collide with walls, If the ball hits the top/bottom,
      // walls, run gameOver() function.
      if (ball.y + ball.r > H) {
        ball.y = H - ball.r;
        gameOver(true);
      }
      else if (ball.y < 0) {
        ball.y = ball.r;
        gameOver(true);
      }

      // If ball strikes the vertical walls, invert the
      // x-velocity vector of ball.
      if (ball.x + ball.r > W) {
        ball.vx = -ball.vx;
        ball.x = W - ball.r;
      }
      else if (ball.x -ball.r < 0) {
        ball.vx = -ball.vx;
        ball.x = ball.r;
      }
    }
  }

  // Function to check collision between ball and one of
  // the paddles.
  function collides(b, p) {
    if (b.x + ball.r >= p.x && b.x - ball.r <=p.x + p.w) {
      if (b.y >= (p.y - p.h) && p.y > 0) {
        paddleHit = 1;
        return true;
      }
      else if (b.y <= p.h && p.y == 0) {
        paddleHit = 2;
        return true;
      }
      else {
        return false;
      }
    }
  }

  // Do this when collides == true.
  function collideAction(ball, p) {
    ball.vy = -ball.vy;

    if (paddleHit == 1) {
      ball.y = p.y - p.h;
    }
    else if (paddleHit == 2) {
      ball.y = p.h + ball.r;
    }

    points++;
    increaseSpd();

    if (collision) {
      if (points > 0) {
        collision.pause();
        collision.currentTime = 0;
        collision.play();
      }
    }
  }

  // Function to run when the game overs.
  function gameOver(text) {
    // Reset ball position.
    ball.x = initPosX;
    ball.y = initPosY;
    draw();

    // Random ball direction.
    xDir = Math.round(Math.random());
    yDir = Math.round(Math.random());

    // Stop the Animation.
    cancelRequestAnimFrame(init);

    // Set the over flag.
    over = 1;

    // Show the start button.
    startBtn.draw();

    if (text) {
      // Show points.
      ctx.font = "30px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.fillText(points, W/2, H/2 + 100);
    }
  }

  // Function for running the whole animation.
  function animloop() {
    init = requestAnimFrame(animloop);
    draw();
  }

  // On start button click.
  function btnClick(e) {
    if (over == 1) {
      // Variables for storing mouse position on click.
      var mx = e.pageX,
          my = e.pageY;

      // Click start button.
      if (mx >= startBtn.x && mx <= startBtn.x + startBtn.w) {
        points = 0;
        ball.vx = speedX;
        ball.vy = speedY;
        animloop();
        over = 0;

        // Reset paddles.
        for (var i = 0; i < paddles.length; i++) {
          p = paddles[i];
          p.w = canvas.width / 5;
        }
      }
    }
  }

  // Show the start screen.
  gameOver(false);
  draw();
  startBtn.draw();
}

game();
