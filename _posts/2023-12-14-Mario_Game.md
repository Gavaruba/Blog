---
layout: base
title: Mario game
description: Early steps in adding levels to an OOP Game. This includes basic animations left-right-jump, multiple backgrounds, and simple callback to terminate each level.
type: ccc
courses: { csse: {week: 14}, csp: {week: 14}, csa: {week: 14} }
image: /images/platformer/backgrounds/hills.png
---
<style>
    #gameBegin, #controls, #gameOver #settings {
        position: relative;
        z-index: 2; /*Ensure the controls are on top*/
    }
    .sidenav {
      position: fixed;
      height: 100%; /* 100% Full-height */
      width: 0px; /* 0 width - change this with JavaScript */
      z-index: 3; /* Stay on top */
      top: 0; /* Stay at the top */
      left: 0;
      overflow-x: hidden; /* Disable horizontal scroll */
      padding-top: 60px; /* Place content 60px from the top */
      transition: 0.5s; /* 0.5 second transition effect to slide in the sidenav */
      background-color: black;
    } 
    #toggleCanvasEffect, #background, #platform {
    animation: fadein 5s;
    }
  #startGame {
    animation: flash 0.5s infinite;
  }

  @keyframes flash {
    50% {
      opacity: 0;
    }
  }

  @keyframes fadeout {
    from {opacity: 1}
    to {opacity: 0}
  }

  @keyframes fadein {
    from {opacity: 0}
    to {opacity: 1}
  }
</style>
<!-- Prepare DOM elements -->
<!-- Wrap both the canvas and controls in a container div -->
<div id="canvasContainer">
<button id="leaderboardButton">Leaderboard</button>
  <div id="gameBegin" hidden>
        <button id="startGame">Start Game</button>
    </div>
    <div id="controls"> <!-- Controls -->
        <!-- Background controls -->
        <button id="toggleCanvasEffect">Invert</button>
    </div>
    <div id="gameOver" hidden>
        <button id="restartGame">Restart</button>
    </div>
    <div id="score" style="position: absolute; top: 75px; left: 10px; color: black; font-size: 20px; background-color: white;">
   Time: <span id="timeScore">0</span>
</div>
</div> 
<script type="module"> 
    // Imports
    import Controller from 'Blog/assets/js/platformer/Controller.js';
    import GameEnv from '{{site.baseurl}}/assets/js/platformer/GameEnv.js';
    import GameLevel from '{{site.baseurl}}/assets/js/platformer/GameLevel.js';
    import GameControl from '{{site.baseurl}}/assets/js/platformer/GameControl.js';
    /*  ==========================================
     *  ======= Data Definitions =================
     *  ==========================================
    */
    // Define assets for the game
    var assets = {
      obstacles: {
        tube: { src: "/images/platformer/obstacles/tube.png" },
      },
      platforms: {
        grass: { src: "/images/platformer/platforms/grass.png" },
        alien: { src: "/images/platformer/platforms/alien.png" }
      },
      jumpPlatforms: {
        brick: {src: "/images/platformer/platforms/brick_wall.png"}
      },
      coins: {
        gold_coin: {src: "/images/platformer/sprites/Coin.png"}
      },
      backgrounds: {
        start: { src: "/images/platformer/backgrounds/home.png" },
        hills: { src: "/images/platformer/backgrounds/hills.png" },
        mountains: { src: "/images/platformer/backgrounds/mountains.png"}
        planet: { src: "/images/platformer/backgrounds/planet.jpg" },
        castles: { src: "/images/platformer/backgrounds/castles.png" },
        end: { src: "/images/platformer/backgrounds/game_over.png" }
      },
      players: {
        mario: {
          src: "/images/platformer/sprites/mario.png",
          width: 256,
          height: 256,
          // idle: { row: 12, frames: 1, idleFrame: { column: 1, frames: 0} },
          w: { row: 10, frames: 15 },
          wa: { row: 11, frames: 15 },
          wd: { row: 10, frames: 15 },
          a: { row: 3, frames: 7, idleFrame: { column: 7, frames: 0 } },
          s: { row: 12, frames: 15 },
          d: { row: 2, frames: 7, idleFrame: { column: 7, frames: 0 } },
          // runningLeft: { row: 3, frame: 7 idleFrame: { column: 7, frames: 0 } },
          // runningRight: { row: 2, frame: 7, idleFrame: { column: 7, frames: 0 } },
        },
        monkey: {
          src: "/images/platformer/sprites/monkey.png",
          width: 40,
          height: 40,
          w: { row: 9, frames: 15 },
          wa: { row: 9, frames: 15 },
          wd: { row: 9, frames: 15 },
          a: { row: 1, frames: 15, idleFrame: { column: 7, frames: 0 } },
          s: { row: 12, frames: 15 },
          d: { row: 0, frames: 15, idleFrame: { column: 7, frames: 0 } }
        },
        /* lopez: {
          src: "/images/platformer/sprites/lopezanimation.png", // Modify this to match your file path
          width: 46,
          height: 52.5,
          idle: { row: 6, frames: 1, idleFrame: {column: 1, frames: 0} },
          a: { row: 1, frames: 4, idleFrame: { column: 1, frames: 0 } }, // Right Movement
          d: { row: 2, frames: 4, idleFrame: { column: 1, frames: 0 } }, // Left Movement
          runningLeft: { row: 5, frames: 4, idleFrame: {column: 1, frames: 0} },
          runningRight: { row: 4, frames: 4, idleFrame: {column: 1, frames: 0} },
          s: {}, // Stop the movement
        }, */
      },
      enemies: {
        goomba: {
          src: "/images/platformer/sprites/goomba.png",
          width: 448,
          height: 452,
        }
      }
    }
    // add File to assets, ensure valid site.baseurl
    Object.keys(assets).forEach(category => {
      Object.keys(assets[category]).forEach(assetName => {
        assets[category][assetName]['file'] = "{{site.baseurl}}" + assets[category][assetName].src;
      });
    });
    // we put this in the oop file after our assets
