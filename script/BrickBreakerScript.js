$(function () {
    //On Clicking on start screen the game should start
    $('#startScreen').on('click',function () {
        $(this).remove();
        startGame();
    });

    $('#restart').click(function () {
        $(this).hide();
        startGame();
    });

    var prev = -1;
    var now = -1;
    $(document).on('click touchend', function (ev) {
        console.log(new Date().getTime() + " " + ev.target.id);
        if (prev == -1) {
            prev = new Date().getTime();
        } else {
            now = new Date().getTime();
            if ((now - prev) < 500) { //console.log('dTap found = ' + (now - prev));
                ev.preventDefault();
            }
            prev = now;
        }
        //console.log('clicked');
    }); 
});

function startGame() {
    //all the things of arena
    var arena = {};
    arena.width = parseInt($("#arena").css("width"));
    arena.height = parseInt($("#arena").css("height"));
    arena.skyX = 0;  //it can increase upto 0 
    arena.skyY = 0; //it can increase upto 0
    arena.speedY = 2;
    //alert("arena height = " + arena.height + " and arena width = " + arena.width);


    //all the things related to player
    var player = {};
    player.width = parseInt($("#player").css("width"));
    player.height = parseInt($("#player").css("height"));
    player.top = arena.height; // - player.height;
    player.left = arena.width / 2 + 30;
    player.shift = 5;
    player.score = 0;
    //alert("player top = " + player.top + " and player left = " + player.left);

    //all the things related to bullet
    var bullet = {};
    bullet.width = parseInt($("#bullet").css("width"));
    bullet.height = parseInt($("#bullet").css("height"));
    bullet.left = player.left + player.width/2 - bullet.width / 2;
    bullet.top = player.top - bullet.height;
    bullet.status = "sleeping";

    //all the things related to bricks
    var bricks = {};
    bricks.array = new Array();
    bricks.shift = 40;
    bricks.turn = 1;    // 1=left, 2=right, 3=right, 4=left 5=down

    var interval1; //= setInterval(render, 1000 / 60);
    var interval2; //= setInterval(drawBricks, 1500);

    //lets initiate all array places with "y"... signifying that Bricks are alive...
    for (var i = 1; i <= 20; i++)
    {
        bricks.array[i] = "y";
    }

    //detect key press
    $(document).keydown(function (e) {
        //alert(e.keyCode);

        switch (e.keyCode) {
            case 37:        //Left Arrow Pressed
                player.moveLeft();
                break;
            case 39:        //Right Arrow Pressed
                player.moveRight();
                break;
            case 32:        // space to fire
                bullet.fire();
        }
    });


    player.moveLeft = function () {console.log('player.moveLeft called');
        player.left = player.left - player.shift;
        if (player.left < 0) { player.left = 0;}
    };

    player.moveRight = function () {console.log('player.moveRight called');
        player.left = player.left + player.shift;
        if (player.left > (arena.width - player.width)) { player.left = arena.width - player.width; }
    };

    bullet.fire = function () {console.log(bullet.fire);
        if (bullet.status === "sleeping") {                    
            bullet.left = player.left + player.width / 2 - bullet.width / 2;
            bullet.top = player.top - bullet.height;
            bullet.status = "running";
        }
    };

    $('#moveLeft').click(function () {
        player.moveLeft();
    });

    $('#moveRight').click(function () {
        player.moveRight();
    });

    $('#leftFireButton, #rightFireButton').click(function () {
        bullet.fire();
    });

    //call init
    init();
    
    function init()
    {   
        $('#Scoreboard, button:not(#restart)').show();
        $('#Scoreboard').html('SCORE : 0').css('height','initial');    
        createCharacters();
        //init variables
        bricks.width = parseInt($(".brickSize").css("width"));
        bricks.height = parseInt($(".brickSize").css("height"));

        //initialize player position
        $("#player").css({
            display: 'block',
            top: player.top + "px",
            left: player.left + "px"
        }).animate({
            top: (player.top - player.height) + 'px'
        },1200);
        player.top -= player.height;

        //initialize bullet position
        $("#bullet").css({
            top: bullet.top + "px",
            left: bullet.left + "px"
        });
        

        //scroll background stars
        scrollStars();

        //start animation
        interval1 = setInterval(render, 1000/60);
        interval2 = setInterval(drawBricks, 1500);
    }

    //createCharacters() function will create enemy blocks and add them to DOM
//var brick = 'brick';
function createCharacters() {
    //if old characters already exist, remove them 1st
    if($('.brickSize').length != 0) {
        $('.brickSize').remove();
    }
    
    var brickTop = 40;
    var brickLeft = 80;
    var brickID = 0;
    var characterString = '';
    // i=rows j=columns
    for (var i=1; i<=4; i++) {
        for (var j=1; j<=5; j++) {
            brickID++;
            brickLeft = 80*j;
            characterString += '<div id="brick' + brickID +'" class="brickSize" style="top:'+brickTop+'px;left:'+brickLeft+'px;"></div>';
        }
        brickTop += 80;
    }
    $('#arena').append(characterString);    
}

    //this function will scroll the background to give an illussion of moving stars
    var bgPosition;
    function scrollStars () {
        arena.skyY += arena.speedY; 
        bgPosition = arena.skyX + 'px ' + arena.skyY + 'px';
        $('#arena').css('background-position', bgPosition);
        /*
        $('#arena').css({
            'background-position-x' : arena.skyX + 'px'
        });
        */

        arena.scrollStarAnimID = window.requestAnimationFrame(scrollStars);
    }

    
    function render()
    {
        drawPlayer();
        drawBullet();
        detectCollission();
    }

    function detectCollission()
    {
        var top;
        var left;
        var BrickID;

        for (var i = 1; i <= 20; i++)
        {
            if (bricks.array[i] === "y")        // if that brick is alive
            {
                //for Brick no. i check if any collission has occurred...
                BrickID = "#brick" + i;
                top = parseInt($(BrickID).css("top"));
                left = parseInt($(BrickID).css("left"));
                //console.log(top + ' ' + left);
                //check if Brick rectangle contains Bullet rectangle

                if(bullet.status === "running" &&  left<=bullet.left && (left+bricks.width >= bullet.left + bullet.width) && top <= bullet.top && (top+bricks.height >= bullet.top+bullet.height))
                {
                    bullet.status = "sleeping";
                    $("#bullet").css({ "display": "none" });
                    bricks.array[i] = "n";
                    $(BrickID).fadeOut();
                    $("#flyingPoint").css({
                        "top": top,
                        "left": left,
                        "display": "block"
                    }).animate({
                        "top": 0
                    }).fadeOut();
                    player.score += 100;
                    $("#Scoreboard").html("Score : " + player.score);
                    if (player.score == 2000)
                    {
                        clearInterval(interval1);
                        clearInterval(interval2);
                        $("#Scoreboard").append("<br/>CONGRATULATION");
                        $("#Scoreboard").animate({
                            "height": 120 + "px"
                        });
                        window.cancelAnimationFrame(arena.scrollStarAnimID);                        
                        $('button').hide();
                        $('#restart').show();                 
                    }
                }
                else if (top + bricks.height > player.top) // Bricks Touching Player??? Then Game Over
                {
                    $(".brickSize").fadeOut();
                    //alert("Game Over...");
                    clearInterval(interval1);
                    clearInterval(interval2);
                    $("#Scoreboard").append("<br/> GAME OVER");
                    $("#Scoreboard").animate({
                        "height": 120 + "px"
                    });
                    window.cancelAnimationFrame(arena.scrollStarAnimID);
                    $('button').hide();
                    $('#restart').show();
                }
            }

        }
    }

    var oldval = 0;
    function drawPlayer()
    {
        //testing
        //if(player.left !== oldval) {console.log('old='+oldval+" new="+player.left);oldval = player.left;}

        $("#player").css({ "left": player.left + "px" });
    }

    function drawBullet()
    {
        if (bullet.status === "running" && bullet.top > 0) {
            bullet.top = bullet.top - 15;
            $("#bullet").css({
                "display": "block",
                "top": bullet.top,
                "left": bullet.left
            });
        }
        else {
            bullet.status = "sleeping";
            $("#bullet").css({ "display": "none" });
        }
    }

    function drawBricks()
    {
        //alert("Drawing Bricks");

        
        //draw all bricks
        for (var i = 1; i <= 20; i++)
        {
            if (bricks.array[i] === "y")        // if that brick is alive
            {
                var BrickID = "#brick" + i;
               
                if (bricks.turn == 1 || bricks.turn == 4)       //Shift towards Left
                {
                    var Newleft = parseInt($(BrickID).css("left")) - bricks.shift;
                    $(BrickID).css({ "left": Newleft });
                }
                else if (bricks.turn == 2 || bricks.turn == 3)  //Shift towards Right
                {
                    var Newleft = parseInt($(BrickID).css("left")) + bricks.shift;
                    $(BrickID).css({ "left": Newleft });
                }
                else if (bricks.turn == 5)                      // Shift Downwards
                {
                    var NewTop = parseInt($(BrickID).css("top")) + bricks.shift;
                    $(BrickID).css({ "top": NewTop });         
                }
            }
        }

        //Increase Bricks Turn
        bricks.turn++;
        if (bricks.turn == 6) { bricks.turn = 1;}
    }
    
}