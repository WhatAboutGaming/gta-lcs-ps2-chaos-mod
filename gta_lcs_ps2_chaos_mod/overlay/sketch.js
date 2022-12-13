var socket;
var soundEffects = [];
var gameMemoryToDisplay = [];
var textToDisplay = "";
var valueToDisplay = 0;
var currentValueToDisplay = 0;
var textTransparency = 255; // range from 0 to 255
var secondCurrent = 0;
var secondOld = 0;

function preload() {
  font = loadFont("VCREAS_3.0.ttf"); // Pixel perfect font, set to 20 points for crispy pixel perfectness, mono font
  font2 = loadFont("Pricedown.ttf"); // GTA font, not mono
  soundFormats("mp3");
  // For now the sound effects are hardcoded, maybe a better way would be to just look for all files that have the mp3 extension
  soundEffects[0] = loadSound("bing_bong.mp3");
  soundEffects[1] = loadSound("Taco_Bell_Bong.mp3");
  soundEffects[2] = loadSound("beyblade.mp3");
  soundEffects[3] = loadSound("we_got_him.mp3");
  soundEffects[4] = loadSound("price_is_right_horn.mp3");
  soundEffects[5] = loadSound("fail_sound.mp3");
  soundEffects[6] = loadSound("bruh.mp3");
  soundEffects[7] = loadSound("nelson_haha.mp3");
  soundEffects[8] = loadSound("sad_trombone.mp3");
  soundEffects[9] = loadSound("nice_job_dick_face.mp3");
  soundEffects[10] = loadSound("smb_death.mp3");
  soundEffects[11] = loadSound("smb_game_over.mp3");
  soundEffects[12] = loadSound("smb_death_game_over.mp3");
  soundEffects[13] = loadSound("smb_death_game_over_short.mp3");
  soundEffects[14] = loadSound("pretty_stupid.mp3");
}

function setup() {
  noSmooth();
  frameRate(60);
  createCanvas(1920, 1080);
  background("#00000000");
  socket = io.connect();
  socket.on("play_sound", function(data) {
    //console.log(new Date().toISOString() + " " + data);
    if (data == "BingBong") {
      soundEffects[0].play();
    }
    if (data == "TacoBellBong") {
      soundEffects[1].play();
    }
    if (data == "Beyblade") {
      soundEffects[2].play();
    }
    if (data == "Random") {
      let randomSoundEffectIndex = Math.floor(Math.random() * soundEffects.length);
      console.log("randomSoundEffectIndex = " + randomSoundEffectIndex);
      soundEffects[randomSoundEffectIndex].play();
    }
  });
  socket.on("game_memory_to_display_to_update", function(data, index) {
    //let gameMemoryToDisplayIndex = gameMemoryToDisplay.findIndex(element => element.address_name == data.address_name);
    let gameMemoryToDisplayIndex = index;
    //console.log("Received updated data");
    if (gameMemoryToDisplayIndex < 0) {
      console.log("Invalid index, ignoring");
    }
    if (gameMemoryToDisplayIndex >= 0) {
      //console.log("Valid index");
      //console.log("Received updated data");
      gameMemoryToDisplay[gameMemoryToDisplayIndex] = data;
      //console.log("Received updated data gameMemoryToDisplayIndex = " + gameMemoryToDisplayIndex);
      //console.log(gameMemoryToDisplay[gameMemoryToDisplayIndex]);
    }
  });
  socket.on("game_memory_to_display", function(data) {
    console.log("Received new array");
    gameMemoryToDisplay = data;
    console.log(gameMemoryToDisplay);
  });
}

