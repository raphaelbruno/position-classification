const TOTAL = 200;
var trainData = 'data/train.json';
var isTraining = false;
var trainingLoaded = 0;
var colorLabel = 'white';
var spots = [];

var brain;
var trainPoints = [];
var trainLabels = [];
var colors = [];

function preload() {
  trainData = loadJSON(trainData);
}

function setup() {
  createCanvas(600, 400);

  let input = createSelect();
  input.option('white');
  input.option('red');
  input.option('orange');
  input.option('yellow');
  input.option('lime');
  input.option('green');
  input.option('cyan');
  input.option('blue');
  input.option('purple');
  input.option('pink');
  input.option('gray');
  input.option('brown');
  input.option('black');

  input.changed(function() {
    colorLabel = this.value();
  });

  let buttonClear = createButton('Clear');
  buttonClear.mousePressed(() => {
    if (brain) brain.dispose();
    brain = null;
    spots = [];
  });

  let buttonRandomSpots = createButton('Random Spots');
  buttonRandomSpots.mousePressed(() => {
    spots = [];
    for (let i = 0; i < TOTAL; i++)
      spots.push(new Spot(random(width), random(height), colorLabel));
    predictSpots();
  });

  let buttonTrainLoadedData = createButton('Train from JSON');
  buttonTrainLoadedData.mousePressed(() => {
    prepareData(trainData.list);
    trainBrain();
    spots = [];
  });

  let buttonTrainScreenData = createButton('Train from Screen');
  buttonTrainScreenData.mousePressed(() => {
    prepareData(spots);
    trainBrain();
    spots = [];
  });

  let buttonSaveJSON = createButton('Save JSON');
  buttonSaveJSON.mousePressed(() => {
    if (spots.length < 1) return;
    saveJSON({
      list: spots
    }, 'train.json');
  });
}

function draw() {
  background(220);

  spots.forEach(spot => spot.render());

  if (brain) {
    stroke(220);
    strokeWeight(5);
    fill('black');
    textSize(18);
    textAlign(LEFT);
    text("Brain Loss: " + (brain.loss ? brain.loss : ''), 10, 20);

    noStroke();
    rect(0, height - 22, 120, 22);
    fill('white');
    text("Predict Mode", 4, height - 4);
  }

  if (isTraining) {
    stroke(220);
    fill('black');
    textSize(32);
    textAlign(CENTER);
    text("Training Brain...", width / 2, height / 2);
  
    stroke(0);
    strokeWeight(1);
    noFill();
    rect(width/2 - 152, height/2 + 12, 304, 24);
  
    noStroke();
    fill(50);
    rect(width/2 - 150, height/2 + 14, 300*trainingLoaded, 20);
  }
}

function keyPressed() {
  if (key.toLowerCase() == 's') {
    let list = [];
    spots.forEach(spot => list.push(spot.serialize()));
    saveJSON(list, 'list.json');
  }
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    spots.push(new Spot(mouseX, mouseY, colorLabel));
    predictSpots();
  }
}

function predictSpots() {
  if (brain) {
    spots.forEach(spot => {
      let guess = brain.predict(spot.x / width, spot.y / height);
      spot.setColor(colors[guess]);
    });
  }
}

function prepareData(data) {
  trainPoints = [];
  trainLabels = [];
  colors = data.map(item => item.color);
  colors = colors.filter((elem, index, array) => array.indexOf(elem) === index);

  let targetModel = new Array(colors.length).fill(0);

  data.forEach(item => {
    trainPoints.push([item.x / width, item.y / height]);
    let target = [...targetModel];
    target[colors.indexOf(item.color)] = 1;
    trainLabels.push(target);
  });
}

function trainBrain() {
  if (colors.length < 2) return;

  isTraining = true;
  trainingLoaded = 0;
  if (brain) brain.dispose();
  brain = new Brain(colors.length);
  brain.train(trainPoints, trainLabels, loaded => {
    trainingLoaded = loaded;
    if(loaded == 1) isTraining = false;
  });
}