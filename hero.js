/* eslint no-unused-vars: 0 */
/*

Strategies for the hero are contained within the "moves" object as
name-value pairs, like so:

    //...
    ambusher : function(gamedData, helpers){
      // implementation of strategy.
    },
    heWhoLivesToFightAnotherDay: function(gamedData, helpers){
      // implementation of strategy.
    },
    //...other strategy definitions.

The "moves" object only contains the data, but in order for a specific
strategy to be implemented we MUST set the "move" variable to a
definite property.  This is done like so:

move = moves.heWhoLivesToFightAnotherDay;

You MUST also export the move function, in order for your code to run
So, at the bottom of this code, keep the line that says:

module.exports = move;

The "move" function must return "North", "South", "East", "West", or "Stay"
(Anything else will be interpreted by the game as "Stay")

The "move" function should accept two arguments that the website will be passing in:
- a "gameData" object which holds all information about the current state
  of the battle
- a "helpers" object, which contains useful helper functions
- check out the helpers.js file to see what is available to you

*/

// Strategy definitions
var moves = {
    // Aggressor
    aggressor: function (gameData, helpers) {
        // Here, we ask if your hero's health is below 30
        if (gameData.activeHero.health <= 30){
            // If it is, head towards the nearest health well
            return helpers.findNearestHealthWell(gameData);
        } else {
            // Otherwise, go attack someone...anyone.
            return helpers.findNearestEnemy(gameData);
        }
    },

    // Health Nut
    healthNut: function (gameData, helpers) {
        // Here, we ask if your hero's health is below 75
        if (gameData.activeHero.health <= 75){
            // If it is, head towards the nearest health well
            return helpers.findNearestHealthWell(gameData);
        } else {
            // Otherwise, go mine some diamonds!!!
            return helpers.findNearestNonTeamDiamondMine(gameData);
        }
    },

    // Balanced
    balanced: function (gameData, helpers){
        // Here we determine if it's an even or odd turn for your hero;
        if ((gameData.turn / 2) % 2) {
            // If it is even, act like an an Aggressor
            return moves.aggressor(gameData, helpers);
        } else {
            // If it is odd, act like a Priest
            return moves.priest(gameData, helpers);
        }
    },

    // The "Northerner"
    // This hero will walk North.  Always.
    northener: function (gameData, helpers) {
        return 'North';
    },

    // The "Blind Man"
    // This hero will walk in a random direction each turn.
    blindMan: function (gameData, helpers) {
        var choices = ['North', 'South', 'East', 'West'];
        return choices[Math.floor(Math.random()*4)];
    },

    // The "Priest"
    // This hero will heal nearby friendly champions.
    priest: function (gameData, helpers) {
        var myHero = gameData.activeHero;
        if (myHero.health < 60) {
            return helpers.findNearestHealthWell(gameData);
        } else {
            return helpers.findNearestTeamMember(gameData);
        }
    },

    // The "Unwise Assassin"
    // This hero will attempt to kill the closest enemy hero. No matter what.
    unwiseAssassin: function (gameData, helpers) {
        var myHero = gameData.activeHero;
        if (myHero.health < 30) {
            return helpers.findNearestHealthWell(gameData);
        } else {
            return helpers.findNearestEnemy(gameData);
        }
    },

    // The "Careful Assassin"
    // This hero will attempt to kill the closest weaker enemy hero.
    carefulAssassin: function (gameData, helpers) {
        var myHero = gameData.activeHero;
        if (myHero.health < 50) {
            return helpers.findNearestHealthWell(gameData);
        } else {
            return helpers.findNearestWeakerEnemy(gameData);
        }
    },

    // The "Safe Diamond Miner"
    // This hero will attempt to capture enemy diamond mines.
    safeDiamondMiner: function (gameData, helpers) {
        var myHero = gameData.activeHero;

        // Get stats on the nearest health well
        var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function (boardTile) {
            if (boardTile.type === 'HealthWell') {
                return true;
            }
        });
        var distanceToHealthWell = healthWellStats.distance;
        var directionToHealthWell = healthWellStats.direction;

        if (myHero.health < 40) {
            // Heal no matter what if low health
            return directionToHealthWell;
        } else if (myHero.health < 100 && distanceToHealthWell === 1) {
            // Heal if you aren't full health and are close to a health well already
            return directionToHealthWell;
        } else {
            // If healthy, go capture a diamond mine!
            return helpers.findNearestNonTeamDiamondMine(gameData);
        }
    },

    // The "Selfish Diamond Miner"
    // This hero will attempt to capture diamond mines (even those owned by teammates).
    selfishDiamondMiner: function (gameData, helpers) {
        var myHero = gameData.activeHero;

        // Get stats on the nearest health well
        var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function (boardTile) {
            if (boardTile.type === 'HealthWell') {
                return true;
            }
        });

        var distanceToHealthWell = healthWellStats.distance;
        var directionToHealthWell = healthWellStats.direction;

        if (myHero.health < 40) {
            // Heal no matter what if low health
            return directionToHealthWell;
        } else if (myHero.health < 100 && distanceToHealthWell === 1) {
            // Heal if you aren't full health and are close to a health well already
            return directionToHealthWell;
        } else {
            // If healthy, go capture a diamond mine!
            return helpers.findNearestUnownedDiamondMine(gameData);
        }
    },

    // The "Coward"
    // This hero will try really hard not to die.
    coward: function (gameData, helpers) {
        return helpers.findNearestHealthWell(gameData);
    }
};

// test memory between turns
var lastDir = 'North';
var lastDirM;

function play(G,H){
  if (lastDir == 'North'){
    lastDirM = ['South','East','West'];
    lastDir = lastDirM  [(Math.random()*3) >> 0 ];
    return lastDir;
  } else {
    lastDir = 'North';
    return lastDir;
  }
}

function move (G,H){
    //  helpers=H; gameData=G;
    //  (helpers = h).setGameData(gameData = g); // :p
    let myHero = G.activeHero;
    let board = G.board;
    let heroes = G.heroes;
    let friends = G.teams[ myHero.team ];
    let friendsMoney = G.totalTeamDiamonds [ myHero.team ];
    let friendsMines = G.diamondMines.filter( m => m.owner && !m.owner.dead && m.owner.team === myHero.team );
    let enemies = G.teams[ 1 - myHero.team ];
    let enemiesMoney = G.totalTeamDiamonds [ 1 - myHero.team ];
    let enemiesMines = G.diamondMines.filter( m => m.owner && !m.owner.dead && m.owner.team !== myHero.team );
    let turn = G.turn;
};

module.exports = play;
