// Game Configuration
const CONFIG = {
  modelURL: 'https://teachablemachine.withgoogle.com/models/vgJOFUw4O/', // Replace with your Teachable Machine model URL
  lineWidth: 8,
  lineColor: '#333333', // Dark gray for lines
  bgColor: '#f0f0f0', // Light gray for background
  doodleSize: 400 // Added doodleSize to config
};

// Game Variables
let classifier;
let doodleCanvas;
let resultLabel = 'Draw a shape to defend against the dragon!';
let drawing = false;
let previousX, previousY;
let attackImage, defendImage, bewitchImage;
let currentImage;
let classifyButton;
let clearButton;
let dragonDefeated = false;
let canvasX, canvasY; // Canvas position
let showClassifiedImage = false; // Flag to show classified image
let gameState = 'start'; // 'start' or 'main'

// Modern Color Palette (Dragon Cave Theme)
const primaryColor = '#8B4513'; // Saddle Brown (earthy)
const secondaryColor = '#A9A9A9'; // Dark Gray (stone)
const textColor = '#F5F5DC'; // Beige (parchment)
const backgroundColor = '#282828'; // Very dark gray (cave)

let imagesLoaded = false; // Flag to track image loading
let classifierReady = false; // Flag to track classifier loading

function preload() {
  // Load the Teachable Machine model
  classifier = ml5.imageClassifier(CONFIG.modelURL + 'model.json', () => {
    console.log('Classifier loaded');
    classifierReady = true; // Set flag when classifier is loaded
  });

  // Load images
  attackImage = loadImage('https://hbk-bs.github.io/the-archives-2mars01/assets/images/dragon.png', () => console.log('attackImage loaded')); // Fireball for attack
  defendImage = loadImage('https://hbk-bs.github.io/the-archives-2mars01/assets/images/knight.png', () => console.log('defendImage loaded')); // Shield for defend
  bewitchImage = loadImage('https://hbk-bs.github.io/the-archives-2mars01/assets/images/bunny.png', () => console.log('bewitchImage loaded')); // Potion for bewitch
}

function setup() {
  const canvasWidth = 800; // Set the desired width
  const canvasHeight = 600; // Set the desired height
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('sketch-holder'); // Attach the canvas to the #sketch-holder div

  if (gameState === 'start') {
    showStartScreen();
  } else {
    initializeMainGame();
  }
}

function draw() {
  if (gameState === 'start') {
    // Start screen is static, no need to redraw
  } else if (gameState === 'main') {
    background(backgroundColor);
    if (showClassifiedImage && currentImage) {
      // Display the classified image, filling the sketch-holder
      image(currentImage, canvasX, canvasY, CONFIG.doodleSize, CONFIG.doodleSize);
      textSize(20);
      fill(textColor);
      textAlign(CENTER);
      text(resultLabel, width / 2, canvasY + CONFIG.doodleSize + 30);
    } else {
      // Draw the doodleCanvas in the center
      image(doodleCanvas, canvasX, canvasY);

      textSize(20);
      fill(textColor);
      textAlign(CENTER);
      text(resultLabel, width / 2, canvasY + CONFIG.doodleSize + 30);
    }

    if (drawing) {
      doodleCanvas.strokeWeight(CONFIG.lineWidth);
      doodleCanvas.stroke(CONFIG.lineColor);
      doodleCanvas.line(previousX, previousY, mouseX - canvasX, mouseY - canvasY);
    }
    previousX = mouseX - canvasX;
    previousY = mouseY - canvasY;
  }
}

function showStartScreen() {
  background(50); // Dark background for the start screen
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("Welcome to Doodle Defender!", width / 2, height / 3);
  textSize(16);
  text(
    "The dragon is attacking! Draw shapes to defend your kingdom.\n" +
    "Click 'Accept' to begin your adventure.",
    width / 2,
    height / 2
  );

  // Create Accept button and place it in the game container
  const acceptBtn = createButton('Accept');
  acceptBtn.parent('game-container'); // Place it inside the flex container
  acceptBtn.mousePressed(() => {
    gameState = 'main';
    acceptBtn.remove(); // Remove the accept button
    
    // Show the main game UI elements
    document.getElementById('game-title').style.display = 'block';
    document.getElementById('result-label').style.display = 'block';

    initializeMainGame(); // Setup the main game
  });
}