// Function to switch to the leaderboard screen
function showLeaderboard() {
    const id = document.getElementById("gameOver");
    id.hidden = false;
    // Hide game canvas and controls
    document.getElementById('canvasContainer').style.display = 'none';
    document.getElementById('controls').style.display = 'none';
  // Create and display leaderboard section
  const leaderboardSection = document.createElement('div');
  leaderboardSection.id = 'leaderboardSection';
  leaderboardSection.innerHTML = '<h1 style="text-align: center; font-size: 18px;">Leaderboard </h1>';
  document.querySelector(".page-content").appendChild(leaderboardSection)
  // document.body.appendChild(leaderboardSection);
  const playerScores = localStorage.getItem("playerScores")
  const playerScoresArray = playerScores.split(";")
  const scoresObj = {}
  const scoresArr = []
  for(let i = 0; i< playerScoresArray.length-1; i++){
    const temp = playerScoresArray[i].split(",")
    scoresObj[temp[0]] = parseInt(temp[1])
    scoresArr.push(parseInt(temp[1]))
  }
  scoresArr.sort()
  const finalScoresArr = []
  for (let i = 0; i<scoresArr.length; i++) {
    for (const [key, value] of Object.entries(scoresObj)) {
      if (scoresArr[i] ==value) {
        finalScoresArr.push(key + "," + value)
        break;
      }
    }
  }
  let rankScore = 1;
  for (let i =0; i<finalScoresArr.length; i++) {
    const rank = document.createElement('div');
    rank.id = `rankScore${rankScore}`;
    rank.innerHTML = `<h2 style="text-align: center; font-size: 18px;">${finalScoresArr[i]} </h2>`;
    document.querySelector(".page-content").appendChild(rank)    
  }
}
//rest of the code here
// Event listener for leaderboard button to be clicked
document.getElementById('leaderboardButton').addEventListener('click', showLeaderboard);
  // add File to assets, ensure valid site.baseurl
  Object.keys(assets).forEach(category => {
    Object.keys(assets[category]).forEach(assetName => {
      assets[category][assetName]['file'] = "{{site.baseurl}}" + assets[category][assetName].src;
    });
  });
  //this should be above the game level callbacks
    /*  ==========================================
     *  ===== Game Level Call Backs ==============
     *  ==========================================
    */
    // Level completion tester
    function testerCallBack() {
        // console.log(GameEnv.player?.x)
        if (GameEnv.player?.x > GameEnv.innerWidth) {
            return true;
        } else {
            return false;
        }
    }
    // Helper function for button click
    function waitForButton(buttonName) {
      // resolve the button click
      return new Promise((resolve) => {
          const waitButton = document.getElementById(buttonName);
          const waitButtonListener = () => {
              resolve(true);
          };
          waitButton.addEventListener('click', waitButtonListener);
      });
    }
    // Start button callback
    async function startGameCallback() {
      const id = document.getElementById("gameBegin");
      id.hidden = false;
      // Use waitForRestart to wait for the restart button click
      await waitForButton('startGame');
      id.hidden = true;
      return true;
    }
    // Home screen exits on Game Begin button
    function homeScreenCallback() {
      // gameBegin hidden means the game has started
      const id = document.getElementById("gameBegin");
      return id.hidden;
    }
    // Game Over callback
    async function gameOverCallBack() {
    const id = document.getElementById("gameOver");
    id.hidden = false;
    // Store whether the game over screen has been shown before
    const gameOverScreenShown = localStorage.getItem("gameOverScreenShown");
    // Check if the game over screen has been shown before
    if (!gameOverScreenShown) {
      const playerScore = document.getElementById("timeScore").innerHTML;
      const playerName = prompt(`You scored ${playerScore}! What is your name?`);
      let temp = localStorage.getItem("playerScores");
      temp += playerName + "," + playerScore.toString() + ";";
      localStorage.setItem("playerScores", temp);
      // Set a flag in local storage to indicate that the game over screen has been shown
      localStorage.setItem("gameOverScreenShown", "true");
  }
  // Use waitForRestart to wait for the restart button click
    await waitForButton('restartGame');
    id.hidden = true;
    // Change currentLevel to start/restart value of null
    GameEnv.currentLevel = null;
    // Reset the flag so that the game over screen can be shown again on the next game over
    localStorage.removeItem("gameOverScreenShown");
    return true;
  }
    /*  ==========================================
     *  ========== Game Level setup ==============
     *  ==========================================
     * Start/Home sequence
     * a.) the start level awaits for button selection
     * b.) the start level automatically cycles to home level
     * c.) the home advances to the 1st game level when the button selection is made
    */
    // Start/Home screens
    new GameLevel( {tag: "start", callback: startGameCallback } );
    new GameLevel( {tag: "home", background: assets.backgrounds.start, callback: homeScreenCallback } );
    // Game screens
    new GameLevel( {tag: "hills", background: assets.backgrounds.hills,    background2: assets.backgrounds.mountains,
      platform: assets.platforms.grass, jumpPlatform: assets.jumpPlatforms.brick, coin: assets.coins.gold_coin, player: assets.players.mario, enemy: assets.enemies.goomba, tube: assets.obstacles.tube, callback: testerCallBack } );
    new GameLevel( {tag: "alien", background: assets.backgrounds.planet, platform: assets.platforms.alien, player: assets.players.monkey, callback: testerCallBack } );
    // Game Over screen
    new GameLevel( {tag: "end", background: assets.backgrounds.end, callback: gameOverCallBack } );
    /*  ==========================================
     *  ========== Game Control ==================
     *  ==========================================
    */
    // create listeners
    toggleCanvasEffect.addEventListener('click', GameEnv.toggleInvert);
    window.addEventListener('resize', GameEnv.resize);
    // start game
    GameControl.gameLoop();
    var myController = new Controller();
      myController.initialize();
    var table = myController.levelTable;
document.getElementById("mySidebar").append(table);
var toggle = false;
  function toggleWidth(){
    toggle = !toggle;
    document.getElementById("mySidebar").style.width = toggle?"250px":"0px";
  }
  document.getElementById("toggleSettingsBar").addEventListener("click",toggleWidth);
  document.getElementById("toggleSettingsBar1").addEventListener("click",toggleWidth);
</script>









