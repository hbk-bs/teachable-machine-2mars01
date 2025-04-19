let classifier;
let doodleCanvas;
let modelURL = 'https://teachablemachine.withgoogle.com/models/vgJOFUw4O/'; // Replace with your Teachable Machine model URL
let resultLabel = 'Waiting...';
let drawing = false;
let previousX = 0;
let previousY = 0;
let timeLeft = 15;
let timerInterval;
let gameEnded = false;

function preload() {
  classifier = ml5.imageClassifier(modelURL + 'model.json');
}

function setup() {
  let canvas = createCanvas(400, 400);
  canvas.parent('sketch-holder');
  doodleCanvas = createGraphics(200, 200);
  doodleCanvas.background(255);
  doodleCanvas.stroke(0);
  doodleCanvas.strokeWeight(4);
}

function draw() {
  background(220);
  image(doodleCanvas, 100, 100);

  if (drawing) {
    doodleCanvas.line(previousX, previousY, mouseX - 100, mouseY - 100);
  }
}

function mousePressed() {
  if (!gameEnded) {
    // Check if the mouse is within the doodleCanvas area
    if (mouseX > 100 && mouseX < 300 && mouseY > 100 && mouseY < 300) {
      drawing = true;
      previousX = mouseX - 100;
      previousY = mouseY - 100;
    }
  }
}

function mouseReleased() {
  drawing = false;
}

function classifyDrawing() {
  classifier.classify(doodleCanvas, gotResult);
  clearInterval(timerInterval);
  select('#classifyBtn').attribute('disabled', '');
  select('#clearBtn').attribute('disabled', '');
}

function clearCanvas() {
  doodleCanvas.background(255);
  resultLabel = 'Waiting...';
  select('#result').html("Draw a Sword, Shield, or Magic Wand!");
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  const label = results[0].label;
  select('#result').html("You drew a " + label);
}

function timeIt() {
  if (timeLeft > 0) {
    timeLeft--;
    updateTimerDisplay();
  } else {
    clearInterval(timerInterval);
    gameEnded = true;
    select('#result').html("Time's up! The monsters got you!");
    createTryAgainButton();
  }
}

function updateTimerDisplay() {
  select('#timer').html('Time Left: ' + timeLeft);
}

function createTryAgainButton() {
  let button = createButton('Try Again');
  button.mousePressed(resetGame);
  button.parent('game-container');
}

function resetGame() {
  timeLeft = 15;
  gameEnded = false;
  clearCanvas();
  updateTimerDisplay();
  timerInterval = setInterval(timeIt, 1000);
  select('#classifyBtn').removeAttribute('disabled');
  select('#clearBtn').removeAttribute('disabled');
  let button = select('button');
  if (button) {
    button.remove();
  }
}