let classifier;
let doodleCanvas;
let modelURL = 'https://teachablemachine.withgoogle.com/models/vgJOFUw4O/'; // Replace with your Teachable Machine model URL
let clearButton;
let classifyButton; // Add classifyButton
let resultLabel = 'Waiting...';
let drawing = false;
let previousX = 0;
let previousY = 0;
let timeLeft = 15; // Timer in seconds
let timerInterval;
let gameEnded = false; // Track if the game has ended
let tryAgainButton; // Declare tryAgainButton globally
let classificationDone = false;
let startOverButton;

// Texte für die Labels
let attackText = "Du hast angegriffen!";
let defendText = "Du hast verteidigt!";
let bewitchText = "Du hast verhext!";
let unknownText = "Ich konnte das nicht erkennen!";

// Variable für den anzuzeigenden Text
let displayText = "";

function preload() {
  classifier = ml5.imageClassifier(modelURL + 'model.json');
}

function setup() {
  createCanvas(400, 400);
  background(220);
  doodleCanvas = createGraphics(200, 200);
  doodleCanvas.background(255);
  image(doodleCanvas, 100, 100);

  // Classify Button
  classifyButton = createButton('classify');
  classifyButton.mousePressed(classifyDrawing);

  // Clear Button
  clearButton = createButton('clear');
  clearButton.mousePressed(clearCanvas);

  doodleCanvas.stroke(0); // Set stroke color to black
  doodleCanvas.strokeWeight(4); // Set stroke weight for thicker lines
  doodleCanvas.noFill(); // Remove fill color

  // Start the timer
  updateTimerDisplay(); // Initial display
  timerInterval = setInterval(timeIt, 1000);

  // Disable buttons initially
  classifyButton.attribute('disabled', '');
  clearButton.attribute('disabled', '');
}

function draw() {
  background(220);
  textAlign(CENTER, CENTER);
  textSize(32);

  if (classificationDone) {
    // Display only the classification result
    //fill(0);
    //text(displayText, width / 2, height / 2 - 20); // Adjust position
  } else if (gameEnded) {
    // Show "You're Dead" and the button
    fill(0);
    text("Du bist tot!", width / 2, height / 2 - 20);
    textAlign(LEFT, BASELINE); // Reset alignment
  } else {
    // Display instructions before classification
    image(doodleCanvas, 100, 100); // Show canvas
    fill(0);
    text("Draw Something!", width / 2, height / 2);
  }
}

function mousePressed() {
  if (!gameEnded && !classificationDone) { // Only allow drawing if the game hasn't ended
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
  clearInterval(timerInterval); // Stop the timer when classified
}

function clearCanvas() {
  doodleCanvas.background(255);
  resultLabel = 'Waiting...';
  displayText = "";
  classificationDone = false;
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  resultLabel = results[0].label;
  console.log(results);
  console.log('Label: ' + results[0].label);
  console.log('Confidence: ' + results[0].confidence);

  // Text basierend auf dem Label setzen
  if (resultLabel === 'attack') {
    displayText = attackText;
  } else if (resultLabel === 'defend') {
    displayText = defendText;
  } else if (resultLabel === 'bewitch') {
    displayText = bewitchText;
  } else {
    displayText = unknownText;
  }
  classificationDone = true;
  document.getElementById('displayTextContainer').textContent = displayText; // Update HTML element
  if (resultLabel === 'attack' || resultLabel === 'defend' || resultLabel === 'bewitch') {
    createStartOverButton();
  }
}

function createTryAgainButton() {
  console.log("createTryAgainButton() called!");
  tryAgainButton = createButton('Nochmal versuchen');
  tryAgainButton.position(width / 2 - tryAgainButton.width / 2, height / 2 + 60); // Position the button
  tryAgainButton.mousePressed(resetGame); // Call resetGame when pressed
}

function createStartOverButton() {
  console.log("createStartOverButton() called!");
  startOverButton = createButton('Start Over');
  startOverButton.position(width / 2 - 50, height / 2 + 60); // Position the button
  startOverButton.mousePressed(resetGame); // Call resetGame when pressed
}

function timeIt() {
  if (timeLeft > 0) {
    timeLeft--;
    updateTimerDisplay(); // Aktualisiere die Timer-Anzeige
  } else {
    console.log("Timer expired!");
    clearInterval(timerInterval);
    //displayText = "Zeit abgelaufen!"; // No need to set this here
    gameEnded = true; // Set gameEnded to true
    console.log("gameEnded = ", gameEnded);
    createTryAgainButton(); // Create the button

    // Disable the buttons
    classifyButton.attribute('disabled', '');
    clearButton.attribute('disabled', '');
  }
}

function updateTimerDisplay() {
  // Aktualisiere das HTML-Element mit der ID "timer"
  document.getElementById('timer').textContent = 'time left: ' + timeLeft + 's';
}

function resetGame() {
  console.log("resetGame() called!");
  // Reset all game variables
  timeLeft = 15;
  gameEnded = false;
  displayText = "";
  resultLabel = 'Waiting...';
  clearInterval(timerInterval); // Clear the old interval
  timerInterval = setInterval(timeIt, 1000); // Start a new interval
  updateTimerDisplay(); // Update the timer display
  if (tryAgainButton) tryAgainButton.remove(); // Remove the button
  if (startOverButton) startOverButton.remove();
  classificationDone = false;

  // Clear the canvas
  clearCanvas();

  // Enable the buttons
  classifyButton.removeAttribute('disabled');
  clearButton.removeAttribute('disabled');
}