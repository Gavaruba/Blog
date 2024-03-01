// Import necessary modules
import GameEnv from './GameEnv.js';
import Tube from './Tube.js';

// Initialize game environment
GameEnv.initialize();

const tube1 = new Tube(document.createElement('canvas'), tube.png);

// Add tubes to the game environment
GameEnv.gameObjects.push(tube1);