function initializeMainGame() {
  background(255); // Reset the background for the main game

  // Update the size of the doodleCanvas
  const doodleCanvasWidth = 400; // New width for the doodle canvas
  const doodleCanvasHeight = 400; // New height for the doodle canvas
  doodleCanvas = createGraphics(doodleCanvasWidth, doodleCanvasHeight);
  doodleCanvas.background(CONFIG.bgColor);

  // Calculate the center position
  canvasX = (width - CONFIG.doodleSize) / 2;
  canvasY = (height - CONFIG.doodleSize) / 2;

  // Create Classify button
  classifyBtn = createButton('confirm drawing');
  classifyBtn.id('classifyBtn'); // Add an ID to the button
  classifyBtn.mousePressed(classifyDrawing);
  styleButton(classifyBtn, secondaryColor);

  // Create Clear button
  clearBtn = createButton('try again');
  clearBtn.id('clearBtn'); // Add an ID to the button
  clearBtn.mousePressed(clearCanvas);
  styleButton(clearBtn, '#f44336');

  const buttonContainer = createDiv();
  buttonContainer.class('button-container');
  buttonContainer.child(classifyBtn);
  buttonContainer.child(clearBtn);
  buttonContainer.parent('game-container');
}

function mousePressed() {
  if (gameState === 'main' && mouseX > canvasX && mouseX < canvasX + 200 && mouseY > canvasY && mouseY < canvasY + 200) {
    drawing = true;
    previousX = mouseX - canvasX;
    previousY = mouseY - canvasY;
  }
}

function mouseReleased() {
  drawing = false;
}

function classifyDrawing() {
  if (classifier && classifierReady) { // Check if classifier is loaded
    classifier.classify(doodleCanvas, gotResult);
  } else {
    console.warn('Classifier not loaded yet.');
  }
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  resultLabel = results[0].label;
  console.log(results);

  // Update currentImage and resultLabel based on the classification result
  if (resultLabel === 'attack') {
    currentImage = attackImage;
    resultLabel = "You defeated the dragon!";
  } else if (resultLabel === 'defend') {
    currentImage = defendImage;
    resultLabel = "You raised your shield, deflecting the dragon's fire!";
  } else if (resultLabel === 'bewitch') {
    currentImage = bewitchImage;
    resultLabel = "You cast a bewitching spell, turning the dragon into a tiny bunny!";
  } else {
    currentImage = null;
    resultLabel = "The magic fizzles... Draw again!";
  }
  showClassifiedImage = true; // Show the classified image
}

function clearCanvas() {
  doodleCanvas.background(CONFIG.bgColor);
  resultLabel = 'Draw a shape to defend against the dragon!';
  currentImage = null;
}

// Helper function to style buttons
function styleButton(button, bgColor) {
  button.style('background-color', bgColor);
  button.style('color', 'white');
  button.style('border', 'none');
  button.style('padding', '10px 20px');
  button.style('font-size', '16px');
  button.style('border-radius', '5px');
  button.style('cursor', 'pointer');
  button.style('margin', '5px');
   // Add some margin
}

// This function is called automatically by p5.js when the mouse is dragged
function mouseDragged() {
  // Call the drawing logic only during the main game state
  if (gameState === 'main') {
    drawOnDoodleCanvas();
  }
}

// This function is called automatically by p5.js for touch events
function touchMoved() {
  // Call the drawing logic only during the main game state
  if (gameState === 'main') {
    drawOnDoodleCanvas();
    // Prevent the browser from performing default actions like scrolling
    return false;
  }
}

// A helper function to contain the drawing logic, used by both mouse and touch
function drawOnDoodleCanvas() {
  // Check if the pointer is within the bounds of the smaller doodleCanvas
  if (mouseX > canvasX && mouseX < canvasX + doodleCanvas.width &&
      mouseY > canvasY && mouseY < canvasY + doodleCanvas.height) {
    
    // Set drawing properties on the doodleCanvas
    doodleCanvas.stroke(CONFIG.strokeColor || 0); // Default to black
    doodleCanvas.strokeWeight(CONFIG.strokeWeight || 10); // Default to 10
    
    // Draw a line from the previous to the current pointer position
    // We subtract canvasX and canvasY to get coordinates relative to the doodleCanvas
    doodleCanvas.line(pmouseX - canvasX, pmouseY - canvasY, mouseX - canvasX, mouseY - canvasY);
  }
}