function draw() {
  clear();
  background("#00000000");
  //console.log(new Date().toISOString() + " " + textTransparency + " " + textTransparencyStatus + " " + currentValueToDisplay);
  //console.log(socket.connected);
  let textXPosition = 10;
  let textYPosition = 700;
  secondCurrent = new Date().getUTCSeconds();
  if (socket.connected == false) {
    currentValueToDisplay = 0;
    gameMemoryToDisplay = [];
  }
  if (gameMemoryToDisplay.length != 0) {
    if (secondCurrent % 3 == 0) {
      if (secondCurrent != secondOld) {
        //textTransparencyStatus = -1;
        //console.log("Time changed from " + secondOld + " to " + secondCurrent);
        currentValueToDisplay++;
        if (textTransparency <= 0) {
          //currentValueToDisplay++;
          //textTransparencyStatus = 0;
        }
        if (currentValueToDisplay > gameMemoryToDisplay.length - 1) {
          currentValueToDisplay = 0;
          //console.log("Resetting counter");
        }
      }
    }
    //console.log("socket.connected = " + socket.connected);
    
    if (gameMemoryToDisplay[currentValueToDisplay].decimal_points_to_display < 0) {
      // Don't do anything
      //console.log("Test A");
      //console.log(gameMemoryToDisplay[currentValueToDisplay].decimal_points_to_display);
      valueToDisplay = gameMemoryToDisplay[currentValueToDisplay].current_value;
    }

    if (gameMemoryToDisplay[currentValueToDisplay].decimal_points_to_display >= 0) {
      //gameMemoryToDisplay[currentValueToDisplay].current_value = gameMemoryToDisplay[currentValueToDisplay].current_value.toFixed(2);
      //gameMemoryToDisplay[currentValueToDisplay].current_value = gameMemoryToDisplay[currentValueToDisplay].current_value.toFixed(gameMemoryToDisplay[currentValueToDisplay].decimal_points_to_display);
      valueToDisplay = gameMemoryToDisplay[currentValueToDisplay].current_value.toFixed(gameMemoryToDisplay[currentValueToDisplay].decimal_points_to_display);
      //console.log("Test B");
    }
    if (gameMemoryToDisplay[currentValueToDisplay].display_total == false) {
      textToDisplay = gameMemoryToDisplay[currentValueToDisplay].address_name + "\n" + gameMemoryToDisplay[currentValueToDisplay].prepend_string + valueToDisplay + gameMemoryToDisplay[currentValueToDisplay].append_string;
    }
    if (gameMemoryToDisplay[currentValueToDisplay].display_total == true) {
      textToDisplay = gameMemoryToDisplay[currentValueToDisplay].address_name + "\n" + gameMemoryToDisplay[currentValueToDisplay].prepend_string + valueToDisplay + gameMemoryToDisplay[currentValueToDisplay].append_string + "/" + gameMemoryToDisplay[currentValueToDisplay].prepend_string + gameMemoryToDisplay[currentValueToDisplay].total + gameMemoryToDisplay[currentValueToDisplay].append_string;
    }
    textFont(font2);
    textSize(72);
    strokeWeight(6);
    stroke("#000000FF");
    textAlign(LEFT, TOP);
    // Shadow
    fill("#000000FF");
    textLeading(56);
    text(textToDisplay, textXPosition + 6, textYPosition + 6);
    // Main text
    fill("#FFFFFFFF");
    textLeading(56);
    text(textToDisplay, textXPosition, textYPosition);
  }
  if (gameMemoryToDisplay.length == 0) {
    textFont(font2);
    textSize(72);
    strokeWeight(6);
    stroke("#000000FF");
    textAlign(LEFT, TOP);
    // Shadow
    fill("#000000FF");
    textLeading(56);
    text("Waiting for data", textXPosition + 6, textYPosition + 6);
    // Main text
    fill("#FFFFFFFF");
    textLeading(56);
    text("Waiting for data", textXPosition, textYPosition);
  }
  // Nothing
  textFont(font);
  textSize(60);
  strokeWeight(4);
  stroke("#000000FF");
  textAlign(LEFT, TOP);
  // Main text
  fill("#FFFFFFFF");
  textLeading(56);
  text(new Date().toISOString(), 5, 1024);
  secondOld = secondCurrent;
}