let cnv;
let classifier;
let img;
let px, py;
let loadingModel = false;

function preload() {
  const status = select("#status");
  let imageModelURL = "https://teachablemachine.withgoogle.com/models/vgJOFUw4O/";
  status.elt.innerText = "Loading model...";
  loadingModel = true;

  classifier = ml5.imageClassifier(imageModelURL + "model.json", () => {
    console.log("Model loaded successfully");
    loadingModel = false;
    status.elt.innerText = "Model loaded successfully";

    setTimeout(() => {
      if (!loadingModel) {
        status.elt.innerText = "Ready for your drawing...";
      }
    }, 1000);
  });
}

function setup() {
  cnv = createCanvas(280, 280);
  cnv.parent("sketch");
  background(255);
  strokeCap(ROUND);
  px = mouseX;
  py = mouseY;

  // Button Funktionen verbinden
  select("#clearBtn").mousePressed(clearCanvas);
  select("#classifyBtn").mousePressed(classifyCanvas);
}

function draw() {
  if (mouseIsPressed) {
    let weight = dist(px, py, mouseX, mouseY);
    strokeWeight(constrain(weight, 1, 10));
    line(px, py, mouseX, mouseY);
  }
  px = mouseX;
  py = mouseY;
}

function clearCanvas() {
  background(255);
}

function classifyCanvas() {
  const status = select("#status");
  status.elt.innerText = "Classifying...";
  img = get();
  classifier.classify(img, (err, results) => {
    if (err) {
      console.error(err);
      status.elt.innerText = "Error classifying the image";
      return;
    }
    status.elt.innerText = "Classified successfully";

    const labelElement = select("#label");
    const confidenceElement = select("#confidence");

    labelElement.elt.innerText = `Label: ${results[0].label}`;
    confidenceElement.elt.innerText = `Confidence: ${(results[0].confidence * 100).toFixed(2)}%`;

    setTimeout(() => {
      status.elt.innerText = "Ready for your drawing...";
    }, 2000);
  });
}
