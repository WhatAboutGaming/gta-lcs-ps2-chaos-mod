var fs = require("fs");
var http = require("http");
var path = require("path");
var url = require("url");
var memoryjs = require("memoryjs");
var tmi = require("tmi.js");
var isBusy = false;
var moduleObject = undefined;
var processObject = undefined;
var processList = [];
var vehiclePointers = [];
var gameMemoryConfigFileName = "gta_lcs_memory.json";
var rewardsConfigFileName = "rewards_config_lcs.json";
var gameMemory = JSON.parse(fs.readFileSync(gameMemoryConfigFileName, "utf8"));
var chatConfig = JSON.parse(fs.readFileSync("chat_config.json", "utf8"));
var rewardsConfig = JSON.parse(fs.readFileSync(rewardsConfigFileName, "utf8"));
var beybladeSfxFileName = "beyblade.mp3";
var mp3FileExtension = ".mp3";
var overlayFilesList = fs.readdirSync(__dirname + "//" + "overlay");
var overlayMp3FilesOnly = overlayFilesList.filter(file => path.extname(file).toLowerCase() === mp3FileExtension);
overlayMp3FilesOnly = overlayMp3FilesOnly.filter(file => file.toLowerCase() !== beybladeSfxFileName);
var processName = gameMemory.process_name;
var gameMemoryToDisplay = [];
var gameMemoryToOverride = [];
var freezeMovementState = false;
var gameTimeMinutesObject = {};
var gameTimeMinutesToUnfreeze = 0;
var gameTimeHoursObject = {};
var gameTimeHoursToUnfreeze = 0;
var freezeDuration = 30; // 10 minutes in game = 10 seconds irl
var playerPointerToFreeze = 0;
var vehiclePointerToFreeze = 0;
var playerLocationToFreezeObject = {};
var vehicleLocationToFreezeObject = {};
var lastChannelName = "";
var playerPointerGlobal = {};

var characterData = [{
    character_replacement_string: "\u0000",
    description: "Null",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0001",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0002",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0003",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0004",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0005",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0006",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0007",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0008",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0009",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000E",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0010",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0011",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0012",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0013",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0014",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0015",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0016",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0017",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0018",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0019",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001E",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0020",
    description: "Space",
    is_enabled: false,
    character_original_string: /\s/ig
  },
  {
    character_replacement_string: "\u0021",
    description: "Exclamation Mark",
    is_enabled: true,
    character_original_string: /\!/ig
  },
  {
    character_replacement_string: "\u0022",
    description: "Quotation Mark",
    is_enabled: true,
    character_original_string: /\"/ig
  },
  {
    character_replacement_string: "\u0023",
    description: "Number Sign",
    is_enabled: true,
    character_original_string: /\#/ig
  },
  {
    character_replacement_string: "\u0024",
    description: "Dollar Sign",
    is_enabled: true,
    character_original_string: /\$/ig
  },
  {
    character_replacement_string: "\u0025",
    description: "Percent Sign",
    is_enabled: true,
    character_original_string: /\%/ig
  },
  {
    character_replacement_string: "\u0026",
    description: "Ampersand",
    is_enabled: true,
    character_original_string: /\&/ig
  },
  {
    character_replacement_string: "\u0027",
    description: "Apostrophe",
    is_enabled: true,
    character_original_string: /\'/ig
  },
  {
    character_replacement_string: "\u0028",
    description: "Left Parenthesis",
    is_enabled: true,
    character_original_string: /\(/ig
  },
  {
    character_replacement_string: "\u0029",
    description: "Right Parenthesis",
    is_enabled: true,
    character_original_string: /\)/ig
  },
  {
    character_replacement_string: "\u002A",
    description: "Asterisk",
    is_enabled: true,
    character_original_string: /\*/ig
  },
  {
    character_replacement_string: "\u002B",
    description: "Plus Sign",
    is_enabled: true,
    character_original_string: /\+/ig
  },
  {
    character_replacement_string: "\u002C",
    description: "Comma",
    is_enabled: true,
    character_original_string: /\,/ig
  },
  {
    character_replacement_string: "\u002D",
    description: "Hyphen-Minus",
    is_enabled: true,
    character_original_string: /\-/ig
  },
  {
    character_replacement_string: "\u002E",
    description: "Full Stop",
    is_enabled: true,
    character_original_string: /\./ig
  },
  {
    character_replacement_string: "\u002F",
    description: "Solidus",
    is_enabled: true,
    character_original_string: /\//ig
  },
  {
    character_replacement_string: "\u0030",
    description: "Digit Zero",
    is_enabled: true,
    character_original_string: /0/ig
  },
  {
    character_replacement_string: "\u0031",
    description: "Digit One",
    is_enabled: true,
    character_original_string: /1/ig
  },
  {
    character_replacement_string: "\u0032",
    description: "Digit Two",
    is_enabled: true,
    character_original_string: /2/ig
  },
  {
    character_replacement_string: "\u0033",
    description: "Digit Three",
    is_enabled: true,
    character_original_string: /3/ig
  },
  {
    character_replacement_string: "\u0034",
    description: "Digit Four",
    is_enabled: true,
    character_original_string: /4/ig
  },
  {
    character_replacement_string: "\u0035",
    description: "Digit Five",
    is_enabled: true,
    character_original_string: /5/ig
  },
  {
    character_replacement_string: "\u0036",
    description: "Digit Six",
    is_enabled: true,
    character_original_string: /6/ig
  },
  {
    character_replacement_string: "\u0037",
    description: "Digit Seven",
    is_enabled: true,
    character_original_string: /7/ig
  },
  {
    character_replacement_string: "\u0038",
    description: "Digit Eight",
    is_enabled: true,
    character_original_string: /8/ig
  },
  {
    character_replacement_string: "\u0039",
    description: "Digit Nine",
    is_enabled: true,
    character_original_string: /9/ig
  },
  {
    character_replacement_string: "\u003A",
    description: "Colon",
    is_enabled: true,
    character_original_string: /\:/ig
  },
  {
    character_replacement_string: "\u003B",
    description: "Semicolon",
    is_enabled: true,
    character_original_string: /\;/ig
  },
  {
    character_replacement_string: "\u003C",
    description: "Less-Than Sign",
    is_enabled: true,
    character_original_string: /\</ig
  },
  {
    character_replacement_string: "\u003D",
    description: "Equals Sign",
    is_enabled: true,
    character_original_string: /\=/ig
  },
  {
    character_replacement_string: "\u003E",
    description: "Greater-Than Sign",
    is_enabled: true,
    character_original_string: /\>/ig
  },
  {
    character_replacement_string: "\u003F",
    description: "Question Mark",
    is_enabled: true,
    character_original_string: /\?/ig
  },
  {
    character_replacement_string: "\u0040",
    description: "Commercial At",
    is_enabled: true,
    character_original_string: /\@/ig
  },
  {
    character_replacement_string: "\u0041",
    description: "Latin Capital Letter A",
    is_enabled: true,
    character_original_string: /A/g
  },
  {
    character_replacement_string: "\u0042",
    description: "Latin Capital Letter B",
    is_enabled: true,
    character_original_string: /B/g
  },
  {
    character_replacement_string: "\u0043",
    description: "Latin Capital Letter C",
    is_enabled: true,
    character_original_string: /C/g
  },
  {
    character_replacement_string: "\u0044",
    description: "Latin Capital Letter D",
    is_enabled: true,
    character_original_string: /D/g
  },
  {
    character_replacement_string: "\u0045",
    description: "Latin Capital Letter E",
    is_enabled: true,
    character_original_string: /E/g
  },
  {
    character_replacement_string: "\u0046",
    description: "Latin Capital Letter F",
    is_enabled: true,
    character_original_string: /F/g
  },
  {
    character_replacement_string: "\u0047",
    description: "Latin Capital Letter G",
    is_enabled: true,
    character_original_string: /G/g
  },
  {
    character_replacement_string: "\u0048",
    description: "Latin Capital Letter H",
    is_enabled: true,
    character_original_string: /H/g
  },
  {
    character_replacement_string: "\u0049",
    description: "Latin Capital Letter I",
    is_enabled: true,
    character_original_string: /I/g
  },
  {
    character_replacement_string: "\u004A",
    description: "Latin Capital Letter J",
    is_enabled: true,
    character_original_string: /J/g
  },
  {
    character_replacement_string: "\u004B",
    description: "Latin Capital Letter K",
    is_enabled: true,
    character_original_string: /K/g
  },
  {
    character_replacement_string: "\u004C",
    description: "Latin Capital Letter L",
    is_enabled: true,
    character_original_string: /L/g
  },
  {
    character_replacement_string: "\u004D",
    description: "Latin Capital Letter M",
    is_enabled: true,
    character_original_string: /M/g
  },
  {
    character_replacement_string: "\u004E",
    description: "Latin Capital Letter N",
    is_enabled: true,
    character_original_string: /N/g
  },
  {
    character_replacement_string: "\u004F",
    description: "Latin Capital Letter O",
    is_enabled: true,
    character_original_string: /O/g
  },
  {
    character_replacement_string: "\u0050",
    description: "Latin Capital Letter P",
    is_enabled: true,
    character_original_string: /P/g
  },
  {
    character_replacement_string: "\u0051",
    description: "Latin Capital Letter Q",
    is_enabled: true,
    character_original_string: /Q/g
  },
  {
    character_replacement_string: "\u0052",
    description: "Latin Capital Letter R",
    is_enabled: true,
    character_original_string: /R/g
  },
  {
    character_replacement_string: "\u0053",
    description: "Latin Capital Letter S",
    is_enabled: true,
    character_original_string: /S/g
  },
  {
    character_replacement_string: "\u0054",
    description: "Latin Capital Letter T",
    is_enabled: true,
    character_original_string: /T/g
  },
  {
    character_replacement_string: "\u0055",
    description: "Latin Capital Letter U",
    is_enabled: true,
    character_original_string: /U/g
  },
  {
    character_replacement_string: "\u0056",
    description: "Latin Capital Letter V",
    is_enabled: true,
    character_original_string: /V/g
  },
  {
    character_replacement_string: "\u0057",
    description: "Latin Capital Letter W",
    is_enabled: true,
    character_original_string: /W/g
  },
  {
    character_replacement_string: "\u0058",
    description: "Latin Capital Letter X",
    is_enabled: true,
    character_original_string: /X/g
  },
  {
    character_replacement_string: "\u0059",
    description: "Latin Capital Letter Y",
    is_enabled: true,
    character_original_string: /Y/g
  },
  {
    character_replacement_string: "\u005A",
    description: "Latin Capital Letter Z",
    is_enabled: true,
    character_original_string: /Z/g
  },
  {
    character_replacement_string: "\u005B",
    description: "Left Square Bracket",
    is_enabled: true,
    character_original_string: /\[/ig
  },
  {
    character_replacement_string: "\u005C",
    description: "Reverse Solidus",
    is_enabled: true,
    character_original_string: /\\/ig
  },
  {
    character_replacement_string: "\u005D",
    description: "Right Square Bracket",
    is_enabled: true,
    character_original_string: /\]/ig
  },
  {
    character_replacement_string: "\u005E",
    description: "Circumflex Accent",
    is_enabled: true,
    character_original_string: /\^/ig
  },
  {
    character_replacement_string: "\u005F",
    description: "Low Line",
    is_enabled: true,
    character_original_string: /\_/ig
  },
  {
    character_replacement_string: "\u0060",
    description: "Grave Accent",
    is_enabled: true,
    character_original_string: /\`/ig
  },
  {
    character_replacement_string: "\u0061",
    description: "Latin Small Letter A",
    is_enabled: true,
    character_original_string: /a/g
  },
  {
    character_replacement_string: "\u0062",
    description: "Latin Small Letter B",
    is_enabled: true,
    character_original_string: /b/g
  },
  {
    character_replacement_string: "\u0063",
    description: "Latin Small Letter C",
    is_enabled: true,
    character_original_string: /c/g
  },
  {
    character_replacement_string: "\u0064",
    description: "Latin Small Letter D",
    is_enabled: true,
    character_original_string: /d/g
  },
  {
    character_replacement_string: "\u0065",
    description: "Latin Small Letter E",
    is_enabled: true,
    character_original_string: /e/g
  },
  {
    character_replacement_string: "\u0066",
    description: "Latin Small Letter F",
    is_enabled: true,
    character_original_string: /f/g
  },
  {
    character_replacement_string: "\u0067",
    description: "Latin Small Letter G",
    is_enabled: true,
    character_original_string: /g/g
  },
  {
    character_replacement_string: "\u0068",
    description: "Latin Small Letter H",
    is_enabled: true,
    character_original_string: /h/g
  },
  {
    character_replacement_string: "\u0069",
    description: "Latin Small Letter I",
    is_enabled: true,
    character_original_string: /i/g
  },
  {
    character_replacement_string: "\u006A",
    description: "Latin Small Letter J",
    is_enabled: true,
    character_original_string: /j/g
  },
  {
    character_replacement_string: "\u006B",
    description: "Latin Small Letter K",
    is_enabled: true,
    character_original_string: /k/g
  },
  {
    character_replacement_string: "\u006C",
    description: "Latin Small Letter L",
    is_enabled: true,
    character_original_string: /l/g
  },
  {
    character_replacement_string: "\u006D",
    description: "Latin Small Letter M",
    is_enabled: true,
    character_original_string: /m/g
  },
  {
    character_replacement_string: "\u006E",
    description: "Latin Small Letter N",
    is_enabled: true,
    character_original_string: /n/g
  },
  {
    character_replacement_string: "\u006F",
    description: "Latin Small Letter O",
    is_enabled: true,
    character_original_string: /o/g
  },
  {
    character_replacement_string: "\u0070",
    description: "Latin Small Letter P",
    is_enabled: true,
    character_original_string: /p/g
  },
  {
    character_replacement_string: "\u0071",
    description: "Latin Small Letter Q",
    is_enabled: true,
    character_original_string: /q/g
  },
  {
    character_replacement_string: "\u0072",
    description: "Latin Small Letter R",
    is_enabled: true,
    character_original_string: /r/g
  },
  {
    character_replacement_string: "\u0073",
    description: "Latin Small Letter S",
    is_enabled: true,
    character_original_string: /s/g
  },
  {
    character_replacement_string: "\u0074",
    description: "Latin Small Letter T",
    is_enabled: true,
    character_original_string: /t/g
  },
  {
    character_replacement_string: "\u0075",
    description: "Latin Small Letter U",
    is_enabled: true,
    character_original_string: /u/g
  },
  {
    character_replacement_string: "\u0076",
    description: "Latin Small Letter V",
    is_enabled: true,
    character_original_string: /v/g
  },
  {
    character_replacement_string: "\u0077",
    description: "Latin Small Letter W",
    is_enabled: true,
    character_original_string: /w/g
  },
  {
    character_replacement_string: "\u0078",
    description: "Latin Small Letter X",
    is_enabled: true,
    character_original_string: /x/g
  },
  {
    character_replacement_string: "\u0079",
    description: "Latin Small Letter Y",
    is_enabled: true,
    character_original_string: /y/g
  },
  {
    character_replacement_string: "\u007A",
    description: "Latin Small Letter Z",
    is_enabled: true,
    character_original_string: /z/g
  },
  {
    character_replacement_string: "\u007B",
    description: "Left Curly Bracket",
    is_enabled: true,
    character_original_string: /\{/ig
  },
  {
    character_replacement_string: "\u007C",
    description: "Vertical Line",
    is_enabled: true,
    character_original_string: /\|/ig
  },
  {
    character_replacement_string: "\u007D",
    description: "Right Curly Bracket",
    is_enabled: true,
    character_original_string: /\}/ig
  },
  {
    character_replacement_string: "\u007E",
    description: "Tilde",
    is_enabled: false,
    character_original_string: /\~/ig
  },
  {
    character_replacement_string: "\u007F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0080",
    description: "Latin Capital Letter A With Grave",
    is_enabled: true,
    character_original_string: /À/g
  },
  {
    character_replacement_string: "\u0081",
    description: "Latin Capital Letter A With Acute",
    is_enabled: true,
    character_original_string: /Á/g
  },
  {
    character_replacement_string: "\u0082",
    description: "Latin Capital Letter A With Circumflex",
    is_enabled: true,
    character_original_string: /Â/g
  },
  {
    character_replacement_string: "\u0083",
    description: "Latin Capital Letter A With Tilde",
    is_enabled: true,
    character_original_string: /Ã/g
  },
  {
    character_replacement_string: "\u0084",
    description: "Latin Capital Letter A With Diaeresis",
    is_enabled: true,
    character_original_string: /Ä/g
  },
  {
    character_replacement_string: "\u0085",
    description: "Latin Capital Letter A With Ring Above",
    is_enabled: true,
    character_original_string: /Å/g
  },
  {
    character_replacement_string: "\u0086",
    description: "Latin Capital Letter Ae",
    is_enabled: true,
    character_original_string: /Æ/g
  },
  {
    character_replacement_string: "\u0087",
    description: "Latin Capital Letter C With Cedilla",
    is_enabled: true,
    character_original_string: /Ç/g
  },
  {
    character_replacement_string: "\u0088",
    description: "Latin Capital Letter E With Grave",
    is_enabled: true,
    character_original_string: /È/g
  },
  {
    character_replacement_string: "\u0089",
    description: "Latin Capital Letter E With Acute",
    is_enabled: true,
    character_original_string: /É/g
  },
  {
    character_replacement_string: "\u008A",
    description: "Latin Capital Letter E With Circumflex",
    is_enabled: true,
    character_original_string: /Ê/g
  },
  {
    character_replacement_string: "\u008B",
    description: "Latin Capital Letter E With Diaeresis",
    is_enabled: true,
    character_original_string: /Ë/g
  },
  {
    character_replacement_string: "\u008C",
    description: "Latin Capital Letter I With Grave",
    is_enabled: true,
    character_original_string: /Ì/g
  },
  {
    character_replacement_string: "\u008D",
    description: "Latin Capital Letter I With Acute",
    is_enabled: true,
    character_original_string: /Í/g
  },
  {
    character_replacement_string: "\u008E",
    description: "Latin Capital Letter I With Circumflex",
    is_enabled: true,
    character_original_string: /Î/g
  },
  {
    character_replacement_string: "\u008F",
    description: "Latin Capital Letter I With Diaeresis",
    is_enabled: true,
    character_original_string: /Ï/g
  },
  {
    character_replacement_string: "\u0090",
    description: "Latin Capital Letter Eth",
    is_enabled: true,
    character_original_string: /Ð/g
  },
  {
    character_replacement_string: "\u0091",
    description: "Latin Capital Letter N With Tilde",
    is_enabled: true,
    character_original_string: /Ñ/g
  },
  {
    character_replacement_string: "\u0092",
    description: "Latin Capital Letter O With Grave",
    is_enabled: true,
    character_original_string: /Ò/g
  },
  {
    character_replacement_string: "\u0093",
    description: "Latin Capital Letter O With Acute",
    is_enabled: true,
    character_original_string: /Ó/g
  },
  {
    character_replacement_string: "\u0094",
    description: "Latin Capital Letter O With Circumflex",
    is_enabled: true,
    character_original_string: /Ô/g
  },
  {
    character_replacement_string: "\u0095",
    description: "Latin Capital Letter O With Tilde",
    is_enabled: true,
    character_original_string: /Õ/g
  },
  {
    character_replacement_string: "\u0096",
    description: "Latin Capital Letter O With Diaeresis",
    is_enabled: true,
    character_original_string: /Ö/g
  },
  {
    character_replacement_string: "\u0097",
    description: "Multiplication Sign",
    is_enabled: true,
    character_original_string: /\×/ig
  },
  {
    character_replacement_string: "\u0098",
    description: "Latin Capital Letter O With Stroke",
    is_enabled: true,
    character_original_string: /Ø/g
  },
  {
    character_replacement_string: "\u0099",
    description: "Latin Capital Letter U With Grave",
    is_enabled: true,
    character_original_string: /Ù/g
  },
  {
    character_replacement_string: "\u009A",
    description: "Latin Capital Letter U With Acute",
    is_enabled: true,
    character_original_string: /Ú/g
  },
  {
    character_replacement_string: "\u009B",
    description: "Latin Capital Letter U With Circumflex",
    is_enabled: true,
    character_original_string: /Û/g
  },
  {
    character_replacement_string: "\u009C",
    description: "Latin Capital Letter U With Diaeresis",
    is_enabled: true,
    character_original_string: /Ü/g
  },
  {
    character_replacement_string: "\u009D",
    description: "Latin Capital Letter Y With Acute",
    is_enabled: true,
    character_original_string: /Ý/g
  },
  {
    character_replacement_string: "\u009E",
    description: "Latin Capital Letter Thorn",
    is_enabled: true,
    character_original_string: /Þ/g
  },
  {
    character_replacement_string: "\u009F",
    description: "Latin Small Letter Sharp S",
    is_enabled: true,
    character_original_string: /ß/g
  },
  {
    character_replacement_string: "\u00A0",
    description: "Latin Small Letter A With Grave",
    is_enabled: true,
    character_original_string: /à/g
  },
  {
    character_replacement_string: "\u00A1",
    description: "Latin Small Letter A With Acute",
    is_enabled: true,
    character_original_string: /á/g
  },
  {
    character_replacement_string: "\u00A2",
    description: "Latin Small Letter A With Circumflex",
    is_enabled: true,
    character_original_string: /â/g
  },
  {
    character_replacement_string: "\u00A3",
    description: "Latin Small Letter A With Tilde",
    is_enabled: true,
    character_original_string: /ã/g
  },
  {
    character_replacement_string: "\u00A4",
    description: "Latin Small Letter A With Diaeresis",
    is_enabled: true,
    character_original_string: /ä/g
  },
  {
    character_replacement_string: "\u00A5",
    description: "Latin Small Letter A With Ring Above",
    is_enabled: true,
    character_original_string: /å/g
  },
  {
    character_replacement_string: "\u00A6",
    description: "Latin Small Letter Ae",
    is_enabled: true,
    character_original_string: /æ/g
  },
  {
    character_replacement_string: "\u00A7",
    description: "Latin Small Letter C With Cedilla",
    is_enabled: true,
    character_original_string: /ç/g
  },
  {
    character_replacement_string: "\u00A8",
    description: "Latin Small Letter E With Grave",
    is_enabled: true,
    character_original_string: /è/g
  },
  {
    character_replacement_string: "\u00A9",
    description: "Latin Small Letter E With Acute",
    is_enabled: true,
    character_original_string: /é/g
  },
  {
    character_replacement_string: "\u00AA",
    description: "Latin Small Letter E With Circumflex",
    is_enabled: true,
    character_original_string: /ê/g
  },
  {
    character_replacement_string: "\u00AB",
    description: "Latin Small Letter E With Diaeresis",
    is_enabled: true,
    character_original_string: /ë/g
  },
  {
    character_replacement_string: "\u00AC",
    description: "Latin Small Letter I With Grave",
    is_enabled: true,
    character_original_string: /ì/g
  },
  {
    character_replacement_string: "\u00AD",
    description: "Latin Small Letter I With Acute",
    is_enabled: true,
    character_original_string: /í/g
  },
  {
    character_replacement_string: "\u00AE",
    description: "Latin Small Letter I With Circumflex",
    is_enabled: true,
    character_original_string: /î/g
  },
  {
    character_replacement_string: "\u00AF",
    description: "Latin Small Letter I With Diaeresis",
    is_enabled: true,
    character_original_string: /ï/g
  },
  {
    character_replacement_string: "\u00B0",
    description: "Latin Small Letter Eth",
    is_enabled: true,
    character_original_string: /ð/g
  },
  {
    character_replacement_string: "\u00B1",
    description: "Latin Small Letter N With Tilde",
    is_enabled: true,
    character_original_string: /ñ/g
  },
  {
    character_replacement_string: "\u00B2",
    description: "Latin Small Letter O With Grave",
    is_enabled: true,
    character_original_string: /ò/g
  },
  {
    character_replacement_string: "\u00B3",
    description: "Latin Small Letter O With Acute",
    is_enabled: true,
    character_original_string: /ó/g
  },
  {
    character_replacement_string: "\u00B4",
    description: "Latin Small Letter O With Circumflex",
    is_enabled: true,
    character_original_string: /ô/g
  },
  {
    character_replacement_string: "\u00B5",
    description: "Latin Small Letter O With Tilde",
    is_enabled: true,
    character_original_string: /õ/g
  },
  {
    character_replacement_string: "\u00B6",
    description: "Latin Small Letter O With Diaeresis",
    is_enabled: true,
    character_original_string: /ö/g
  },
  {
    character_replacement_string: "\u00B7",
    description: "Division Sign",
    is_enabled: true,
    character_original_string: /\÷/ig
  },
  {
    character_replacement_string: "\u00B8",
    description: "Latin Small Letter O With Stroke",
    is_enabled: true,
    character_original_string: /ø/g
  },
  {
    character_replacement_string: "\u00B9",
    description: "Latin Small Letter U With Grave",
    is_enabled: true,
    character_original_string: /ù/g
  },
  {
    character_replacement_string: "\u00BA",
    description: "Latin Small Letter U With Acute",
    is_enabled: true,
    character_original_string: /ú/g
  },
  {
    character_replacement_string: "\u00BB",
    description: "Latin Small Letter U With Circumflex",
    is_enabled: true,
    character_original_string: /û/g
  },
  {
    character_replacement_string: "\u00BC",
    description: "Latin Small Letter U With Diaeresis",
    is_enabled: true,
    character_original_string: /ü/g
  },
  {
    character_replacement_string: "\u00BD",
    description: "Latin Small Letter Y With Acute",
    is_enabled: true,
    character_original_string: /ý/g
  },
  {
    character_replacement_string: "\u00BE",
    description: "Latin Small Letter Thorn",
    is_enabled: true,
    character_original_string: /þ/g
  },
  {
    character_replacement_string: "\u00BF",
    description: "Latin Small Letter Y With Diaeresis",
    is_enabled: true,
    character_original_string: /ÿ/g
  },
  {
    character_replacement_string: "\u00C0",
    description: "Euro Sign",
    is_enabled: true,
    character_original_string: /\€/ig
  },
  {
    character_replacement_string: "\u00C1",
    description: "Single Low-9 Quotation Mark",
    is_enabled: true,
    character_original_string: /\‚/ig
  },
  {
    character_replacement_string: "\u00C2",
    description: "Double Low-9 Quotation Mark",
    is_enabled: true,
    character_original_string: /\„/ig
  },
  {
    character_replacement_string: "\u00C3",
    description: "Circumflex Accent",
    is_enabled: true,
    character_original_string: /\^/ig
  },
  {
    character_replacement_string: "\u00C4",
    description: "Single Left-Pointing Angle Quotation Mark",
    is_enabled: true,
    character_original_string: /\‹/ig
  },
  {
    character_replacement_string: "\u00C5",
    description: "Latin Capital Ligature Oe",
    is_enabled: true,
    character_original_string: /Œ/i
  },
  {
    character_replacement_string: "\u00C6",
    description: "Left Single Quotation Mark",
    is_enabled: true,
    character_original_string: /\‘/ig
  },
  {
    character_replacement_string: "\u00C7",
    description: "Right Single Quotation Mark",
    is_enabled: true,
    character_original_string: /\’/ig
  },
  {
    character_replacement_string: "\u00C8",
    description: "Left Double Quotation Mark",
    is_enabled: true,
    character_original_string: /\“/ig
  },
  {
    character_replacement_string: "\u00C9",
    description: "Right Double Quotation Mark",
    is_enabled: true,
    character_original_string: /\”/ig
  },
  {
    character_replacement_string: "\u00CA",
    description: "Small Tilde",
    is_enabled: true,
    character_original_string: /\˜/ig
  },
  {
    character_replacement_string: "\u00CB",
    description: "Trade Mark Sign",
    is_enabled: true,
    character_original_string: /\™/ig
  },
  {
    character_replacement_string: "\u00CC",
    description: "Single Right-Pointing Angle Quotation Mark",
    is_enabled: true,
    character_original_string: /\›/ig
  },
  {
    character_replacement_string: "\u00CD",
    description: "Latin Small Ligature Oe",
    is_enabled: true,
    character_original_string: /œ/g
  },
  {
    character_replacement_string: "\u00CE",
    description: "Latin Capital Letter Y With Diaeresis",
    is_enabled: true,
    character_original_string: /Ÿ/g
  },
  {
    character_replacement_string: "\u00CF",
    description: "Inverted Exclamation Mark",
    is_enabled: true,
    character_original_string: /\¡/ig
  },
  {
    character_replacement_string: "\u00D0",
    description: "Cent Sign",
    is_enabled: true,
    character_original_string: /\¢/ig
  },
  {
    character_replacement_string: "\u00D1",
    description: "Pound Sign",
    is_enabled: true,
    character_original_string: /\£/ig
  },
  {
    character_replacement_string: "\u00D2",
    description: "Currency Sign",
    is_enabled: true,
    character_original_string: /\¤/ig
  },
  {
    character_replacement_string: "\u00D3",
    description: "Yen Sign",
    is_enabled: true,
    character_original_string: /\¥/ig
  },
  {
    character_replacement_string: "\u00D4",
    description: "Broken Bar",
    is_enabled: true,
    character_original_string: /\¦/ig
  },
  {
    character_replacement_string: "\u00D5",
    description: "Section Sign",
    is_enabled: true,
    character_original_string: /\§/ig
  },
  {
    character_replacement_string: "\u00D6",
    description: "Diaeresis",
    is_enabled: true,
    character_original_string: /\¨/ig
  },
  {
    character_replacement_string: "\u00D7",
    description: "Copyright Sign",
    is_enabled: true,
    character_original_string: /\©/ig
  },
  {
    character_replacement_string: "\u00D8",
    description: "Feminine Ordinal Indicator",
    is_enabled: true,
    character_original_string: /\ª/ig
  },
  {
    character_replacement_string: "\u00D9",
    description: "Left-Pointing Double Angle Quotation Mark",
    is_enabled: true,
    character_original_string: /\«/ig
  },
  {
    character_replacement_string: "\u00DA",
    description: "Registered Sign",
    is_enabled: true,
    character_original_string: /\®/ig
  },
  {
    character_replacement_string: "\u00DB",
    description: "Masculine Ordinal Indicator",
    is_enabled: true,
    character_original_string: /\º/ig
  },
  {
    character_replacement_string: "\u00DC",
    description: "Acute Accent",
    is_enabled: true,
    character_original_string: /\´/ig
  },
  {
    character_replacement_string: "\u00DD",
    description: "Right-Pointing Double Angle Quotation Mark",
    is_enabled: true,
    character_original_string: /\»/ig
  },
  {
    character_replacement_string: "\u00DE",
    description: "Inverted Question Mark",
    is_enabled: true,
    character_original_string: /\¿/ig
  },
  {
    character_replacement_string: "\u00DF",
    description: "Replacement Character",
    is_enabled: true,
    character_original_string: /\�/ig
  },
  {
    character_replacement_string: "\u00E0",
    description: "Triangle Button",
    is_enabled: true,
    character_original_string: /\:triangle\:/ig
  },
  {
    character_replacement_string: "\u00E1",
    description: "Square Button",
    is_enabled: true,
    character_original_string: /\:square\:/ig
  },
  {
    character_replacement_string: "\u00E2",
    description: "Cross Button",
    is_enabled: true,
    character_original_string: /\:cross\:/ig
  },
  {
    character_replacement_string: "\u00E3",
    description: "Circle Button",
    is_enabled: true,
    character_original_string: /\:circle\:/ig
  },
  {
    character_replacement_string: "\u00E4",
    description: "Left Arrow",
    is_enabled: true,
    character_original_string: /\:left\:/ig
  },
  {
    character_replacement_string: "\u00E5",
    description: "Down Arrow",
    is_enabled: true,
    character_original_string: /\:down\:/ig
  },
  {
    character_replacement_string: "\u00E6",
    description: "Right Arrow",
    is_enabled: true,
    character_original_string: /\:right\:/ig
  },
  {
    character_replacement_string: "\u00E7",
    description: "No-Break Space",
    is_enabled: false,
    character_original_string: /\ /ig
  },
  {
    character_replacement_string: "\u00E8",
    description: "Tilde",
    is_enabled: false,
    character_original_string: /\~/ig
  },
  {
    character_replacement_string: "\u00E9",
    description: "Modifier Letter Circumflex Accent",
    is_enabled: true,
    character_original_string: /\ˆ/ig
  },
  {
    character_replacement_string: "\u00EA",
    description: "Em Space",
    is_enabled: true,
    character_original_string: /\ /ig
  },
  {
    character_replacement_string: "\u00EB",
    description: "Three-Per-Em Space",
    is_enabled: true,
    character_original_string: /\ /ig
  },
  {
    character_replacement_string: "\u00EC",
    description: "Four-Per-Em Space",
    is_enabled: true,
    character_original_string: /\ /ig
  },
  {
    character_replacement_string: "\u00ED",
    description: "Six-Per-Em Space",
    is_enabled: true,
    character_original_string: /\ /ig
  },
  {
    character_replacement_string: "\u00EE",
    description: "Figure Space",
    is_enabled: true,
    character_original_string: /\ /ig
  },
  {
    character_replacement_string: "\u00EF",
    description: "Punctuation Space",
    is_enabled: true,
    character_original_string: /\ /ig
  },
  {
    character_replacement_string: "\u00F0",
    description: "Thin Space",
    is_enabled: true,
    character_original_string: /\ /ig
  },
  {
    character_replacement_string: "\u00F1",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F2",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F3",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F4",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F5",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F6",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F7",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F8",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F9",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FA",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FB",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FC",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FD",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FE",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FF",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  }
];

var controlCharacterData = [{
    character_replacement_string: "\u0000",
    description: "Null",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0001",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0002",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0003",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0004",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0005",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0006",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0007",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0008",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0009",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000E",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u000F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0010",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0011",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0012",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0013",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0014",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0015",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0016",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0017",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0018",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0019",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001E",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u001F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0020",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0021",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0022",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0023",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0024",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0025",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0026",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0027",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0028",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0029",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u002A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u002B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u002C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u002D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u002E",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u002F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0030",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0031",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0032",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0033",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0034",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0035",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0036",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0037",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0038",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0039",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u003A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u003B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u003C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u003D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u003E",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u003F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0040",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0041",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "~\u0042~",
    description: "Bold Text",
    is_enabled: true,
    character_original_string: /(\:bold\:)+/ig
  },
  {
    character_replacement_string: "\u0043",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0044",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0045",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0046",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0047",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "~\u0048~",
    description: "Highlight Text",
    is_enabled: true,
    character_original_string: /(\:highlight\:)+/ig
  },
  {
    character_replacement_string: "\u0049",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u004A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u004B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u004C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u004D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: " ~\u004E~ ",
    description: "New Line",
    is_enabled: true,
    character_original_string: /\:newline\:/ig
  },
  {
    character_replacement_string: "\u004F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0050",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0051",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0052",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0053",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0054",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0055",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0056",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0057",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0058",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "~\u0059~",
    description: "Yellow Text",
    is_enabled: true,
    character_original_string: /(\:yellow\:)+/ig
  },
  {
    character_replacement_string: "\u005A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u005B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u005C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u005D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u005E",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u005F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0060",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0061",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "~\u0062~",
    description: "Blue Text",
    is_enabled: true,
    character_original_string: /(\:blue\:)+/ig
  },
  {
    character_replacement_string: "\u0063",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0064",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0065",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0066",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "~\u0067~",
    description: "Green Text",
    is_enabled: true,
    character_original_string: /(\:green\:)+/ig
  },
  {
    character_replacement_string: "~\u0068~",
    description: "Highlight Text",
    is_enabled: true,
    character_original_string: /(\:highlight\:)+/ig
  },
  {
    character_replacement_string: "\u0069",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u006A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u006B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u006C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u006D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: " ~\u006E~ ",
    description: "New Line",
    is_enabled: true,
    character_original_string: /\:newline\:/ig
  },
  {
    character_replacement_string: "~\u006F~",
    description: "Orange Text",
    is_enabled: true,
    character_original_string: /(\:orange\:)+/ig
  },
  {
    character_replacement_string: "~\u0070~",
    description: "Purple Text",
    is_enabled: true,
    character_original_string: /(\:purple\:)+/ig
  },
  {
    character_replacement_string: "~\u0071~",
    description: "Pink Text",
    is_enabled: true,
    character_original_string: /(\:pink\:)+/ig
  },
  {
    character_replacement_string: "~\u0072~",
    description: "Red Text",
    is_enabled: true,
    character_original_string: /(\:red\:)+/ig
  },
  {
    character_replacement_string: "\u0073",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "~\u0074~",
    description: "Teal Text",
    is_enabled: true,
    character_original_string: /(\:teal\:)+/ig
  },
  {
    character_replacement_string: "\u0075",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0076",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "~\u0077~",
    description: "White Text",
    is_enabled: true,
    character_original_string: /(\:white\:)+/ig
  },
  {
    character_replacement_string: "~\u0078~",
    description: "Cyan Text",
    is_enabled: true,
    character_original_string: /(\:cyan\:)+/ig
  },
  {
    character_replacement_string: "~\u0079~",
    description: "Yellow Text",
    is_enabled: true,
    character_original_string: /(\:yellow\:)+/ig
  },
  {
    character_replacement_string: "\u007A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u007B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u007C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u007D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u007E",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u007F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0080",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0081",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0082",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0083",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0084",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0085",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0086",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0087",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0088",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0089",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u008A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u008B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u008C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u008D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u008E",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u008F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0090",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0091",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0092",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0093",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0094",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0095",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0096",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0097",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0098",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u0099",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u009A",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u009B",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u009C",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u009D",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u009E",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u009F",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00A0",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00A1",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00A2",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00A3",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00A4",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00A5",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00A6",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00A7",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00A8",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00A9",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00AA",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00AB",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00AC",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00AD",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00AE",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00AF",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00B0",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00B1",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00B2",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00B3",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00B4",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00B5",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00B6",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00B7",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00B8",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00B9",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00BA",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00BB",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00BC",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00BD",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00BE",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00BF",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00C0",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00C1",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00C2",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00C3",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00C4",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00C5",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00C6",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00C7",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00C8",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00C9",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00CA",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00CB",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00CC",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00CD",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00CE",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00CF",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00D0",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00D1",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00D2",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00D3",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00D4",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00D5",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00D6",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00D7",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00D8",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00D9",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00DA",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00DB",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00DC",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00DD",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00DE",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00DF",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00E0",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00E1",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00E2",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00E3",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00E4",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00E5",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00E6",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00E7",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00E8",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00E9",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00EA",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00EB",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00EC",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00ED",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00EE",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00EF",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F0",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F1",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F2",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F3",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F4",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F5",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F6",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F7",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F8",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00F9",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FA",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FB",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FC",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FD",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FE",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  },
  {
    character_replacement_string: "\u00FF",
    description: "Unused",
    is_enabled: false,
    character_original_string: ""
  }
];

var emptyWeaponInventory = fs.readFileSync("empty_weapon_inventory_data.bin", "binary");
var emptyWeaponInventoryBuffer = Buffer.alloc(280, 0);
emptyWeaponInventoryBuffer.write(emptyWeaponInventory, 0, 280, "binary");

var currentWeaponInventory = undefined;
var oldWeaponInventory = undefined;

var startPointerAddress = 0x01000000;
var endPointerAddress = 0x02000000;

var pcsx2BaseAddressPointers = [0x7FF6FF793048, 0x7FF6FF793060, 0x7FF6FF793090, 0x7FF70ACAA140]; // For now it's fine to have these hardcoded, if these ever start to change, I'll move those to the config files (Hopefully they'll only start changing in a few years, and not in a few days) (IT ALREADY BROKE, ITS IMPOSSIBLE TO FIND THE BASE ADDRESS)
var pcsx2BaseAddresses = [0x0000000000000000, 0x0000000000000000, 0x0000000000000000, 0x0000000000000000];
var validAddressWherePcsx2PointersShouldStart = 0x00007FF000000000;
var pcsx2RamSize = 0x02A84000;

var client = new tmi.client(chatConfig);
client.connect();

client.on("raw_message", onRawMessageHandler);
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

function onMessageHandler(target, tags, message, self) {
  if (self == true) {
    return;
  } // Ignore messages from the bot
  lastChannelName = target;
  //console.log(target);
  //console.log(tags);
  //console.log(message);
  //console.log(self);
  let messageType = tags["message-type"];
  let displayName = tags["display-name"];
  let username = tags["username"];
  let customRewardId = tags["custom-reward-id"];
  let msgTimestamp = tags["tmi-sent-ts"];
  let userId = tags["user-id"];
  let messageWords = message.split(/\s+/ig);
  let messageToWrite = "";
  let finalUsername = "";
  let notifMessage = "";
  username = username.replace(/(\\s)+/ig, "");
  username = username.replace(/\s+/ig, "");
  displayName = displayName.replace(/(\\s)+/ig, "");
  displayName = displayName.replace(/\s+/ig, "");
  //username = username.replace(/(\\s)+/ig, "");
  //username = username.replace(/\s+/ig, "");
  //displayName = displayName.replace(/(\\s)+/ig, "");
  //displayName = displayName.replace(/\s+/ig, "");
  //console.log(tags);
  //console.log(target);
  //console.log("TAGS " + tags);
  //console.log(tags["custom-reward-id"]);
  //console.log(msg);
  //console.log(self);
  //console.log(tags);
  //console.log(message);
  //console.log(displayName.compareToIgnoreCase(username));
  if (messageType == "chat" || messageType == "action") {
    //console.log("MSGTIMESTAMP: " + new Date(Number(msgTimestamp)).toISOString());
    //console.log("This message is " + messageType);
    if (displayName.toUpperCase() == username.toUpperCase()) {
      //messageToWrite = displayName + ": " + message;
      finalUsername = displayName;
    }
    if (displayName.toUpperCase() != username.toUpperCase()) {
      //messageToWrite = username + ": " + message;
      finalUsername = username;
    }
    messageToWrite = message;
    let githubPrefixCheck = /^[!\"#$%&'()*+,\-./:;%=%?@\[\\\]^_`{|}~¡¦¨«¬­¯°±»½⅔¾⅝⅞∅ⁿ№★†‡‹›¿‰℅æßçñ¹⅓¼⅛²⅜³⁴₱€¢£¥—–·„“”‚‘’•√π÷×¶∆′″§Π♣♠♥♪♦∞≠≈©®™✓‛‟❛❜❝❞❟❠❮❯⹂〝〞〟＂🙶🙷🙸󠀢⍻✅✔𐄂🗸‱]*\s*(github)+|(source(\s*code)*)+/ig.test(message);
    if (githubPrefixCheck == true) {
      client.action(target, "@" + finalUsername + " The source code for GTA LCS Chaos Mod can be found here: " + "https://github.com/WhatAboutGaming/gta-lcs-ps2-chaos-mod");
    }
    let trustedUsersIndex = chatConfig.trusted_users.findIndex(element => element == userId);
    if (trustedUsersIndex >= 0) {
      // This is a trusted user
      let toggleFrameLimiterPrefixCheck = /^[!\"#$%&'()*+,\-./:;%=%?@\[\\\]^_`{|}~¡¦¨«¬­¯°±»½⅔¾⅝⅞∅ⁿ№★†‡‹›¿‰℅æßçñ¹⅓¼⅛²⅜³⁴₱€¢£¥—–·„“”‚‘’•√π÷×¶∆′″§Π♣♠♥♪♦∞≠≈©®™✓‛‟❛❜❝❞❟❠❮❯⹂〝〞〟＂🙶🙷🙸󠀢⍻✅✔𐄂🗸‱]*\s*(toggle\s*frame\s*limiter)+/ig.test(message);
      if (toggleFrameLimiterPrefixCheck == true) {
        // Uhhh do the thing to change the framelimiter in the game's memory
        if (processObject == undefined) {
          let returnMessage = "Can't toggle frame limiter, emulator is not running!";
          client.action(target, "@" + finalUsername + " " + returnMessage);
          return returnMessage;
        }
        let playerPointer = readFromAppMemory("Player Pointer").current_value;
        if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
          let returnMessage = "Can't toggle frame limiter, game is not running!";
          client.action(target, "@" + finalUsername + " " + returnMessage);
          return returnMessage;
        }
        let frameLimiterValue = readFromAppMemory("Frame Limiter").current_value;
        if (frameLimiterValue != gameMemory.frame_limiter_options.frame_limiter_off) {
          writeToAppMemory("Frame Limiter", gameMemory.frame_limiter_options.frame_limiter_off);
          let returnMessage = "Disabled frame limiter!";
          writeToNotificationBox(returnMessage);
          client.action(target, "@" + finalUsername + " " + returnMessage);
          return returnMessage;
        }
        if (frameLimiterValue == gameMemory.frame_limiter_options.frame_limiter_off) {
          writeToAppMemory("Frame Limiter", gameMemory.frame_limiter_options.frame_limiter_on);
          let returnMessage = "Enabled frame limiter!";
          writeToNotificationBox(returnMessage);
          client.action(target, "@" + finalUsername + " " + returnMessage);
          return returnMessage;
        }
      }
    }
    if (customRewardId != undefined) {
      console.log(new Date().toISOString() + " CUSTOM REWARD ID " + customRewardId);
      doCustomReward(finalUsername, message, target, customRewardId);
    }
    if (customRewardId == undefined) {
      let processedMessage = processTextForNotificationBox(messageToWrite);
      if (processedMessage.length > 0) {
        //console.log(new Date().toISOString() + " [NOTIFBOX] " + writeToNotificationBox(finalUsername + ": " + processedMessage).current_value.toString("utf16le"));
        writeToNotificationBox(finalUsername + ": " + processedMessage);
      }
    }
    //writeToNotificationBox(finalUsername + ": " + messageToWrite);
    //writeMessageToGame(finalUsername, messageToWrite);
  }
  //console.log(username);
  //console.log(tags["display-name"]);
  //console.log(finalUsername + ": " + messageToWrite);
}

function onConnectedHandler(addr, port) {
  console.log("* Connected to " + addr + ":" + port);
  client.action(chatConfig.main_channel, new Date().toISOString() + " Connected! PogChamp");
  //client.join("twitchplayspokemon"); // Join a channel
  //client.raw("PING"); // This is how you send a raw line
}

function onRawMessageHandler(messageCloned, message) {
  let timeStamp = new Date().toISOString();
  if (chatConfig.logchat == true) {
    console.log(timeStamp + " [CHAT] " + message.raw);
  }
}

function keepMovementFrozen() {
  // Freeze movement block
  if (freezeMovementState == false) {
    return;
  }
  let playerPointer = 0;
  let vehiclePointer = 0;
  playerPointerToFreeze = 0;
  vehiclePointerToFreeze = 0;
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    //returnMessage = "Can't freeze movement, game is not ready, please request a refund!";
    //client.action(channelName, "@" + username + " " + returnMessage);
    //return returnMessage;
    return;
  }
  // Freeze player
  gameTimeMinutesObject = readFromAppMemory("Minutes");
  gameTimeHoursObject = readFromAppMemory("Hours");
  if (freezeMovementState == true) {
    //console.log("TESTING A");
    // The way this is done right now means that the movement is super slow and jittery but not completely frozen, fix this somehow!
    writeToAppPointer("Player Pointer", "Player Position X", playerLocationToFreezeObject.playerPositionX);
    writeToAppPointer("Player Pointer", "Player Position Y", playerLocationToFreezeObject.playerPositionY);
    writeToAppPointer("Player Pointer", "Player Position Z", playerLocationToFreezeObject.playerPositionZ);
    writeToAppPointer("Player Pointer", "Player Speed X", 0);
    writeToAppPointer("Player Pointer", "Player Speed Y", 0);
    writeToAppPointer("Player Pointer", "Player Speed Z", 0);
    writeToAppPointer("Player Pointer", "Player Heading", playerLocationToFreezeObject.playerHeading);
    playerPointerToFreeze = playerPointer;
    vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
    if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
      // Freeze vehicle AND player
      writeToAppPointer("Vehicle Pointer", "Vehicle Position X", vehicleLocationToFreezeObject.vehiclePositionX);
      writeToAppPointer("Vehicle Pointer", "Vehicle Position Y", vehicleLocationToFreezeObject.vehiclePositionY);
      writeToAppPointer("Vehicle Pointer", "Vehicle Position Z", vehicleLocationToFreezeObject.vehiclePositionZ);
      writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", 0);
      writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", 0);
      writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", 0);
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS", vehicleLocationToFreezeObject.vehicleRotationNS);
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW", vehicleLocationToFreezeObject.vehicleRotationEW);
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR", vehicleLocationToFreezeObject.vehicleRotationTiltLR);
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2", vehicleLocationToFreezeObject.vehicleRotationEW2);
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2", vehicleLocationToFreezeObject.vehicleRotationNS2);
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD", vehicleLocationToFreezeObject.vehicleRotationTiltUD);
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", 0);
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", 0);
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", 0);
      vehiclePointerToFreeze = vehiclePointer;
    }
    if (gameTimeMinutesObject.current_value == gameTimeMinutesToUnfreeze) {
      writeToAppPointer("Player Pointer", "Player Speed X", playerLocationToFreezeObject.playerSpeedX);
      writeToAppPointer("Player Pointer", "Player Speed Y", playerLocationToFreezeObject.playerSpeedY);
      writeToAppPointer("Player Pointer", "Player Speed Z", playerLocationToFreezeObject.playerSpeedZ);
      if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
        writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", vehicleLocationToFreezeObject.vehicleSpeedX);
        writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", vehicleLocationToFreezeObject.vehicleSpeedY);
        writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", vehicleLocationToFreezeObject.vehicleSpeedZ);
        writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", vehicleLocationToFreezeObject.vehicleRotationSpeedX);
        writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", vehicleLocationToFreezeObject.vehicleRotationSpeedY);
        writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", vehicleLocationToFreezeObject.vehicleRotationSpeedZ);
      }
      // End freeze movement
      //console.log("TESTING B");
      freezeMovementState = false;
      returnMessage = "Movement now unfrozen! The time is " + gameTimeHoursObject.current_value.toString().padStart(2, "0") + ":" + gameTimeMinutesObject.current_value.toString().padStart(2, "0") + "!";
      writeToNotificationBox(returnMessage);
      client.action(lastChannelName, returnMessage);
      return returnMessage;
    }
  }
}

function overrideGameSettings() {
  // Override some game settings to specific values when player pointer changes to a valid address
  console.log(new Date().toISOString() + " Overriding game settings");
  for (let gameMemoryToOverrideIndex = 0; gameMemoryToOverrideIndex < gameMemoryToOverride.length; gameMemoryToOverrideIndex++) {
    //console.log(new Date().toISOString() + " [" + gameMemoryToOverrideIndex + "] Overriding " + gameMemoryToOverride[gameMemoryToOverrideIndex].address_name + " with " + gameMemoryToOverride[gameMemoryToOverrideIndex].value_to_override_with)
    writeToAppMemory(gameMemoryToOverride[gameMemoryToOverrideIndex].address_name, gameMemoryToOverride[gameMemoryToOverrideIndex].value_to_override_with);
    //console.log(new Date().toISOString() + " [" + gameMemoryToOverrideIndex + "] Overrode " + gameMemoryToOverride[gameMemoryToOverrideIndex].address_name + " with " + gameMemoryToOverride[gameMemoryToOverrideIndex].value_to_override_with)
  }
  /*
  writeToAppMemory("Brightness", 1024); // Turn brightness up high so twitch doesn't completely destroy the video quality of this dark game
  writeToAppMemory("Screen Position X", 0); // Set screen position to center
  writeToAppMemory("Screen Position Y", 0); // Set screen position to center
  writeToAppMemory("Wide Screen Option", 1); // Enable Widescreen
  writeToAppMemory("SFX Volume (Settings menu)", 127); // Turn all the volumes all the way up, again because of twitch
  writeToAppMemory("SFX Volume", 127); // Turn all the volumes all the way up, again because of twitch
  writeToAppMemory("SFX Volume 2 (Fade volume)", 127); // Turn all the volumes all the way up, again because of twitch
  writeToAppMemory("Radio Volume (Settings menu)", 127); // Turn all the volumes all the way up, again because of twitch
  writeToAppMemory("Radio Volume", 127); // Turn all the volumes all the way up, again because of twitch
  writeToAppMemory("Radio Volume 2 (Fade volume)", 127); // Turn all the volumes all the way up, again because of twitch
  writeToAppMemory("Subtitles Option", 1); // Enable subtitles because some viewers might appreciate it
  writeToAppMemory("Hud Mode Option", 1); // Enable HUD
  writeToAppMemory("Radar Mode Option", 0); // Enable Map & Blips
  writeToAppMemory("Vibration Option", 1); // Enable Controller Vibration
  writeToAppMemory("Invert Look Option", 0); // Invert X-Axis Look, 0 is ON for some reason
  writeToAppMemory("Controller Configuration Option", 0); // Use a controller configuration that's actually good for the PS2 controller (0 = Full PS2 controller support, 1 = PSP-like controls)
  writeToAppMemory("Controller Type", 0); // 0 = In car, 1 = On foot (This doesn't really change anything in the game, just displays how the controls are)
  */
  console.log(new Date().toISOString() + " Overrode game settings");
}

function doTimedAction() {
  keepMovementFrozen();
}

function doCustomReward(username, message, channelName, customRewardId) {
  let notifMessage = "";
  if (customRewardId == undefined) {
    return;
  }
  if (customRewardId != undefined) {
    let customRewardIndex = rewardsConfig.rewards.findIndex(element => element.custom_reward_id == customRewardId);
    if (customRewardIndex <= -1) {
      return;
    }
    if (customRewardIndex > -1) {
      //console.log(rewardsConfig.rewards[customRewardIndex].custom_reward_id);
      if (rewardsConfig.rewards[customRewardIndex].action == "warp") {
        prepareToWarp(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "player_health") {
        changePlayerHealth(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "vehicle_health") {
        changeVehicleHealth(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "spin_car") {
        spinCar(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "vehicle_color") {
        changeVehicleColor(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "flip_vehicle") {
        flipVehicleUpsideDown(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "turn_around") {
        turnAround(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "change_speed") {
        changeSpeed(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "radio_station") {
        changeRadioStation(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "add_vehicle_to_garage") {
        addVehicleToGarage(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "take_weapons_away") {
        takeWeaponsAway(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "change_wanted_level") {
        changeWantedLevel(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "change_time") {
        changeTime(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "player_armor") {
        changePlayerArmor(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "freeze_movement") {
        freezeMovement(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "drop_vehicle_pool_on_player") {
        dropVehiclePoolOnPlayer(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "drop_pedestrian_pool_on_player") {
        dropPedestrianPoolOnPlayer(username, message, channelName, customRewardIndex);
        return;
      }
      if (rewardsConfig.rewards[customRewardIndex].action == "spin_all_vehicles") {
        spinAllVehicles(username, message, channelName, customRewardIndex);
        return;
      }
    }
  }
}

function invertNumberSign(number) {
  if (number >= 0) {
    number = -Math.abs(number);
    return number;
  }
  if (number < 0) {
    number = Math.abs(number);
    return number;
  }
}

function convertRadiansToDegrees(rad) {
  return (rad * (180 / Math.PI));
}

function convertDegreesToRadians(deg) {
  return (deg * (Math.PI / 180));
}

function turnRadiansAround(rad) {
  if (rad >= 0 && rad <= Math.PI) {
    return rad - Math.PI;
  }
  if (rad <= -0 && rad >= -Math.PI) {
    return rad + Math.PI;
  }
}

setInterval(checkIfAppExists, 0);

function findNewPcsx2BaseAddress() {
  if (gameMemory.use_new_pcsx2_versions == false) {
    return;
  }
  console.log("Looking for the new PCSX2 EE Main Memory Base Address");
  pcsx2BaseAddresses[0] = readFromCustomMemoryAddress(pcsx2BaseAddressPointers[0], 0, "uint64", undefined); // No need to do a for loop because it's only 4 values, it's faster not to use a for loop here
  pcsx2BaseAddresses[1] = readFromCustomMemoryAddress(pcsx2BaseAddressPointers[1], 0, "uint64", undefined);
  pcsx2BaseAddresses[2] = readFromCustomMemoryAddress(pcsx2BaseAddressPointers[2], 0, "uint64", undefined); // Address, offset (in this case offset has to be 0), data type (in this case data type is uint64), and index (normally used when reading directly from app memory, but unused here since we're doing a raw read)
  pcsx2BaseAddresses[3] = readFromCustomMemoryAddress(pcsx2BaseAddressPointers[3], 0, "uint64", undefined); // Address, offset (in this case offset has to be 0), data type (in this case data type is uint64), and index (normally used when reading directly from app memory, but unused here since we're doing a raw read)
  console.log(gameMemory.base_address);
  if (pcsx2BaseAddresses[0] < validAddressWherePcsx2PointersShouldStart) {
    console.log("Invalid address, go to next");
  }
  if (pcsx2BaseAddresses[0] >= validAddressWherePcsx2PointersShouldStart) {
    console.log("Valid address, nice");
    gameMemory.base_address = "0x" + pcsx2BaseAddresses[0].toString("16").toUpperCase().padStart(16, "0");
    gameMemory.end_address = "0x" + (pcsx2BaseAddresses[0] + pcsx2RamSize).toString("16").toUpperCase().padStart(16, "0");
  }
  if (pcsx2BaseAddresses[1] < validAddressWherePcsx2PointersShouldStart) {
    console.log("Invalid address, go to next");
  }
  if (pcsx2BaseAddresses[1] >= validAddressWherePcsx2PointersShouldStart) {
    console.log("Valid address, nice");
    gameMemory.base_address = "0x" + pcsx2BaseAddresses[1].toString("16").toUpperCase().padStart(16, "0");
    gameMemory.end_address = "0x" + (pcsx2BaseAddresses[1] + pcsx2RamSize).toString("16").toUpperCase().padStart(16, "0");
  }
  if (pcsx2BaseAddresses[2] < validAddressWherePcsx2PointersShouldStart) {
    console.log("Invalid address, go to next");
  }
  if (pcsx2BaseAddresses[2] >= validAddressWherePcsx2PointersShouldStart) {
    console.log("Valid address, nice");
    gameMemory.base_address = "0x" + pcsx2BaseAddresses[2].toString("16").toUpperCase().padStart(16, "0");
    gameMemory.end_address = "0x" + (pcsx2BaseAddresses[2] + pcsx2RamSize).toString("16").toUpperCase().padStart(16, "0");
  }
  if (pcsx2BaseAddresses[3] < validAddressWherePcsx2PointersShouldStart) {
    console.log("Invalid address, go to next");
  }
  if (pcsx2BaseAddresses[3] >= validAddressWherePcsx2PointersShouldStart) {
    console.log("Valid address, nice");
    gameMemory.base_address = "0x" + pcsx2BaseAddresses[3].toString("16").toUpperCase().padStart(16, "0");
    gameMemory.end_address = "0x" + (pcsx2BaseAddresses[3] + pcsx2RamSize).toString("16").toUpperCase().padStart(16, "0");
  }
  console.log(pcsx2BaseAddressPointers);
  console.log(pcsx2BaseAddresses);
  console.log("BASE ADDRESS = " + gameMemory.base_address);
  console.log("END ADDRESS = " + gameMemory.end_address);
  console.log("Hopefully found the new PCSX2 EE Main Memory Base Address");
}

function checkIfAppExists() {
  if (processName == "") {
    return;
  }
  processList = memoryjs.getProcesses();
  moduleObject = processList.find(element => element.szExeFile == processName);

  //I spent way too long on the pieces of code below figuring out how to do it in the least hacky way possible
  //because I was tired as fuck and was calling a function that doesn't exist, closeProcess(processObject.handle) instead of memoryjs.closeProcess(processObject.handle)
  //I think it works pretty well
  if (moduleObject == undefined) {
    // Check if the module obtained from the list is undefined
    if (processObject != undefined) {
      // If the processObject was previously open, then we close it
      memoryjs.closeProcess(processObject.handle);
      processObject = undefined;
      gameMemoryToDisplay = [];
      gameMemoryToOverride = [];
      io.sockets.emit("game_memory_to_display", gameMemoryToDisplay);
      console.log("Process closed");
    }
    return;
  }
  if (moduleObject != undefined) {
    // Check if the module obtained from the list isn't undefined
    if (processObject == undefined) {
      // If the processObject was never opened, we open it
      gameMemory = JSON.parse(fs.readFileSync(gameMemoryConfigFileName, "utf8"));
      rewardsConfig = JSON.parse(fs.readFileSync(rewardsConfigFileName, "utf8"));
      overlayFilesList = fs.readdirSync(__dirname + "//" + "overlay");
      overlayMp3FilesOnly = overlayFilesList.filter(file => path.extname(file).toLowerCase() === mp3FileExtension);
      overlayMp3FilesOnly = overlayMp3FilesOnly.filter(file => file.toLowerCase() !== beybladeSfxFileName);
      processObject = memoryjs.openProcess(processName);
      findNewPcsx2BaseAddress();
      for (let gameMemoryObjectIndex = 0; gameMemoryObjectIndex < gameMemory.memory_data.length; gameMemoryObjectIndex++) {
        if (gameMemory.memory_data[gameMemoryObjectIndex].to_override == true) {
          gameMemoryToOverride.push(gameMemory.memory_data[gameMemoryObjectIndex]);
        }
        if (gameMemory.memory_data[gameMemoryObjectIndex].to_display == true) {
          //console.log(gameMemory.memory_data[gameMemoryObjectIndex]);
          gameMemoryToDisplay.push(gameMemory.memory_data[gameMemoryObjectIndex]);
        }
      }
      let mp3FilesListObject = {
        mp3_files_list: overlayMp3FilesOnly,
        beyblade_filename: beybladeSfxFileName
      };
      //console.log(mp3FilesListObject);
      //console.log(gameMemoryToDisplay);
      io.sockets.emit("mp3_files_list_object", mp3FilesListObject);
      io.sockets.emit("game_memory_to_display", gameMemoryToDisplay);
      console.log("Process opened");
    }
    playerPointerGlobal = readFromAppMemory("Player Pointer");
    if (playerPointerGlobal.current_value <= startPointerAddress || playerPointerGlobal.current_value >= endPointerAddress) {
      return;
    }
    if (playerPointerGlobal.current_value != playerPointerGlobal.old_value) {
      if (playerPointerGlobal.current_value >= startPointerAddress && playerPointerGlobal.current_value <= endPointerAddress) {
        console.log(new Date().toISOString() + " Player Pointer now changed to a valid address");
        findNewPcsx2BaseAddress();
        overrideGameSettings();
      }
    }
    //
    //console.log(readFromAppPointer("Vehicle Pointer", "Vehicle Position X").current_value + "," + readFromAppPointer("Vehicle Pointer", "Vehicle Position Y").current_value + "," + readFromAppPointer("Vehicle Pointer", "Vehicle Position Z").current_value)
    //console.log(readFromAppPointer("Vehicle Pointer", "Vehicle Health").current_value + " " + readFromAppPointer("Vehicle Pointer", "Vehicle ID").current_value);
    //let vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
    //let playerPointer = readFromAppMemory("Player Pointer").current_value;
    //let testVar = vehiclePointers.findIndex(element => element == vehiclePointer);
    //console.log(readFromAppPointer("Vehicle Pointer", "Vehicle Position Z").current_value);
    //console.log(readFromAppPointer("Vehicle Pointer", "Vehicle ID").current_value);
    /*
    let vehiclePointerPool = readFromAppBuffer("Vehicle pool", getMemoryDataSize("Vehicle pool")).current_value;
    let vehiclePointerSize = 4;
    let totalVehiclesInPool = getMemoryDataSize("Vehicle pool") / vehiclePointerSize;
    for (let vehicleInPoolIndex = 0; vehicleInPoolIndex < totalVehiclesInPool; vehicleInPoolIndex++) {
      //let vehiclePointerOutput = vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 0];
      let vehiclePointerToRead = vehicleInPoolIndex;
      let vehiclePointerOutput = (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 3] << 24) | (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 2] << 16) | (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 1] << 8) | (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 0]);
      if (vehiclePointerOutput > 0) {
        //console.log("vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerOutput = 0x" + vehiclePointerOutput.toString("16").toUpperCase().padStart(8, "0"));
        let vehicleIdOffset = parseInt(readFromAppMemory("Vehicle ID").offset, 16);
        let gameBaseAddress = parseInt(gameMemory.base_address, 16);
        //let vehicleIdAddress = vehiclePointerOutput + gameBaseAddress + vehicleIdOffset;
        let vehicleId = readFromCustomMemoryAddress(vehiclePointerOutput + gameBaseAddress, vehicleIdOffset, "byte", undefined);
        let vehicleIdToFind = gameMemory.vehicle_data.findIndex(element => element.id == vehicleId);
        //console.log(vehicleId);
        //console.log(vehicleIdToFind);
        
        if (vehiclePointerToRead == 56) {
          console.log(vehiclePointerToRead);
          console.log(vehicleId);
        }
        
        //console.log(vehiclePointerToRead);
        //console.log(vehicleId);
        //vehicleId = vehiclePointerOutput + parseInt(gameMemory.base_address, 16);
        //console.log(vehicleIdAddress.toString("16").toUpperCase().padStart(8, "0"));
        if (vehicleIdToFind >= 1) {
          //console.log("vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerOutput = 0x" + vehiclePointerOutput.toString("16").toUpperCase().padStart(8, "0"));
          console.log(vehiclePointerToRead.toString().padStart(2, "0") + " = " + gameMemory.vehicle_data[vehicleIdToFind].name);
        }
        //console.log(parseInt(readFromAppMemory("Vehicle ID").offset, 16));
      }
    }
    */
    for (let gameMemoryToDisplayIndex = 0; gameMemoryToDisplayIndex < gameMemoryToDisplay.length; gameMemoryToDisplayIndex++) {
      let objectToReadFromMemory = readFromAppMemory(gameMemoryToDisplay[gameMemoryToDisplayIndex].address_name);
      if (objectToReadFromMemory.current_value !== objectToReadFromMemory.old_value) {
        //console.log("Data updated at gameMemoryToDisplayIndex = " + gameMemoryToDisplayIndex);
        //console.log(objectToReadFromMemory);
        if (objectToReadFromMemory.address_name === "Hospital visits" || objectToReadFromMemory.address_name === "Times busted") {
          let memoryValueDelta = objectToReadFromMemory.current_value - objectToReadFromMemory.old_value;
          //console.log("memoryValueDelta = " + memoryValueDelta);
          if (objectToReadFromMemory.old_value >= 0) {
            if (memoryValueDelta === 1) {
              io.sockets.emit("play_sound", "Random");
              //console.log("This is a valid change, all good to go");
              //console.log(objectToReadFromMemory.current_value + " " + objectToReadFromMemory.old_value);
            }
            /*
            if (memoryValueDelta !== 1) {
              console.log("This is NOT a valid change, ignoring");
              console.log(objectToReadFromMemory.current_value + " " + objectToReadFromMemory.old_value);
            }
            */
          }
        }
        io.sockets.emit("game_memory_to_display_to_update", objectToReadFromMemory, gameMemoryToDisplayIndex);
      }
    }
    //console.log(readFromAppPointer("Vehicle Pointer", "Vehicle Health").current_value)
    //console.log(readFromAppPointer("Player Pointer", "Player Health").current_value)
    /*
    if (playerPointer >= startPointerAddress && playerPointer <= endPointerAddress) {
      writeToAppMemory("Brightness", 512);
    }
    */
    //console.log(vehiclePointer);
    //console.log(testVar);
    /*
    if (testVar == -1) {
      if (vehiclePointer >= startPointerAddress && vehiclePointer <= endPointerAddress) {
        vehiclePointers.push(vehiclePointer);
        console.log(vehiclePointers);
        console.log(vehiclePointers.length);
      }
    }
    */
    doTimedAction();
    return;
  }
}

//The functions below were written to make my life easy, they may not look pretty but they do help a lot

function checkIfValueChanged(addressName) {
  let memoryIndex = gameMemory.memory_data.findIndex(element => element.address_name == addressName);
  if (memoryIndex == -1) {
    return "Invalid memory name";
  }
  //gameMemory.memory_data[memoryIndex].current_value = readFromCustomMemoryAddress(parseInt(gameMemory.memory_data[memoryIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), gameMemory.memory_data[memoryIndex].data_type, memoryIndex);
  if (gameMemory.memory_data[memoryIndex].current_value != gameMemory.memory_data[memoryIndex].old_value) {
    //console.log(gameMemory.memory_data[memoryIndex].address_name + " Value changed " + gameMemory.memory_data[memoryIndex].current_value + " Old " + gameMemory.memory_data[memoryIndex].old_value);
  }
  //console.log(gameMemory.memory_data[memoryIndex].address_name + " H " + gameMemory.memory_data[memoryIndex].current_value + " Old " + gameMemory.memory_data[memoryIndex].old_value)
  gameMemory.memory_data[memoryIndex].old_value = gameMemory.memory_data[memoryIndex].current_value;
  return gameMemory.memory_data[memoryIndex];
}

function spinAllVehicles(username, message, channelName, customRewardIndex) {
  // DOES NOT WORK WITH OPTIMIZED TRAFFIC VEHICLES! (OR PARKED VEHICLES)
  let returnMessage = "";
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't spin vehicles, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  let vehiclePointer = 0;
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't spin vehicles, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't spin vehicles, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  let vehiclePointerPool = readFromAppBuffer("Vehicle pool", getMemoryDataSize("Vehicle pool")).current_value;
  let vehiclePointerSize = 4;
  let totalVehiclesInPool = getMemoryDataSize("Vehicle pool") / vehiclePointerSize;

  let playerLocationToDropVehiclesOn = {};
  let vehicleLocationToDropVehiclesOn = {};
  let vehiclesAlreadyUsed = [];

  let vehicleIdData = readFromAppMemory("Vehicle ID");
  let vehicleIdDataType = vehicleIdData.data_type;
  let vehicleIdOffset = parseInt(vehicleIdData.offset, 16);
  let vehicleXPositionData = readFromAppMemory("Vehicle Position X");
  let vehicleYPositionData = readFromAppMemory("Vehicle Position Y");
  let vehicleZPositionData = readFromAppMemory("Vehicle Position Z");
  let vehicleRotationSpeedZData = readFromAppMemory("Vehicle Rotation Speed Z");
  let vehicleOptimizationFlag1Data = readFromAppMemory("Vehicle Optimization Flag 1");
  let vehicleOptimizationFlag2Data = readFromAppMemory("Vehicle Optimization Flag 2");
  let gameBaseAddress = parseInt(gameMemory.base_address, 16);
  let initialZPositionDifference = 3; // Start first vehicle to drop 3 units higher than where the player is, to make sure no vehicles overlap each other, 3 units seems to be the most optmized height possible, Linerunner is the tallest vehicle in game, and with 3 units high, the vehicles will spawn right on top of the Linerunner with pretty much no space between the vehicles
  //console.log(vehicleOptimizationFlag1Data);
  //console.log(vehicleOptimizationFlag2Data);

  // Get coordinates for player
  playerLocationToDropVehiclesOn = {
    playerPositionX: readFromAppPointer("Player Pointer", "Player Position X").current_value,
    playerPositionY: readFromAppPointer("Player Pointer", "Player Position Y").current_value,
    playerPositionZ: readFromAppPointer("Player Pointer", "Player Position Z").current_value,
    playerSpeedX: readFromAppPointer("Player Pointer", "Player Speed X").current_value,
    playerSpeedY: readFromAppPointer("Player Pointer", "Player Speed Y").current_value,
    playerSpeedZ: readFromAppPointer("Player Pointer", "Player Speed Z").current_value,
    playerHeading: readFromAppPointer("Player Pointer", "Player Heading").current_value
  };
  vehicleLocationToDropVehiclesOn = {
    vehiclePositionX: playerLocationToDropVehiclesOn.playerPositionX,
    vehiclePositionY: playerLocationToDropVehiclesOn.playerPositionY,
    vehiclePositionZ: playerLocationToDropVehiclesOn.playerPositionZ,
    vehicleSpeedX: playerLocationToDropVehiclesOn.playerSpeedX,
    vehicleSpeedY: playerLocationToDropVehiclesOn.playerSpeedY,
    vehicleSpeedZ: playerLocationToDropVehiclesOn.playerSpeedZ,
    vehicleRotationNS: 1,
    vehicleRotationEW: 0,
    vehicleRotationTiltLR: 0,
    vehicleRotationEW2: 0,
    vehicleRotationNS2: 1,
    vehicleRotationTiltUD: 0,
    vehicleRotationSpeedX: 0,
    vehicleRotationSpeedY: 0,
    vehicleRotationSpeedZ: 0
  };

  if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
    vehiclePointerToFreeze = vehiclePointer;
    // Get coordinates for vehicle player is driving
    vehicleLocationToDropVehiclesOn = {
      vehiclePositionX: readFromAppPointer("Vehicle Pointer", "Vehicle Position X").current_value,
      vehiclePositionY: readFromAppPointer("Vehicle Pointer", "Vehicle Position Y").current_value,
      vehiclePositionZ: readFromAppPointer("Vehicle Pointer", "Vehicle Position Z").current_value,
      vehicleSpeedX: readFromAppPointer("Vehicle Pointer", "Vehicle Speed X").current_value,
      vehicleSpeedY: readFromAppPointer("Vehicle Pointer", "Vehicle Speed Y").current_value,
      vehicleSpeedZ: readFromAppPointer("Vehicle Pointer", "Vehicle Speed Z").current_value,
      vehicleRotationNS: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS").current_value,
      vehicleRotationEW: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW").current_value,
      vehicleRotationTiltLR: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR").current_value,
      vehicleRotationEW2: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2").current_value,
      vehicleRotationNS2: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2").current_value,
      vehicleRotationTiltUD: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD").current_value,
      vehicleRotationSpeedX: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X").current_value,
      vehicleRotationSpeedY: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y").current_value,
      vehicleRotationSpeedZ: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z").current_value,
    };
    playerLocationToDropVehiclesOn.playerPositionX = vehicleLocationToDropVehiclesOn.vehiclePositionX;
    playerLocationToDropVehiclesOn.playerPositionY = vehicleLocationToDropVehiclesOn.vehiclePositionY;
    playerLocationToDropVehiclesOn.playerPositionZ = vehicleLocationToDropVehiclesOn.vehiclePositionZ;
    playerLocationToDropVehiclesOn.playerSpeedX = vehicleLocationToDropVehiclesOn.vehicleSpeedX;
    playerLocationToDropVehiclesOn.playerSpeedY = vehicleLocationToDropVehiclesOn.vehicleSpeedY;
    playerLocationToDropVehiclesOn.playerSpeedZ = vehicleLocationToDropVehiclesOn.vehicleSpeedZ;
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", 10);
  }
  //console.log(vehicleLocationToDropVehiclesOn.vehiclePositionX + "," + vehicleLocationToDropVehiclesOn.vehiclePositionY + "," + vehicleLocationToDropVehiclesOn.vehiclePositionZ);
  initialZPositionDifference = vehicleLocationToDropVehiclesOn.vehiclePositionZ + 3;
  //console.log(vehicleLocationToDropVehiclesOn.vehiclePositionX + "," + vehicleLocationToDropVehiclesOn.vehiclePositionY + "," + initialZPositionDifference);

  for (let vehicleInPoolIndex = 0; vehicleInPoolIndex < totalVehiclesInPool; vehicleInPoolIndex++) {
    //let vehiclePointerValue = vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 0];
    let vehiclePointerToRead = vehicleInPoolIndex;
    let vehiclePointerValue = (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 3] << 24) | (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 2] << 16) | (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 1] << 8) | (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 0]);
    if (vehiclePointerValue > startPointerAddress && vehiclePointerValue < endPointerAddress) {
      //console.log("vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerValue = 0x" + vehiclePointerValue.toString("16").toUpperCase().padStart(8, "0"));
      //let vehicleIdOffset = parseInt(readFromAppMemory("Vehicle ID").offset, 16);
      //let vehicleXPositionOffset = parseInt(readFromAppMemory("Vehicle X Position").offset, 16);
      //let vehicleYPositionOffset = parseInt(readFromAppMemory("Vehicle Y Position").offset, 16);
      //let vehicleZPositionOffset = parseInt(readFromAppMemory("Vehicle Z Position").offset, 16);
      //let gameBaseAddress = parseInt(gameMemory.base_address, 16);
      //let vehicleIdAddress = vehiclePointerValue + gameBaseAddress + vehicleIdOffset;
      let vehicleId = readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, vehicleIdOffset, vehicleIdDataType, undefined);
      let vehicleIdToFind = gameMemory.vehicle_data.findIndex(element => element.id == vehicleId);
      //console.log(vehicleId);
      //console.log(vehicleIdToFind);
      /*
      if (vehiclePointerToRead == 56) {
        console.log(vehiclePointerToRead);
        console.log(vehicleId);
      }
      */
      //console.log(vehiclePointerToRead);
      //console.log(vehicleId);
      //vehicleId = vehiclePointerValue + parseInt(gameMemory.base_address, 16);
      //console.log(vehicleIdAddress.toString("16").toUpperCase().padStart(8, "0"));
      if (vehicleIdToFind >= 1) {
        /*
        if (vehiclePointerValue == vehiclePointer) {
          console.log("Ignore this vehicle!");
        }
        */
        if (vehiclePointerValue != vehiclePointer) {
          let usedVehicleToFindIndex = vehiclesAlreadyUsed.findIndex(element => element == vehiclePointerValue);
          /*
          if (usedVehicleToFindIndex >= 0) {
            console.log("[USED VEHICLE] usedVehicleToFindIndex = " + usedVehicleToFindIndex + ",vehiclesAlreadyUsed[usedVehicleToFindIndex] = 0x" + vehiclesAlreadyUsed[usedVehicleToFindIndex].toString("16").toUpperCase().padStart(8, "0"));
            console.log("[USED VEHICLE] vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerValue = 0x" + vehiclePointerValue.toString("16").toUpperCase().padStart(8, "0") +  " , gameMemory.vehicle_data[vehicleIdToFind].name = " + gameMemory.vehicle_data[vehicleIdToFind].name);
          }
          */
          if (usedVehicleToFindIndex <= -1) {
            //console.log("usedVehicleToFindIndex = " + usedVehicleToFindIndex);
            vehiclesAlreadyUsed.push(vehiclePointerValue);
            //console.log(vehiclesAlreadyUsed);
            //console.log("Don't ignore this vehicle!");
            //console.log(vehicleXPositionData);
            //console.log(vehicleYPositionData);
            //console.log(vehicleZPositionData);
            //let vehicleXPosition = readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleXPositionData.offset, 16), vehicleXPositionData.data_type, undefined);
            //let vehicleYPosition = readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleYPositionData.offset, 16), vehicleYPositionData.data_type, undefined);
            //let vehicleZPosition = readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleZPositionData.offset, 16), vehicleZPositionData.data_type, undefined);
            //console.log("BEFORE " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag1Data.offset, 16), vehicleOptimizationFlag1Data.data_type, undefined));
            //console.log("BEFORE " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag2Data.offset, 16), vehicleOptimizationFlag2Data.data_type, undefined));
            //console.log(vehicleXPosition + "," + vehicleYPosition + "," + vehicleZPosition);
            //console.log(vehicleLocationToDropVehiclesOn.vehiclePositionX + "," + vehicleLocationToDropVehiclesOn.vehiclePositionY + "," + initialZPositionDifference);
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag1Data.offset, 16), 0x34, vehicleOptimizationFlag1Data.data_type, undefined); // Set to 0x24 (36) to make vehicle work like optimized vehicle, set to 0x34 (52) to make vehicle work like normal vehicle
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag2Data.offset, 16), 0, vehicleOptimizationFlag2Data.data_type, undefined); // Set to 0x00 (0) to make vehicle work like normal, set to 0x0A (10) to make it work like optimized vehicle
  
            //writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleXPositionData.offset, 16), vehicleLocationToDropVehiclesOn.vehiclePositionX, vehicleXPositionData.data_type, undefined);
            //writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleYPositionData.offset, 16), vehicleLocationToDropVehiclesOn.vehiclePositionY, vehicleYPositionData.data_type, undefined);
            //writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleZPositionData.offset, 16), initialZPositionDifference, vehicleZPositionData.data_type, undefined);
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleRotationSpeedZData.offset, 16), 10, vehicleRotationSpeedZData.data_type, undefined);
  
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag1Data.offset, 16), 0x34, vehicleOptimizationFlag1Data.data_type, undefined); // Set to 0x24 (36) to make vehicle work like optimized vehicle, set to 0x34 (52) to make vehicle work like normal vehicle
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag2Data.offset, 16), 0, vehicleOptimizationFlag2Data.data_type, undefined); // Set to 0x00 (0) to make vehicle work like normal, set to 0x0A (10) to make it work like optimized vehicle

            //writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleRotationSpeedZ.offset, 16), initialZPositionDifference, vehicleZPositionData.data_type, undefined);
  
            //console.log("AFTER  " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag1Data.offset, 16), vehicleOptimizationFlag1Data.data_type, undefined));
            //console.log("AFTER  " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag2Data.offset, 16), vehicleOptimizationFlag2Data.data_type, undefined));
            //initialZPositionDifference = initialZPositionDifference + 3;
            //console.log("vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerValue = 0x" + vehiclePointerValue.toString("16").toUpperCase().padStart(8, "0") +  " , gameMemory.vehicle_data[vehicleIdToFind].name = " + gameMemory.vehicle_data[vehicleIdToFind].name);
          }
        }
        //console.log("vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerValue = 0x" + vehiclePointerValue.toString("16").toUpperCase().padStart(8, "0") +  " , gameMemory.vehicle_data[vehicleIdToFind].name = " + gameMemory.vehicle_data[vehicleIdToFind].name);
        //console.log(vehiclePointerToRead.toString().padStart(2, "0") + " = " + gameMemory.vehicle_data[vehicleIdToFind].name);
      }
      //console.log(parseInt(readFromAppMemory("Vehicle ID").offset, 16));
    }
  }
  returnMessage = "LET IT RIP! (EXTREME!)";
  writeToNotificationBox(returnMessage);
  client.action(channelName, "@" + username + " " + returnMessage);
  io.sockets.emit("play_sound", "Beyblade");
  return returnMessage;
}

function dropPedestrianPoolOnPlayer(username, message, channelName, customRewardIndex) {
  // THIS IS BROKEN AND I DON'T KNOW WHY, I THINK WHAT I THOUGHT WAS THE PLAYER POOL ISN'T ACTUALLY THE PLAYER POOL, HAVE TO FIND THE REAL PLAYER POOL (?????????????????????????????)
  let returnMessage = "";
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't throw pedestrians on player, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  let vehiclePointer = 0;
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't throw pedestrians on player, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't throw pedestrians on player, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  let pedestrianPointerPool = readFromAppBuffer("Pedestrian Pool", getMemoryDataSize("Pedestrian Pool")).current_value;
  let pedestrianPointerSize = 4;
  let totalPedestriansInPool = getMemoryDataSize("Pedestrian Pool") / pedestrianPointerSize;

  let playerLocationToDropPedestriansOn = {};
  let vehicleLocationToDropPedestriansOn = {};
  let pedestriansAlreadyUsed = [];

  let pedestrianXPositionData = readFromAppMemory("Player Position X");
  let pedestrianYPositionData = readFromAppMemory("Player Position Y");
  let pedestrianZPositionData = readFromAppMemory("Player Position Z");
  let gameBaseAddress = parseInt(gameMemory.base_address, 16);
  let initialZPositionDifference = 3; // Start first vehicle to drop 3 units higher than where the player is, to make sure no vehicles overlap each other, 3 units seems to be the most optmized height possible, Linerunner is the tallest vehicle in game, and with 3 units high, the vehicles will spawn right on top of the Linerunner with pretty much no space between the vehicles
  //console.log(vehicleOptimizationFlag1Data);
  //console.log(vehicleOptimizationFlag2Data);

  // Get coordinates for player
  playerLocationToDropPedestriansOn = {
    playerPositionX: readFromAppPointer("Player Pointer", "Player Position X").current_value,
    playerPositionY: readFromAppPointer("Player Pointer", "Player Position Y").current_value,
    playerPositionZ: readFromAppPointer("Player Pointer", "Player Position Z").current_value,
    playerSpeedX: readFromAppPointer("Player Pointer", "Player Speed X").current_value,
    playerSpeedY: readFromAppPointer("Player Pointer", "Player Speed Y").current_value,
    playerSpeedZ: readFromAppPointer("Player Pointer", "Player Speed Z").current_value,
    playerHeading: readFromAppPointer("Player Pointer", "Player Heading").current_value
  };
  vehicleLocationToDropPedestriansOn = {
    vehiclePositionX: playerLocationToDropPedestriansOn.playerPositionX,
    vehiclePositionY: playerLocationToDropPedestriansOn.playerPositionY,
    vehiclePositionZ: playerLocationToDropPedestriansOn.playerPositionZ,
    vehicleSpeedX: playerLocationToDropPedestriansOn.playerSpeedX,
    vehicleSpeedY: playerLocationToDropPedestriansOn.playerSpeedY,
    vehicleSpeedZ: playerLocationToDropPedestriansOn.playerSpeedZ,
    vehicleRotationNS: 1,
    vehicleRotationEW: 0,
    vehicleRotationTiltLR: 0,
    vehicleRotationEW2: 0,
    vehicleRotationNS2: 1,
    vehicleRotationTiltUD: 0,
    vehicleRotationSpeedX: 0,
    vehicleRotationSpeedY: 0,
    vehicleRotationSpeedZ: 0
  };

  if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
    vehiclePointerToFreeze = vehiclePointer;
    // Get coordinates for vehicle player is driving
    vehicleLocationToDropPedestriansOn = {
      vehiclePositionX: readFromAppPointer("Vehicle Pointer", "Vehicle Position X").current_value,
      vehiclePositionY: readFromAppPointer("Vehicle Pointer", "Vehicle Position Y").current_value,
      vehiclePositionZ: readFromAppPointer("Vehicle Pointer", "Vehicle Position Z").current_value,
      vehicleSpeedX: readFromAppPointer("Vehicle Pointer", "Vehicle Speed X").current_value,
      vehicleSpeedY: readFromAppPointer("Vehicle Pointer", "Vehicle Speed Y").current_value,
      vehicleSpeedZ: readFromAppPointer("Vehicle Pointer", "Vehicle Speed Z").current_value,
      vehicleRotationNS: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS").current_value,
      vehicleRotationEW: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW").current_value,
      vehicleRotationTiltLR: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR").current_value,
      vehicleRotationEW2: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2").current_value,
      vehicleRotationNS2: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2").current_value,
      vehicleRotationTiltUD: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD").current_value,
      vehicleRotationSpeedX: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X").current_value,
      vehicleRotationSpeedY: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y").current_value,
      vehicleRotationSpeedZ: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z").current_value,
    };
    playerLocationToDropPedestriansOn.playerPositionX = vehicleLocationToDropPedestriansOn.vehiclePositionX;
    playerLocationToDropPedestriansOn.playerPositionY = vehicleLocationToDropPedestriansOn.vehiclePositionY;
    playerLocationToDropPedestriansOn.playerPositionZ = vehicleLocationToDropPedestriansOn.vehiclePositionZ;
    playerLocationToDropPedestriansOn.playerSpeedX = vehicleLocationToDropPedestriansOn.vehicleSpeedX;
    playerLocationToDropPedestriansOn.playerSpeedY = vehicleLocationToDropPedestriansOn.vehicleSpeedY;
    playerLocationToDropPedestriansOn.playerSpeedZ = vehicleLocationToDropPedestriansOn.vehicleSpeedZ;
  }
  //console.log(vehicleLocationToDropVehiclesOn.vehiclePositionX + "," + vehicleLocationToDropVehiclesOn.vehiclePositionY + "," + vehicleLocationToDropVehiclesOn.vehiclePositionZ);
  initialZPositionDifference = vehicleLocationToDropPedestriansOn.vehiclePositionZ + 3;
  //console.log(vehicleLocationToDropVehiclesOn.vehiclePositionX + "," + vehicleLocationToDropVehiclesOn.vehiclePositionY + "," + initialZPositionDifference);

  for (let pedestrianInPoolIndex = 0; pedestrianInPoolIndex < totalPedestriansInPool; pedestrianInPoolIndex++) {
    //let vehiclePointerValue = vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 0];
    let pedestrianPointerToRead = pedestrianInPoolIndex;
    let pedestrianPointerValue = (pedestrianPointerPool[(pedestrianPointerToRead * pedestrianPointerSize) + 3] << 24) | (pedestrianPointerPool[(pedestrianPointerToRead * pedestrianPointerSize) + 2] << 16) | (pedestrianPointerPool[(pedestrianPointerToRead * pedestrianPointerSize) + 1] << 8) | (pedestrianPointerPool[(pedestrianPointerToRead * pedestrianPointerSize) + 0]);
    if (pedestrianPointerValue > startPointerAddress && pedestrianPointerValue < endPointerAddress) {
      //console.log("pedestrianPointerToRead = " + pedestrianPointerToRead.toString().padStart(2, "0") + " , pedestrianPointerValue = 0x" + pedestrianPointerValue.toString("16").toUpperCase().padStart(8, "0"));
      //let vehicleIdOffset = parseInt(readFromAppMemory("Vehicle ID").offset, 16);
      //let vehicleXPositionOffset = parseInt(readFromAppMemory("Vehicle X Position").offset, 16);
      //let vehicleYPositionOffset = parseInt(readFromAppMemory("Vehicle Y Position").offset, 16);
      //let vehicleZPositionOffset = parseInt(readFromAppMemory("Vehicle Z Position").offset, 16);
      //let gameBaseAddress = parseInt(gameMemory.base_address, 16);
      //let vehicleIdAddress = vehiclePointerValue + gameBaseAddress + vehicleIdOffset;
      //console.log(vehicleId);
      //console.log(vehicleIdToFind);
      /*
      if (vehiclePointerToRead == 56) {
        console.log(vehiclePointerToRead);
        console.log(vehicleId);
      }
      */
      //console.log(vehiclePointerToRead);
      //console.log(vehicleId);
      //vehicleId = vehiclePointerValue + parseInt(gameMemory.base_address, 16);
      //console.log(vehicleIdAddress.toString("16").toUpperCase().padStart(8, "0"));
      /*
      if (vehiclePointerValue == vehiclePointer) {
        console.log("Ignore this vehicle!");
      }
      */
      if (pedestrianPointerValue != playerPointer) {
        let usedPedestrianToFindIndex = pedestriansAlreadyUsed.findIndex(element => element == pedestrianPointerValue);
        /*
        if (usedVehicleToFindIndex >= 0) {
          console.log("[USED VEHICLE] usedVehicleToFindIndex = " + usedVehicleToFindIndex + ",vehiclesAlreadyUsed[usedVehicleToFindIndex] = 0x" + vehiclesAlreadyUsed[usedVehicleToFindIndex].toString("16").toUpperCase().padStart(8, "0"));
          console.log("[USED VEHICLE] vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerValue = 0x" + vehiclePointerValue.toString("16").toUpperCase().padStart(8, "0") +  " , gameMemory.vehicle_data[vehicleIdToFind].name = " + gameMemory.vehicle_data[vehicleIdToFind].name);
        }
        */
        if (usedPedestrianToFindIndex <= -1) {
          //console.log("usedVehicleToFindIndex = " + usedVehicleToFindIndex);
          pedestriansAlreadyUsed.push(usedPedestrianToFindIndex);
          //console.log(vehiclesAlreadyUsed);
          //console.log("Don't ignore this vehicle!");
          //console.log(vehicleXPositionData);
          //console.log(vehicleYPositionData);
          //console.log(vehicleZPositionData);
          //let vehicleXPosition = readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleXPositionData.offset, 16), vehicleXPositionData.data_type, undefined);
          //let vehicleYPosition = readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleYPositionData.offset, 16), vehicleYPositionData.data_type, undefined);
          //let vehicleZPosition = readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleZPositionData.offset, 16), vehicleZPositionData.data_type, undefined);
          //console.log("BEFORE " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag1Data.offset, 16), vehicleOptimizationFlag1Data.data_type, undefined));
          //console.log("BEFORE " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag2Data.offset, 16), vehicleOptimizationFlag2Data.data_type, undefined));
          //console.log(vehicleXPosition + "," + vehicleYPosition + "," + vehicleZPosition);
          //console.log(vehicleLocationToDropVehiclesOn.vehiclePositionX + "," + vehicleLocationToDropVehiclesOn.vehiclePositionY + "," + initialZPositionDifference);
          //console.log((pedestrianPointerValue + gameBaseAddress).toString("16").toUpperCase().padStart(8, "0"));
          writeToCustomMemoryAddress(pedestrianPointerValue + gameBaseAddress, parseInt(pedestrianXPositionData.offset, 16), vehicleLocationToDropPedestriansOn.vehiclePositionX, pedestrianXPositionData.data_type, undefined);
          writeToCustomMemoryAddress(pedestrianPointerValue + gameBaseAddress, parseInt(pedestrianYPositionData.offset, 16), vehicleLocationToDropPedestriansOn.vehiclePositionY, pedestrianYPositionData.data_type, undefined);
          writeToCustomMemoryAddress(pedestrianPointerValue + gameBaseAddress, parseInt(pedestrianZPositionData.offset, 16), initialZPositionDifference, pedestrianZPositionData.data_type, undefined);
          //console.log("AFTER  " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag1Data.offset, 16), vehicleOptimizationFlag1Data.data_type, undefined));
          //console.log("AFTER  " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag2Data.offset, 16), vehicleOptimizationFlag2Data.data_type, undefined));
          //writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleRotationSpeedZData.offset, 16), 10, vehicleRotationSpeedZData.data_type, undefined);
          initialZPositionDifference = initialZPositionDifference + 3;
          //console.log("vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerValue = 0x" + vehiclePointerValue.toString("16").toUpperCase().padStart(8, "0") +  " , gameMemory.vehicle_data[vehicleIdToFind].name = " + gameMemory.vehicle_data[vehicleIdToFind].name);
        }
      }
      //console.log("vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerValue = 0x" + vehiclePointerValue.toString("16").toUpperCase().padStart(8, "0") +  " , gameMemory.vehicle_data[vehicleIdToFind].name = " + gameMemory.vehicle_data[vehicleIdToFind].name);
      //console.log(vehiclePointerToRead.toString().padStart(2, "0") + " = " + gameMemory.vehicle_data[vehicleIdToFind].name);
      //console.log(parseInt(readFromAppMemory("Vehicle ID").offset, 16));
    }
  }
  returnMessage = "Successfully threw all pedestrians on player!";
  writeToNotificationBox(returnMessage);
  client.action(channelName, "@" + username + " " + returnMessage);
  return returnMessage;
}

function dropVehiclePoolOnPlayer(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't throw vehicles on player, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  let vehiclePointer = 0;
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't throw vehicles on player, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't throw vehicles on player, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  let vehiclePointerPool = readFromAppBuffer("Vehicle pool", getMemoryDataSize("Vehicle pool")).current_value;
  let vehiclePointerSize = 4;
  let totalVehiclesInPool = getMemoryDataSize("Vehicle pool") / vehiclePointerSize;

  let playerLocationToDropVehiclesOn = {};
  let vehicleLocationToDropVehiclesOn = {};
  let vehiclesAlreadyUsed = [];

  let vehicleIdData = readFromAppMemory("Vehicle ID");
  let vehicleIdDataType = vehicleIdData.data_type;
  let vehicleIdOffset = parseInt(vehicleIdData.offset, 16);
  let vehicleXPositionData = readFromAppMemory("Vehicle Position X");
  let vehicleYPositionData = readFromAppMemory("Vehicle Position Y");
  let vehicleZPositionData = readFromAppMemory("Vehicle Position Z");
  let vehicleRotationSpeedZData = readFromAppMemory("Vehicle Rotation Speed Z");
  let vehicleOptimizationFlag1Data = readFromAppMemory("Vehicle Optimization Flag 1");
  let vehicleOptimizationFlag2Data = readFromAppMemory("Vehicle Optimization Flag 2");
  let gameBaseAddress = parseInt(gameMemory.base_address, 16);
  let initialZPositionDifference = 3; // Start first vehicle to drop 3 units higher than where the player is, to make sure no vehicles overlap each other, 3 units seems to be the most optmized height possible, Linerunner is the tallest vehicle in game, and with 3 units high, the vehicles will spawn right on top of the Linerunner with pretty much no space between the vehicles
  //console.log(vehicleOptimizationFlag1Data);
  //console.log(vehicleOptimizationFlag2Data);

  // Get coordinates for player
  playerLocationToDropVehiclesOn = {
    playerPositionX: readFromAppPointer("Player Pointer", "Player Position X").current_value,
    playerPositionY: readFromAppPointer("Player Pointer", "Player Position Y").current_value,
    playerPositionZ: readFromAppPointer("Player Pointer", "Player Position Z").current_value,
    playerSpeedX: readFromAppPointer("Player Pointer", "Player Speed X").current_value,
    playerSpeedY: readFromAppPointer("Player Pointer", "Player Speed Y").current_value,
    playerSpeedZ: readFromAppPointer("Player Pointer", "Player Speed Z").current_value,
    playerHeading: readFromAppPointer("Player Pointer", "Player Heading").current_value
  };
  vehicleLocationToDropVehiclesOn = {
    vehiclePositionX: playerLocationToDropVehiclesOn.playerPositionX,
    vehiclePositionY: playerLocationToDropVehiclesOn.playerPositionY,
    vehiclePositionZ: playerLocationToDropVehiclesOn.playerPositionZ,
    vehicleSpeedX: playerLocationToDropVehiclesOn.playerSpeedX,
    vehicleSpeedY: playerLocationToDropVehiclesOn.playerSpeedY,
    vehicleSpeedZ: playerLocationToDropVehiclesOn.playerSpeedZ,
    vehicleRotationNS: 1,
    vehicleRotationEW: 0,
    vehicleRotationTiltLR: 0,
    vehicleRotationEW2: 0,
    vehicleRotationNS2: 1,
    vehicleRotationTiltUD: 0,
    vehicleRotationSpeedX: 0,
    vehicleRotationSpeedY: 0,
    vehicleRotationSpeedZ: 0
  };

  if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
    vehiclePointerToFreeze = vehiclePointer;
    // Get coordinates for vehicle player is driving
    vehicleLocationToDropVehiclesOn = {
      vehiclePositionX: readFromAppPointer("Vehicle Pointer", "Vehicle Position X").current_value,
      vehiclePositionY: readFromAppPointer("Vehicle Pointer", "Vehicle Position Y").current_value,
      vehiclePositionZ: readFromAppPointer("Vehicle Pointer", "Vehicle Position Z").current_value,
      vehicleSpeedX: readFromAppPointer("Vehicle Pointer", "Vehicle Speed X").current_value,
      vehicleSpeedY: readFromAppPointer("Vehicle Pointer", "Vehicle Speed Y").current_value,
      vehicleSpeedZ: readFromAppPointer("Vehicle Pointer", "Vehicle Speed Z").current_value,
      vehicleRotationNS: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS").current_value,
      vehicleRotationEW: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW").current_value,
      vehicleRotationTiltLR: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR").current_value,
      vehicleRotationEW2: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2").current_value,
      vehicleRotationNS2: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2").current_value,
      vehicleRotationTiltUD: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD").current_value,
      vehicleRotationSpeedX: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X").current_value,
      vehicleRotationSpeedY: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y").current_value,
      vehicleRotationSpeedZ: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z").current_value,
    };
    playerLocationToDropVehiclesOn.playerPositionX = vehicleLocationToDropVehiclesOn.vehiclePositionX;
    playerLocationToDropVehiclesOn.playerPositionY = vehicleLocationToDropVehiclesOn.vehiclePositionY;
    playerLocationToDropVehiclesOn.playerPositionZ = vehicleLocationToDropVehiclesOn.vehiclePositionZ;
    playerLocationToDropVehiclesOn.playerSpeedX = vehicleLocationToDropVehiclesOn.vehicleSpeedX;
    playerLocationToDropVehiclesOn.playerSpeedY = vehicleLocationToDropVehiclesOn.vehicleSpeedY;
    playerLocationToDropVehiclesOn.playerSpeedZ = vehicleLocationToDropVehiclesOn.vehicleSpeedZ;
  }
  //console.log(vehicleLocationToDropVehiclesOn.vehiclePositionX + "," + vehicleLocationToDropVehiclesOn.vehiclePositionY + "," + vehicleLocationToDropVehiclesOn.vehiclePositionZ);
  initialZPositionDifference = vehicleLocationToDropVehiclesOn.vehiclePositionZ + 3;
  //console.log(vehicleLocationToDropVehiclesOn.vehiclePositionX + "," + vehicleLocationToDropVehiclesOn.vehiclePositionY + "," + initialZPositionDifference);

  for (let vehicleInPoolIndex = 0; vehicleInPoolIndex < totalVehiclesInPool; vehicleInPoolIndex++) {
    //let vehiclePointerValue = vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 0];
    let vehiclePointerToRead = vehicleInPoolIndex;
    let vehiclePointerValue = (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 3] << 24) | (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 2] << 16) | (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 1] << 8) | (vehiclePointerPool[(vehiclePointerToRead * vehiclePointerSize) + 0]);
    if (vehiclePointerValue > startPointerAddress && vehiclePointerValue < endPointerAddress) {
      //console.log("vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerValue = 0x" + vehiclePointerValue.toString("16").toUpperCase().padStart(8, "0"));
      //let vehicleIdOffset = parseInt(readFromAppMemory("Vehicle ID").offset, 16);
      //let vehicleXPositionOffset = parseInt(readFromAppMemory("Vehicle X Position").offset, 16);
      //let vehicleYPositionOffset = parseInt(readFromAppMemory("Vehicle Y Position").offset, 16);
      //let vehicleZPositionOffset = parseInt(readFromAppMemory("Vehicle Z Position").offset, 16);
      //let gameBaseAddress = parseInt(gameMemory.base_address, 16);
      //let vehicleIdAddress = vehiclePointerValue + gameBaseAddress + vehicleIdOffset;
      let vehicleId = readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, vehicleIdOffset, vehicleIdDataType, undefined);
      let vehicleIdToFind = gameMemory.vehicle_data.findIndex(element => element.id == vehicleId);
      //console.log(vehicleId);
      //console.log(vehicleIdToFind);
      /*
      if (vehiclePointerToRead == 56) {
        console.log(vehiclePointerToRead);
        console.log(vehicleId);
      }
      */
      //console.log(vehiclePointerToRead);
      //console.log(vehicleId);
      //vehicleId = vehiclePointerValue + parseInt(gameMemory.base_address, 16);
      //console.log(vehicleIdAddress.toString("16").toUpperCase().padStart(8, "0"));
      if (vehicleIdToFind >= 1) {
        /*
        if (vehiclePointerValue == vehiclePointer) {
          console.log("Ignore this vehicle!");
        }
        */
        if (vehiclePointerValue != vehiclePointer) {
          let usedVehicleToFindIndex = vehiclesAlreadyUsed.findIndex(element => element == vehiclePointerValue);
          /*
          if (usedVehicleToFindIndex >= 0) {
            console.log("[USED VEHICLE] usedVehicleToFindIndex = " + usedVehicleToFindIndex + ",vehiclesAlreadyUsed[usedVehicleToFindIndex] = 0x" + vehiclesAlreadyUsed[usedVehicleToFindIndex].toString("16").toUpperCase().padStart(8, "0"));
            console.log("[USED VEHICLE] vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerValue = 0x" + vehiclePointerValue.toString("16").toUpperCase().padStart(8, "0") +  " , gameMemory.vehicle_data[vehicleIdToFind].name = " + gameMemory.vehicle_data[vehicleIdToFind].name);
          }
          */
          if (usedVehicleToFindIndex <= -1) {
            //console.log("usedVehicleToFindIndex = " + usedVehicleToFindIndex);
            vehiclesAlreadyUsed.push(vehiclePointerValue);
            //console.log(vehiclesAlreadyUsed);
            //console.log("Don't ignore this vehicle!");
            //console.log(vehicleXPositionData);
            //console.log(vehicleYPositionData);
            //console.log(vehicleZPositionData);
            //let vehicleXPosition = readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleXPositionData.offset, 16), vehicleXPositionData.data_type, undefined);
            //let vehicleYPosition = readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleYPositionData.offset, 16), vehicleYPositionData.data_type, undefined);
            //let vehicleZPosition = readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleZPositionData.offset, 16), vehicleZPositionData.data_type, undefined);
            //console.log("BEFORE " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag1Data.offset, 16), vehicleOptimizationFlag1Data.data_type, undefined));
            //console.log("BEFORE " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag2Data.offset, 16), vehicleOptimizationFlag2Data.data_type, undefined));
            //console.log(vehicleXPosition + "," + vehicleYPosition + "," + vehicleZPosition);
            //console.log(vehicleLocationToDropVehiclesOn.vehiclePositionX + "," + vehicleLocationToDropVehiclesOn.vehiclePositionY + "," + initialZPositionDifference);
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag1Data.offset, 16), 0x34, vehicleOptimizationFlag1Data.data_type, undefined); // Set to 0x24 (36) to make vehicle work like optimized vehicle, set to 0x34 (52) to make vehicle work like normal vehicle
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag2Data.offset, 16), 0, vehicleOptimizationFlag2Data.data_type, undefined); // Set to 0x00 (0) to make vehicle work like normal, set to 0x0A (10) to make it work like optimized vehicle
  
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleXPositionData.offset, 16), vehicleLocationToDropVehiclesOn.vehiclePositionX, vehicleXPositionData.data_type, undefined);
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleYPositionData.offset, 16), vehicleLocationToDropVehiclesOn.vehiclePositionY, vehicleYPositionData.data_type, undefined);
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleZPositionData.offset, 16), initialZPositionDifference, vehicleZPositionData.data_type, undefined);
  
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag1Data.offset, 16), 0x34, vehicleOptimizationFlag1Data.data_type, undefined); // Set to 0x24 (36) to make vehicle work like optimized vehicle, set to 0x34 (52) to make vehicle work like normal vehicle
            writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag2Data.offset, 16), 0, vehicleOptimizationFlag2Data.data_type, undefined); // Set to 0x00 (0) to make vehicle work like normal, set to 0x0A (10) to make it work like optimized vehicle
  
            //console.log("AFTER  " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag1Data.offset, 16), vehicleOptimizationFlag1Data.data_type, undefined));
            //console.log("AFTER  " + readFromCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleOptimizationFlag2Data.offset, 16), vehicleOptimizationFlag2Data.data_type, undefined));
            //writeToCustomMemoryAddress(vehiclePointerValue + gameBaseAddress, parseInt(vehicleRotationSpeedZData.offset, 16), 10, vehicleRotationSpeedZData.data_type, undefined);
            initialZPositionDifference = initialZPositionDifference + 3;
            //console.log("vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerValue = 0x" + vehiclePointerValue.toString("16").toUpperCase().padStart(8, "0") +  " , gameMemory.vehicle_data[vehicleIdToFind].name = " + gameMemory.vehicle_data[vehicleIdToFind].name);
          }
        }
        //console.log("vehiclePointerToRead = " + vehiclePointerToRead.toString().padStart(2, "0") + " , vehiclePointerValue = 0x" + vehiclePointerValue.toString("16").toUpperCase().padStart(8, "0") +  " , gameMemory.vehicle_data[vehicleIdToFind].name = " + gameMemory.vehicle_data[vehicleIdToFind].name);
        //console.log(vehiclePointerToRead.toString().padStart(2, "0") + " = " + gameMemory.vehicle_data[vehicleIdToFind].name);
      }
      //console.log(parseInt(readFromAppMemory("Vehicle ID").offset, 16));
    }
  }
  returnMessage = "Successfully threw all vehicles on player!";
  writeToNotificationBox(returnMessage);
  client.action(channelName, "@" + username + " " + returnMessage);
  return returnMessage;
}

function freezeMovement(username, message, channelName, customRewardIndex) {
  //
  let returnMessage = "";
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't freeze movement, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  let vehiclePointer = 0;
  playerPointerToFreeze = 0;
  vehiclePointerToFreeze = 0;
  gameTimeHoursObject = {};
  gameTimeHoursToUnfreeze = 0;
  gameTimeMinutesObject = {};
  gameTimeMinutesToUnfreeze = 0;
  freezeDuration = 30; // 10 minutes in game = 10 seconds irl
  let msgWords = message.split(/\s+/ig);
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't freeze movement, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't freeze movement, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(parseInt(msgWords[0], 10)) == true) {
    freezeDuration = 5;
  }
  if (isNaN(parseInt(msgWords[0], 10)) == false) {
    if ((parseInt(msgWords[0], 10)) < 5) {
      freezeDuration = 5;
    }
    if ((parseInt(msgWords[0], 10)) > 30) {
      freezeDuration = 30;
    }
    if ((parseInt(msgWords[0], 10)) >= 5 && (parseInt(msgWords[0], 10)) <= 30) {
      freezeDuration = parseInt(msgWords[0], 10);
    }
  }
  // Freeze player
  playerPointerToFreeze = playerPointer;
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  playerLocationToFreezeObject = {
    playerPositionX: readFromAppPointer("Player Pointer", "Player Position X").current_value,
    playerPositionY: readFromAppPointer("Player Pointer", "Player Position Y").current_value,
    playerPositionZ: readFromAppPointer("Player Pointer", "Player Position Z").current_value,
    playerSpeedX: readFromAppPointer("Player Pointer", "Player Speed X").current_value,
    playerSpeedY: readFromAppPointer("Player Pointer", "Player Speed Y").current_value,
    playerSpeedZ: readFromAppPointer("Player Pointer", "Player Speed Z").current_value,
    playerHeading: readFromAppPointer("Player Pointer", "Player Heading").current_value
  };
  vehicleLocationToFreezeObject = {
    vehiclePositionX: playerLocationToFreezeObject.playerPositionX,
    vehiclePositionY: playerLocationToFreezeObject.playerPositionY,
    vehiclePositionZ: playerLocationToFreezeObject.playerPositionZ,
    vehicleSpeedX: playerLocationToFreezeObject.playerSpeedX,
    vehicleSpeedY: playerLocationToFreezeObject.playerSpeedY,
    vehicleSpeedZ: playerLocationToFreezeObject.playerSpeedZ,
    vehicleRotationNS: 1,
    vehicleRotationEW: 0,
    vehicleRotationTiltLR: 0,
    vehicleRotationEW2: 0,
    vehicleRotationNS2: 1,
    vehicleRotationTiltUD: 0,
    vehicleRotationSpeedX: 0,
    vehicleRotationSpeedY: 0,
    vehicleRotationSpeedZ: 0
  };
  if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
    vehiclePointerToFreeze = vehiclePointer;
    // Freeze vehicle AND player
    vehicleLocationToFreezeObject = {
      vehiclePositionX: readFromAppPointer("Vehicle Pointer", "Vehicle Position X").current_value,
      vehiclePositionY: readFromAppPointer("Vehicle Pointer", "Vehicle Position Y").current_value,
      vehiclePositionZ: readFromAppPointer("Vehicle Pointer", "Vehicle Position Z").current_value,
      vehicleSpeedX: readFromAppPointer("Vehicle Pointer", "Vehicle Speed X").current_value,
      vehicleSpeedY: readFromAppPointer("Vehicle Pointer", "Vehicle Speed Y").current_value,
      vehicleSpeedZ: readFromAppPointer("Vehicle Pointer", "Vehicle Speed Z").current_value,
      vehicleRotationNS: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS").current_value,
      vehicleRotationEW: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW").current_value,
      vehicleRotationTiltLR: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR").current_value,
      vehicleRotationEW2: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2").current_value,
      vehicleRotationNS2: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2").current_value,
      vehicleRotationTiltUD: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD").current_value,
      vehicleRotationSpeedX: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X").current_value,
      vehicleRotationSpeedY: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y").current_value,
      vehicleRotationSpeedZ: readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z").current_value,
    };
    playerLocationToFreezeObject.playerPositionX = vehicleLocationToFreezeObject.vehiclePositionX;
    playerLocationToFreezeObject.playerPositionY = vehicleLocationToFreezeObject.vehiclePositionY;
    playerLocationToFreezeObject.playerPositionZ = vehicleLocationToFreezeObject.vehiclePositionZ;
    playerLocationToFreezeObject.playerSpeedX = vehicleLocationToFreezeObject.vehicleSpeedX;
    playerLocationToFreezeObject.playerSpeedY = vehicleLocationToFreezeObject.vehicleSpeedY;
    playerLocationToFreezeObject.playerSpeedZ = vehicleLocationToFreezeObject.vehicleSpeedZ;
  }
  console.log("playerLocationToFreezeObject");
  console.log(playerLocationToFreezeObject);
  console.log("vehicleLocationToFreezeObject");
  console.log(vehicleLocationToFreezeObject);
  gameTimeMinutesObject = readFromAppMemory("Minutes");
  gameTimeHoursObject = readFromAppMemory("Hours");
  if (gameTimeMinutesObject.current_value <= 59 - freezeDuration) {
    console.log("CASE A");
    /*
    if (gameTimeHoursObject.current_value >= 23) {
      gameTimeHoursToUnfreeze = gameTimeHoursObject.current_value;
    }
    if (gameTimeHoursObject.current_value < 23) {
      gameTimeHoursToUnfreeze = gameTimeHoursObject.current_value;
    }
    */
    gameTimeHoursToUnfreeze = gameTimeHoursObject.current_value;
    gameTimeMinutesToUnfreeze = gameTimeMinutesObject.current_value + freezeDuration;
  }
  if (gameTimeMinutesObject.current_value > 59 - freezeDuration) {
    console.log("CASE B");
    if (gameTimeHoursObject.current_value >= 23) {
      gameTimeHoursToUnfreeze = 0;
    }
    if (gameTimeHoursObject.current_value < 23) {
      gameTimeHoursToUnfreeze = gameTimeHoursObject.current_value + 1;
    }
    gameTimeMinutesToUnfreeze = gameTimeMinutesObject.current_value % freezeDuration;
  }
  console.log("gameTimeMinutesToUnfreeze = " + gameTimeMinutesToUnfreeze);
  freezeMovementState = true;
  returnMessage = "Unless time is changed or game is in slow motion when movement is still frozen, movement should unfreeze in about " + freezeDuration + " seconds, will unfreeze at " + gameTimeHoursToUnfreeze.toString().padStart(2, "0") + ":" + gameTimeMinutesToUnfreeze.toString().padStart(2, "0") + "! The time is " + gameTimeHoursObject.current_value.toString().padStart(2, "0") + ":" + gameTimeMinutesObject.current_value.toString().padStart(2, "0") + "!";
  writeToNotificationBox(returnMessage);
  client.action(channelName, "@" + username + " " + returnMessage);
  return returnMessage;
}

function changePlayerArmor(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't change armor, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  let msgWords = message.split(/\s+/ig);
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change armor, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change armor, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(Number(msgWords[0])) == true) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change armor, invalid armor number, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(Number(msgWords[0])) == false) {
    if (Number(msgWords[0]) < 0 || Number(msgWords[0]) > 200) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      returnMessage = "Can't change armor, invalid armor number, please make sure armor is between 0 and 200, please request a refund!";
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
    if (Number(msgWords[0]) >= 0 && Number(msgWords[0]) <= 200) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      writeToAppPointer("Player Pointer", "Player Armor", Number(msgWords[0]));
      let playerArmor = readFromAppPointer("Player Pointer", "Player Armor").current_value;
      returnMessage = "Successfully changed armor to " + playerArmor + "!";
      writeToNotificationBox(returnMessage);
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
  }
}

function changeTime(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't change time, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  let timeHours = 0;
  let timeMinutes = 0;
  let msgWords = message.split(/[\s\,\.\:\;]+/ig);
  //message = message.replace(/[^A-Za-z0-9\s\(\)\-\']+/ig, "");
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change time, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change time, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(parseInt(msgWords[0], 10)) == true || isNaN(parseInt(msgWords[1], 10)) == true) {
    returnMessage = "Can't change time, invalid time, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(parseInt(msgWords[0], 10)) == false && isNaN(parseInt(msgWords[1], 10)) == false) {
    if (parseInt(msgWords[0], 10) < 0 || parseInt(msgWords[0], 10) > 255 || parseInt(msgWords[1], 10) < 0 || parseInt(msgWords[1], 10) > 255) {
      returnMessage = "Can't change time, invalid time, please make sure hours and minutes are both between 0 and 255, please request a refund!";
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
    if (parseInt(msgWords[0], 10) >= 0 && parseInt(msgWords[0], 10) <= 255 && parseInt(msgWords[1], 10) >= 0 && parseInt(msgWords[1], 10) <= 255) {
      writeToAppMemory("Hours", parseInt(msgWords[0], 10));
      writeToAppMemory("Minutes", parseInt(msgWords[1], 10));
      timeHours = readFromAppMemory("Hours").current_value;
      timeMinutes = readFromAppMemory("Minutes").current_value;
      returnMessage = "Successfully changed time to " + timeHours.toString().padStart(2, "0") + ":" + timeMinutes.toString().padStart(2, "0") + "!";
      writeToNotificationBox(returnMessage);
      client.action(channelName, "@" + username + " " + returnMessage);
      gameTimeMinutesToUnfreeze = timeMinutes;
      gameTimeHoursToUnfreeze = timeHours;
      //freezeMovementState = false;
      return returnMessage;
    }
  }
}

function changeWantedLevel2(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't change wanted level, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  let msgWords = message.split(/\s+/ig);
  console.log("msgWords[0] " + msgWords[0]);
  console.log("parseInt(msgWords[0], 10) " + parseInt(msgWords[0], 10));
  console.log("isNaN(parseInt(msgWords[0], 10)) " + isNaN(parseInt(msgWords[0], 10)));
  if (processObject == undefined) {
    console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change wanted level, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change wanted level, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(parseInt(msgWords[0], 10)) == true) {
    console.log("Don't do anything I guess");
    returnMessage = "Can't change wanted level, invalid wanted level, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
}

function changeWantedLevel(username, message, channelName, customRewardIndex) {
  console.log("WANTED LEVEL");
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't change wanted level, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let wantedLevel = 0;
  let chaosLevel = 0;
  let playerPointer = 0;
  let msgWords = message.split(/\s+/ig);
  //message = message.replace(/[^A-Za-z0-9\s\(\)\-\']+/ig, "");
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change wanted level, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change wanted level, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(parseInt(msgWords[0], 10)) == true) {
    returnMessage = "Can't change wanted level, invalid wanted level, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(parseInt(msgWords[0], 10)) == false) {
    if (parseInt(msgWords[0], 10) < 0 || parseInt(msgWords[0], 10) > 6) {
      returnMessage = "Can't change wanted level, invalid wanted level, please make sure wanted level is between 0 and 6, please request a refund!";
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
    if (parseInt(msgWords[0], 10) >= 0 && parseInt(msgWords[0], 10) <= 6) {
      let wantedLevelChaosToFind = gameMemory.wanted_level_data.findIndex(element => element.wanted_level == parseInt(msgWords[0], 10));
      console.log(gameMemory.wanted_level_data[wantedLevelChaosToFind]);
      writeToAppPointer("Player Pointer", "Wanted Level", gameMemory.wanted_level_data[wantedLevelChaosToFind].wanted_level);
      writeToAppPointer("Player Pointer", "Chaos Level", gameMemory.wanted_level_data[wantedLevelChaosToFind].chaos_range[1]);
      chaosLevel = readFromAppPointer("Player Pointer", "Chaos Level").current_value;
      wantedLevel = readFromAppPointer("Player Pointer", "Wanted Level").current_value;
      returnMessage = "Successfully changed wanted level to " + wantedLevel + " star and chaos level to " + chaosLevel + "!";
      writeToNotificationBox(returnMessage);
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
  }
  console.log("WANTED LEVEL");
}

function takeWeaponsAway(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't take weapons away or return weapons back to player, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;

  let playerPointer = 0;
  let weaponAmmoArray = ["Player Weapon Slot 0 Ammo Current Clip", "Player Weapon Slot 0 Ammo Total", "Player Weapon Slot 1 Ammo Current Clip", "Player Weapon Slot 1 Ammo Total", "Player Weapon Slot 2 Ammo Current Clip", "Player Weapon Slot 2 Ammo Total", "Player Weapon Slot 3 Ammo Current Clip", "Player Weapon Slot 3 Ammo Total", "Player Weapon Slot 4 Ammo Current Clip", "Player Weapon Slot 4 Ammo Total", "Player Weapon Slot 5 Ammo Current Clip", "Player Weapon Slot 5 Ammo Total", "Player Weapon Slot 6 Ammo Current Clip", "Player Weapon Slot 6 Ammo Total", "Player Weapon Slot 7 Ammo Current Clip", "Player Weapon Slot 7 Ammo Total", "Player Weapon Slot 8 Ammo Current Clip", "Player Weapon Slot 8 Ammo Total", "Player Weapon Slot 9 Ammo Current Clip", "Player Weapon Slot 9 Ammo Total"];
  let takeWeaponsAway = false;
  let takeWeaponsAway2 = false;
  let doesWeaponDataExist = false;
  //console.log("doesWeaponDataExist = " + doesWeaponDataExist);
  /*
  let weapon0CurrentAmmo = 0;
  let weapon0TotalAmmo = 0;
  let weapon1CurrentAmmo = 0;
  let weapon1TotalAmmo = 0;
  let weapon2CurrentAmmo = 0;
  let weapon2TotalAmmo = 0;
  let weapon3CurrentAmmo = 0;
  let weapon3TotalAmmo = 0;
  let weapon4CurrentAmmo = 0;
  let weapon4TotalAmmo = 0;
  let weapon5CurrentAmmo = 0;
  let weapon5TotalAmmo = 0;
  let weapon6CurrentAmmo = 0;
  let weapon6TotalAmmo = 0;
  let weapon7CurrentAmmo = 0;
  let weapon7TotalAmmo = 0;
  let weapon8CurrentAmmo = 0;
  let weapon8TotalAmmo = 0;
  let weapon9CurrentAmmo = 0;
  let weapon9TotalAmmo = 0;
  */
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't take weapons away or return weapons back to player, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't take weapons away or return weapons back to player, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  doesWeaponDataExist = fs.existsSync("weapon_data.bin")
  let weaponBuffer = readFromAppPointerBuffer("Player Pointer", "Player Weapon Inventory", 280).current_value;
  //fs.writeFileSync("weapon_data.bin", weaponBuffer, "binary");
  //writeToAppPointerBuffer("Player Pointer", "Player Weapon Inventory", emptyWeaponInventoryBuffer);
  for (var weaponAmmoArrayIndex = 0; weaponAmmoArrayIndex < weaponAmmoArray.length; weaponAmmoArrayIndex++) {
    let ammoToReadValue = readFromAppPointer("Player Pointer", weaponAmmoArray[weaponAmmoArrayIndex]).current_value;
    //console.log(weaponAmmoArray[weaponAmmoArrayIndex] + " " + weaponAmmoArrayIndex + " " + ammoToReadValue);
    if (ammoToReadValue <= 0) {
      //console.log("Weapon doesn't have ammo");
      // if all weapons don't have ammo, return to old weapon inventory
    }
    if (ammoToReadValue > 0) {
      //console.log("Weapon has ammo");
      takeWeaponsAway = true;
      // Take weapons away if at least one weapon has ammo!
    }
  }
  if (takeWeaponsAway == false) {
    console.log("Return weapons from weapon_data.bin");
    if (doesWeaponDataExist == false) {
      console.log("weapon_data.bin doesn't exist, creating a template!");
      fs.writeFileSync("weapon_data.bin", emptyWeaponInventoryBuffer, "binary");
      returnMessage = "Can't return weapons back to player, there are no weapons to return, please request a refund!";
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
    if (doesWeaponDataExist == true) {
      oldWeaponInventory = fs.readFileSync("weapon_data.bin", "binary");
      var oldWeaponInventoryBuffer = Buffer.alloc(280, 0);
      oldWeaponInventoryBuffer.write(oldWeaponInventory, 0, 280, "binary");
      //fs.writeFileSync("weapon_data.bin", weaponBuffer, "binary");
      writeToAppPointerBuffer("Player Pointer", "Player Weapon Inventory", oldWeaponInventoryBuffer);
      for (var weaponAmmoArrayIndex = 0; weaponAmmoArrayIndex < weaponAmmoArray.length; weaponAmmoArrayIndex++) {
        let ammoToReadValue = readFromAppPointer("Player Pointer", weaponAmmoArray[weaponAmmoArrayIndex]).current_value;
        //console.log(weaponAmmoArray[weaponAmmoArrayIndex] + " " + weaponAmmoArrayIndex + " " + ammoToReadValue);
        if (ammoToReadValue <= 0) {
          //console.log("Weapon doesn't have ammo");
          // if all weapons don't have ammo, return to old weapon inventory
        }
        if (ammoToReadValue > 0) {
          //console.log("Weapon has ammo");
          takeWeaponsAway2 = true;
          // Take weapons away if at least one weapon has ammo!
        }
      }
      if (takeWeaponsAway2 == true) {
        returnMessage = "Successfully returned weapons back to player, redeem this reward again to take weapons away!";
        writeToNotificationBox(returnMessage);
        client.action(channelName, "@" + username + " " + returnMessage);
        return returnMessage;
      }
      if (takeWeaponsAway2 == false) {
        returnMessage = "Can't return weapons back to player, inventory is still empty, please request a refund!";
        //writeToNotificationBox(returnMessage);
        client.action(channelName, "@" + username + " " + returnMessage);
        return returnMessage;
      }
    }
  }
  if (takeWeaponsAway == true) {
    console.log("Take weapons away and save to weapon_data.bin");
    fs.writeFileSync("weapon_data.bin", weaponBuffer, "binary");
    writeToAppPointerBuffer("Player Pointer", "Player Weapon Inventory", emptyWeaponInventoryBuffer);
    returnMessage = "Successfully took weapons away, redeem this reward again to return weapons back to player!";
    writeToNotificationBox(returnMessage);
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  /*
  weapon0CurrentAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 0 Ammo Current Clip").current_value;
  weapon0TotalAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 0 Ammo Total").current_value;
  weapon1CurrentAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 1 Ammo Current Clip").current_value;
  weapon1TotalAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 1 Ammo Total").current_value;
  weapon2CurrentAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 2 Ammo Current Clip").current_value;
  weapon2TotalAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 2 Ammo Total").current_value;
  weapon3CurrentAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 3 Ammo Current Clip").current_value;
  weapon3TotalAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 3 Ammo Total").current_value;
  weapon4CurrentAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 4 Ammo Current Clip").current_value;
  weapon4TotalAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 4 Ammo Total").current_value;
  weapon5CurrentAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 5 Ammo Current Clip").current_value;
  weapon5TotalAmmo = readFromAppPointer("Player Pointer", "Player Weapon Slot 5 Ammo Total").current_value;
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 6 Ammo Current Clip").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 6 Ammo Total").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 7 Ammo Current Clip").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 7 Ammo Total").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 8 Ammo Current Clip").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 8 Ammo Total").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 9 Ammo Current Clip").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 9 Ammo Total").current_value);
  */
  /*
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 2 Ammo Status").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 3 Ammo Status").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 4 Ammo Status").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 5 Ammo Status").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 6 Ammo Status").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 7 Ammo Status").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 8 Ammo Status").current_value);
  console.log(readFromAppPointer("Player Pointer", "Player Weapon Slot 9 Ammo Status").current_value);
  */
  //console.log(weaponBuffer);
  //console.log(emptyWeaponInventory);
  //console.log(emptyWeaponInventoryBuffer);
}

function addVehicleToGarage(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't spawn vehicle in garages, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  message = message.replace(/[^A-Za-z0-9\s\(\)\-\']+/ig, "");
  let msgWords = message.split(/[\s\,\.]+/ig);
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't spawn vehicle in garages, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't spawn vehicle in garages, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let vehicleToFind = gameMemory.vehicle_data.findIndex(element => element.name.toLowerCase() == msgWords[0].toLowerCase());
  console.log("vehicleToFind = " + vehicleToFind);
  if (vehicleToFind == -1) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't spawn vehicle in garages, invalid vehicle name, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  //console.log("gameMemory.vehicle_flags");
  //console.log(gameMemory.vehicle_flags);
  let vehicleFlagsUsed = [false, false, false, false, false, false, false, false, false];
  let vehicleFlagsValue = 0;
  let vehicleFlagsStringArray = [];
  //console.log("vehicleFlagsUsed.length = " + vehicleFlagsUsed.length);
  //console.log(vehicleFlagsUsed);
  for (let msgWordsIndex = 0; msgWordsIndex < msgWords.length; msgWordsIndex++) {
    for (let vehicleFlagIndex = 0; vehicleFlagIndex < gameMemory.vehicle_flags.length; vehicleFlagIndex++) {
      /*
      if (vehicleFlagsUsed[vehicleFlagIndex] == true) {
        console.log("TEST");
        console.log(msgWords[msgWordsIndex]);
      }
      */
      if (vehicleFlagsUsed[vehicleFlagIndex] == false) {
        for (let vehicleFlagAliasIndex = 0; vehicleFlagAliasIndex < gameMemory.vehicle_flags[vehicleFlagIndex].alias.length; vehicleFlagAliasIndex++) {
          //console.log("vehicleFlagIndex = " + vehicleFlagIndex + " , vehicleFlagAliasIndex = " + vehicleFlagAliasIndex);
          //console.log(gameMemory.vehicle_flags[vehicleFlagIndex].description + " " + gameMemory.vehicle_flags[vehicleFlagIndex].alias[vehicleFlagAliasIndex]);
          if (gameMemory.vehicle_flags[vehicleFlagIndex].alias[vehicleFlagAliasIndex].toLowerCase() == msgWords[msgWordsIndex].toLowerCase()) {
            //
            //console.log("vehicleFlagIndex = " + vehicleFlagIndex + " , vehicleFlagAliasIndex = " + vehicleFlagAliasIndex);
            //console.log(gameMemory.vehicle_flags[vehicleFlagIndex].description + " " + gameMemory.vehicle_flags[vehicleFlagIndex].alias[vehicleFlagAliasIndex]);
            //console.log("Flag " + gameMemory.vehicle_flags[vehicleFlagIndex].description + " used!");
            //console.log("Flag " + gameMemory.vehicle_flags[vehicleFlagIndex].flag_value + " used!");
            vehicleFlagsValue = vehicleFlagsValue + gameMemory.vehicle_flags[vehicleFlagIndex].flag_value;
            //console.log("vehicleFlagsValue = " + vehicleFlagsValue);
            vehicleFlagsStringArray.push(gameMemory.vehicle_flags[vehicleFlagIndex].description);
            vehicleFlagsUsed[vehicleFlagIndex] = true;
          }
        }
      }
      //console.log("vehicleFlagIndex = " + vehicleFlagIndex);
      //console.log(gameMemory.vehicle_flags[vehicleFlagIndex]);
    }
  }
  //console.log("vehicleFlagsValue = " + vehicleFlagsValue);
  console.log("vehicleId = " + gameMemory.vehicle_data[vehicleToFind].id);
  console.log("vehicleName = " + gameMemory.vehicle_data[vehicleToFind].name);
  // Lines below belong to Portland Garage (First Island)
  writeToAppMemory("Vehicle 3 In Portland Garage ID", gameMemory.vehicle_data[vehicleToFind].id);
  writeToAppMemory("Vehicle 3 In Portland Garage Position X", gameMemory.spawn_vehicle_portland_garage_data.position_x);
  writeToAppMemory("Vehicle 3 In Portland Garage Position Y", gameMemory.spawn_vehicle_portland_garage_data.position_y);
  writeToAppMemory("Vehicle 3 In Portland Garage Position Z", gameMemory.spawn_vehicle_portland_garage_data.position_z);
  writeToAppMemory("Vehicle 3 In Portland Garage Rotation X", gameMemory.spawn_vehicle_portland_garage_data.rotation_x);
  writeToAppMemory("Vehicle 3 In Portland Garage Rotation Y", gameMemory.spawn_vehicle_portland_garage_data.rotation_y);
  writeToAppMemory("Vehicle 3 In Portland Garage Rotation Z", gameMemory.spawn_vehicle_portland_garage_data.rotation_z);
  writeToAppMemory("Vehicle 3 In Portland Garage Rotation W", gameMemory.spawn_vehicle_portland_garage_data.rotation_w);
  writeToAppMemory("Vehicle 3 In Portland Garage Flags", vehicleFlagsValue);
  // Lines below belong to Staunton Garage (Second Island)
  writeToAppMemory("Vehicle 3 In Staunton Garage ID", gameMemory.vehicle_data[vehicleToFind].id);
  writeToAppMemory("Vehicle 3 In Staunton Garage Position X", gameMemory.spawn_vehicle_staunton_garage_data.position_x);
  writeToAppMemory("Vehicle 3 In Staunton Garage Position Y", gameMemory.spawn_vehicle_staunton_garage_data.position_y);
  writeToAppMemory("Vehicle 3 In Staunton Garage Position Z", gameMemory.spawn_vehicle_staunton_garage_data.position_z);
  writeToAppMemory("Vehicle 3 In Staunton Garage Rotation X", gameMemory.spawn_vehicle_staunton_garage_data.rotation_x);
  writeToAppMemory("Vehicle 3 In Staunton Garage Rotation Y", gameMemory.spawn_vehicle_staunton_garage_data.rotation_y);
  writeToAppMemory("Vehicle 3 In Staunton Garage Rotation Z", gameMemory.spawn_vehicle_staunton_garage_data.rotation_z);
  writeToAppMemory("Vehicle 3 In Staunton Garage Rotation W", gameMemory.spawn_vehicle_staunton_garage_data.rotation_w);
  writeToAppMemory("Vehicle 3 In Staunton Garage Flags", vehicleFlagsValue);
  // Lines below belong to Shoreside Vale Garage (Third Island)
  writeToAppMemory("Vehicle 3 In Shoreside Vale Garage ID", gameMemory.vehicle_data[vehicleToFind].id);
  writeToAppMemory("Vehicle 3 In Shoreside Vale Garage Position X", gameMemory.spawn_vehicle_shoreside_vale_garage_data.position_x);
  writeToAppMemory("Vehicle 3 In Shoreside Vale Garage Position Y", gameMemory.spawn_vehicle_shoreside_vale_garage_data.position_y);
  writeToAppMemory("Vehicle 3 In Shoreside Vale Garage Position Z", gameMemory.spawn_vehicle_shoreside_vale_garage_data.position_z);
  writeToAppMemory("Vehicle 3 In Shoreside Vale Garage Rotation X", gameMemory.spawn_vehicle_shoreside_vale_garage_data.rotation_x);
  writeToAppMemory("Vehicle 3 In Shoreside Vale Garage Rotation Y", gameMemory.spawn_vehicle_shoreside_vale_garage_data.rotation_y);
  writeToAppMemory("Vehicle 3 In Shoreside Vale Garage Rotation Z", gameMemory.spawn_vehicle_shoreside_vale_garage_data.rotation_z);
  writeToAppMemory("Vehicle 3 In Shoreside Vale Garage Rotation W", gameMemory.spawn_vehicle_shoreside_vale_garage_data.rotation_w);
  writeToAppMemory("Vehicle 3 In Shoreside Vale Garage Flags", vehicleFlagsValue);
  //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  //console.log("Don't do anything I guess");
  if (vehicleFlagsStringArray.length > 0) {
    vehicleFlagsStringArray = vehicleFlagsStringArray.join(", ");
    //console.log(vehicleFlagsStringArray);
    returnMessage = "Spawned " + gameMemory.vehicle_data[vehicleToFind].name + " with the properties " + vehicleFlagsStringArray + " in garages!";
  }
  if (vehicleFlagsStringArray.length <= 0) {
    returnMessage = "Spawned " + gameMemory.vehicle_data[vehicleToFind].name + " in garages!";
  }
  writeToNotificationBox(returnMessage);
  client.action(channelName, "@" + username + " " + returnMessage);
  return returnMessage;
}

function changeRadioStation(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't change radio station, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  let vehiclePointer = 0;
  let msgWords = message.split(/\s+/ig);
  message = message.replace(/[^A-Za-z0-9\s]+/ig, "");
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change radio station, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change radio station, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (vehiclePointer <= startPointerAddress || vehiclePointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change radio station, player is not in a vehicle, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    let radioStationToFind = gameMemory.radio_data.findIndex(element => element.name.toLowerCase() == message.toLowerCase());
    console.log("radioStationToFind = " + radioStationToFind);
    if (radioStationToFind == -1) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      returnMessage = "Can't change radio station, invalid radio station, please request a refund!";
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    //console.log("Don't do anything I guess");
    writeToAppMemory("Radio Station", gameMemory.radio_data[radioStationToFind].id);
    returnMessage = "Changed radio station to " + gameMemory.radio_data[radioStationToFind].name + "!";
    writeToNotificationBox(returnMessage);
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
}

function changeSpeed(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't change speed, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let defaultMultiplier = 1.25;
  let customMultiplier = 1.25;
  let playerPointer = 0;
  let vehiclePointer = 0;
  let playerSpeed = 0;
  let vehicleSpeed = 0;
  let msgWords = message.split(/[\s\,]+/ig);
  msgWords[0] = msgWords[0].replace(/[\x\X]+/ig, "");
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change speed, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change speed, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(Number(msgWords[0])) == true) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    writeToAppPointer("Player Pointer", "Player Speed X", readFromAppPointer("Player Pointer", "Player Speed X").current_value * defaultMultiplier);
    writeToAppPointer("Player Pointer", "Player Speed Y", readFromAppPointer("Player Pointer", "Player Speed Y").current_value * defaultMultiplier);
    writeToAppPointer("Player Pointer", "Player Speed Z", readFromAppPointer("Player Pointer", "Player Speed Z").current_value * defaultMultiplier);
    if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X").current_value * defaultMultiplier);
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y").current_value * defaultMultiplier);
      writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z").current_value * defaultMultiplier);
      writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", readFromAppPointer("Vehicle Pointer", "Vehicle Speed X").current_value * defaultMultiplier);
      writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", readFromAppPointer("Vehicle Pointer", "Vehicle Speed Y").current_value * defaultMultiplier);
      writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", readFromAppPointer("Vehicle Pointer", "Vehicle Speed Z").current_value * defaultMultiplier);
      vehicleSpeed = readFromAppPointer("Vehicle Pointer", "Vehicle Linear Speed Unsigned").current_value.toFixed(4);
      returnMessage = "Invalid multiplier, using " + defaultMultiplier + "x multiplier, changed vehicle speed to " + vehicleSpeed + "!";
      writeToNotificationBox(returnMessage);
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
    playerSpeed = readFromAppPointer("Player Pointer", "Player Linear Speed Unsigned").current_value.toFixed(4);
    returnMessage = "Invalid multiplier, using " + defaultMultiplier + "x multiplier, changed player speed to " + playerSpeed + "!";
    writeToNotificationBox(returnMessage);
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(Number(msgWords[0])) == false) {
    if (Number(msgWords[0]) < -10 || Number(msgWords[0]) > 10) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      writeToAppPointer("Player Pointer", "Player Speed X", readFromAppPointer("Player Pointer", "Player Speed X").current_value * defaultMultiplier);
      writeToAppPointer("Player Pointer", "Player Speed Y", readFromAppPointer("Player Pointer", "Player Speed Y").current_value * defaultMultiplier);
      writeToAppPointer("Player Pointer", "Player Speed Z", readFromAppPointer("Player Pointer", "Player Speed Z").current_value * defaultMultiplier);
      if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
        //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
        writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X").current_value * defaultMultiplier);
        writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y").current_value * defaultMultiplier);
        writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z").current_value * defaultMultiplier);
        writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", readFromAppPointer("Vehicle Pointer", "Vehicle Speed X").current_value * defaultMultiplier);
        writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", readFromAppPointer("Vehicle Pointer", "Vehicle Speed Y").current_value * defaultMultiplier);
        writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", readFromAppPointer("Vehicle Pointer", "Vehicle Speed Z").current_value * defaultMultiplier);
        vehicleSpeed = readFromAppPointer("Vehicle Pointer", "Vehicle Linear Speed Unsigned").current_value.toFixed(4);
        returnMessage = "Invalid multiplier, using " + defaultMultiplier + "x multiplier, changed vehicle speed to " + vehicleSpeed + "!";
        writeToNotificationBox(returnMessage);
        client.action(channelName, "@" + username + " " + returnMessage);
        return returnMessage;
      }
      playerSpeed = readFromAppPointer("Player Pointer", "Player Linear Speed Unsigned").current_value.toFixed(4);
      returnMessage = "Invalid multiplier, using " + defaultMultiplier + "x multiplier, changed player speed to " + playerSpeed + "!";
      writeToNotificationBox(returnMessage);
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
    if (Number(msgWords[0]) >= -10 && Number(msgWords[0]) <= 10) {
      if (Number(msgWords[0]) > 0.9 && Number(msgWords[0]) < 1.1) {
        msgWords[0] = "1.25";
      }
      customMultiplier = Number(msgWords[0]);
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      writeToAppPointer("Player Pointer", "Player Speed X", readFromAppPointer("Player Pointer", "Player Speed X").current_value * customMultiplier);
      writeToAppPointer("Player Pointer", "Player Speed Y", readFromAppPointer("Player Pointer", "Player Speed Y").current_value * customMultiplier);
      writeToAppPointer("Player Pointer", "Player Speed Z", readFromAppPointer("Player Pointer", "Player Speed Z").current_value * customMultiplier);
      if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
        //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
        writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X").current_value * customMultiplier);
        writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y").current_value * customMultiplier);
        writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z").current_value * customMultiplier);
        writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", readFromAppPointer("Vehicle Pointer", "Vehicle Speed X").current_value * customMultiplier);
        writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", readFromAppPointer("Vehicle Pointer", "Vehicle Speed Y").current_value * customMultiplier);
        writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", readFromAppPointer("Vehicle Pointer", "Vehicle Speed Z").current_value * customMultiplier);
        vehicleSpeed = readFromAppPointer("Vehicle Pointer", "Vehicle Linear Speed Unsigned").current_value.toFixed(4);
        returnMessage = "Set multiplier to " + customMultiplier + "x, changed vehicle speed to " + vehicleSpeed + "!";
        writeToNotificationBox(returnMessage);
        client.action(channelName, "@" + username + " " + returnMessage);
        return returnMessage;
      }
      playerSpeed = readFromAppPointer("Player Pointer", "Player Linear Speed Unsigned").current_value.toFixed(4);
      returnMessage = "Set multiplier to " + customMultiplier + "x, changed player speed to " + playerSpeed + "!";
      writeToNotificationBox(returnMessage);
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
  }
}

function turnAround(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't turn around, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let vehiclePointer = 0;
  let playerPointer = 0;
  let msgWords = message.split(/\s+/ig);
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't turn around, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't turn around, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  /*
  writeToAppPointer("Player Pointer", "Player Rotation NS", invertNumberSign(readFromAppPointer("Player Pointer", "Player Rotation NS").current_value));
  writeToAppPointer("Player Pointer", "Player Rotation EW", invertNumberSign(readFromAppPointer("Player Pointer", "Player Rotation EW").current_value));
  writeToAppPointer("Player Pointer", "Player Rotation Tilt LR", invertNumberSign(readFromAppPointer("Player Pointer", "Player Rotation Tilt LR").current_value));
  writeToAppPointer("Player Pointer", "Player Rotation EW 2", invertNumberSign(readFromAppPointer("Player Pointer", "Player Rotation EW 2").current_value));
  writeToAppPointer("Player Pointer", "Player Rotation NS 2", invertNumberSign(readFromAppPointer("Player Pointer", "Player Rotation NS 2").current_value));
  writeToAppPointer("Player Pointer", "Player Rotation Tilt UD", invertNumberSign(readFromAppPointer("Player Pointer", "Player Rotation Tilt UD").current_value));
  */
  //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  writeToAppPointer("Player Pointer", "Player Heading", turnRadiansAround(readFromAppPointer("Player Pointer", "Player Heading").current_value));
  writeToAppPointer("Player Pointer", "Player Speed X", invertNumberSign(readFromAppPointer("Player Pointer", "Player Speed X").current_value));
  writeToAppPointer("Player Pointer", "Player Speed Y", invertNumberSign(readFromAppPointer("Player Pointer", "Player Speed Y").current_value));
  writeToAppPointer("Player Pointer", "Player Speed Z", invertNumberSign(readFromAppPointer("Player Pointer", "Vehicle Speed Z").current_value));
  if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Speed X").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Speed Y").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Speed Z").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z").current_value));
  }
  returnMessage = "Turned around!";
  writeToNotificationBox(returnMessage);
  client.action(channelName, "@" + username + " " + returnMessage);
  return returnMessage;
  /*
  if (readFromAppMemory("Vehicle Pointer").current_value <= startPointerAddress || readFromAppMemory("Vehicle Pointer").current_value >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    client.action(channelName, "@" + username + " Can't turn vehicle around, player is not in a vehicle, please request a refund!");
    return "Can't turn vehicle around, player is not in a vehicle, please request a refund!";
  }
  */
  /*
  if (readFromAppMemory("Vehicle Pointer").current_value > startPointerAddress && readFromAppMemory("Vehicle Pointer").current_value < endPointerAddress) {
    //console.log("Don't do anything I guess");
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Speed X").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Speed Y").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Speed Z").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z").current_value));
    writeToNotificationBox("Turned vehicle around!");
    client.action(channelName, "@" + username + " Turned vehicle around!");
    return "Turned vehicle around!";
  }
  */
}

function flipVehicleUpsideDown(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't flip vehicle upside, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  let vehiclePointer = 0;
  let msgWords = message.split(/\s+/ig);
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't flip vehicle upside down, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't flip vehicle upside down, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (vehiclePointer <= startPointerAddress || vehiclePointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't flip vehicle upside down, player is not in a vehicle, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation NS").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation EW").current_value));
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR", invertNumberSign(readFromAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR").current_value));
    returnMessage = "Flipped vehicle upside down!";
    writeToNotificationBox(returnMessage);
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
}

function changeVehicleColor(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  //let msgWords = message.split(/\s+/ig);
  //let colors = message.split(/\,+/ig);
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't change vehicle colors, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let vehiclePointer = 0;
  let playerPointer = 0;
  let colorsMsg = message.replace(/\s+/ig, "");
  let colors = message.split(/[\s\,\.]+/ig);

  let colors2 = message.replace(/(0x)+/ig, "");
  colors2 = colors2.replace(/\s+/ig, "");
  colors2 = colors2.replace(/\,+/ig, "");
  colors2 = colors2.replace(/\.+/ig, "");
  colors2 = colors2.replace(/L+/ig, "");
  colors2 = colors2.replace(/\#+/ig, "");
  console.log("colors2 = " + colors2);
  //console.log("colors2 BEFORE");
  //console.log(colors2);
  colors2 = Uint8Array.from(Buffer.from(colors2, "hex"));
  //console.log("colors2 AFTER");
  //console.log(colors2);
  //console.log(colors2.length);
  if (isNaN(parseInt(colors[0], 10)) == true || isNaN(parseInt(colors[1], 10)) == true || isNaN(parseInt(colors[2], 10)) == true) {
    if (colors2.length < 3) {
      // Do nothing
      console.log("[HEX COLOR PARSING] Do nothing");
    }
    if (colors2.length >= 3 && colors2.length < 6) {
      // Parse primary color
      console.log("[HEX COLOR PARSING] Primary Color only");
      colors[0] = colors2[0];
      colors[1] = colors2[1];
      colors[2] = colors2[2];
    }
    if (colors2.length >= 6) {
      // Parse primary and secondary color
      console.log("[HEX COLOR PARSING] Primary AND Secondary Colors");
      colors[0] = colors2[0];
      colors[1] = colors2[1];
      colors[2] = colors2[2];
      colors[3] = colors2[3];
      colors[4] = colors2[4];
      colors[5] = colors2[5];
    }
  }
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change vehicle colors, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change vehicle colors, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (vehiclePointer <= startPointerAddress || vehiclePointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change vehicle colors, player is not in a vehicle, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(parseInt(colors[0], 10)) == true || isNaN(parseInt(colors[1], 10)) == true || isNaN(parseInt(colors[2], 10)) == true) {
    if (isNaN(parseInt(colors[0], 10)) == true || isNaN(parseInt(colors[1], 10)) == true || isNaN(parseInt(colors[2], 10)) == true || isNaN(parseInt(colors[3], 10)) == true || isNaN(parseInt(colors[4], 10)) == true || isNaN(parseInt(colors[5], 10)) == true) {

    }
    console.log("colors[0] = " + colors[0]);
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    console.log("Invalid colors");
    returnMessage = "Can't change vehicle colors, invalid colors, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(parseInt(colors[0], 10)) == false && isNaN(parseInt(colors[1], 10)) == false && isNaN(parseInt(colors[2], 10)) == false) {
    if (isNaN(parseInt(colors[3], 10)) == true || isNaN(parseInt(colors[4], 10)) == true || isNaN(parseInt(colors[5], 10)) == true) {
      if (parseInt(colors[0], 10) < 0 || parseInt(colors[0], 10) > 255 || parseInt(colors[1], 10) < 0 || parseInt(colors[1], 10) > 255 || parseInt(colors[2], 10) < 0 || parseInt(colors[2], 10) > 255) {
        //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
        returnMessage = "Can't change vehicle colors, invalid colors, please make sure colors are between 0 and 255, please request a refund!";
        client.action(channelName, "@" + username + " " + returnMessage);
        return returnMessage;
      }
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      console.log("Valid color, only first color was provided");
      let randColor = Math.floor(Math.random() * (255 - 101 + 1)) + 101;
      let carcols = readFromAppBuffer("carcols.dat", getMemoryDataSize("carcols.dat")).current_value;
      // Primary Colors (Set both primary and secondary colors of the vehicle to be the same)
      carcols.writeUInt8(parseInt(colors[0], 10), (randColor * 4) + 0);
      carcols.writeUInt8(parseInt(colors[1], 10), (randColor * 4) + 1);
      carcols.writeUInt8(parseInt(colors[2], 10), (randColor * 4) + 2);
      carcols.writeUInt8(0xFF, (randColor * 4) + 3);
      writeToAppBuffer("carcols.dat", carcols);
      writeToAppPointer("Vehicle Pointer", "Vehicle Colors Primary", randColor);
      writeToAppPointer("Vehicle Pointer", "Vehicle Colors Secondary", randColor);
      returnMessage = "Successfully changed vehicle color to " + parseInt(colors[0], 10) + "," + parseInt(colors[1], 10) + "," + parseInt(colors[2], 10) + "!";
      writeToNotificationBox(returnMessage);
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
    if (isNaN(parseInt(colors[3], 10)) == false && isNaN(parseInt(colors[4], 10)) == false && isNaN(parseInt(colors[5], 10)) == false) {
      if (parseInt(colors[0], 10) < 0 || parseInt(colors[0], 10) > 255 || parseInt(colors[1], 10) < 0 || parseInt(colors[1], 10) > 255 || parseInt(colors[2], 10) < 0 || parseInt(colors[2], 10) > 255 || parseInt(colors[3], 10) < 0 || parseInt(colors[3], 10) > 255 || parseInt(colors[4], 10) < 0 || parseInt(colors[4], 10) > 255 || parseInt(colors[5], 10) < 0 || parseInt(colors[5], 10) > 255) {
        //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
        returnMessage = "Can't change vehicle colors, invalid colors, please make sure colors are between 0 and 255, please request a refund!";
        client.action(channelName, "@" + username + " " + returnMessage);
        return returnMessage;
      }
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      console.log("Valid colors, first and second colors were provided");
      let primaryColor = Math.floor(Math.random() * (255 - 101 + 1)) + 101;
      let secondaryColor = Math.floor(Math.random() * (255 - 101 + 1)) + 101;
      let carcols = readFromAppBuffer("carcols.dat", getMemoryDataSize("carcols.dat")).current_value;
      // Primary Colors
      carcols.writeUInt8(parseInt(colors[0], 10), (primaryColor * 4) + 0);
      carcols.writeUInt8(parseInt(colors[1], 10), (primaryColor * 4) + 1);
      carcols.writeUInt8(parseInt(colors[2], 10), (primaryColor * 4) + 2);
      carcols.writeUInt8(0xFF, (primaryColor * 4) + 3);
      // Secondary Colors
      carcols.writeUInt8(parseInt(colors[3], 10), (secondaryColor * 4) + 0);
      carcols.writeUInt8(parseInt(colors[4], 10), (secondaryColor * 4) + 1);
      carcols.writeUInt8(parseInt(colors[5], 10), (secondaryColor * 4) + 2);
      carcols.writeUInt8(0xFF, (secondaryColor * 4) + 3);
      writeToAppBuffer("carcols.dat", carcols);
      writeToAppPointer("Vehicle Pointer", "Vehicle Colors Primary", primaryColor);
      writeToAppPointer("Vehicle Pointer", "Vehicle Colors Secondary", secondaryColor);
      returnMessage = "Successfully changed vehicle primary color to " + parseInt(colors[0], 10) + "," + parseInt(colors[1], 10) + "," + parseInt(colors[2], 10) + " and secondary color to " + parseInt(colors[3], 10) + "," + parseInt(colors[4], 10) + "," + parseInt(colors[5], 10) + "!";
      writeToNotificationBox(returnMessage);
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
  }
}

function spinCar(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't spin vehicle, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let vehiclePointer = 0;
  let playerPointer = 0;
  let msgWords = message.split(/\s+/ig);
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't spin vehicle, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't spin vehicle, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (vehiclePointer <= startPointerAddress || vehiclePointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    // rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't spin vehicle, player is not in a vehicle, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "LET IT RIP!";
    writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", 10);
    writeToNotificationBox(returnMessage);
    client.action(channelName, "@" + username + " " + returnMessage);
    io.sockets.emit("play_sound", "Beyblade");
    return returnMessage;
  }
}

function changeVehicleHealth(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't change vehicle health, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let vehiclePointer = 0;
  let playerPointer = 0;
  let msgWords = message.split(/\s+/ig);
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change vehicle health, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change vehicle health, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (vehiclePointer <= startPointerAddress || vehiclePointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change vehicle health, player is not in a vehicle, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(Number(msgWords[0])) == true) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change vehicle health, invalid vehicle health, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(Number(msgWords[0])) == false) {
    if (Number(msgWords[0]) < 0 || Number(msgWords[0]) > 1000) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      returnMessage = "Can't change vehicle health, invalid vehicle health, please make sure health is between 0 and 1000, please request a refund!";
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
    if (Number(msgWords[0]) >= 0 && Number(msgWords[0]) <= 1000) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      writeToAppPointer("Vehicle Pointer", "Vehicle Health", Number(msgWords[0]));
      let vehicleHealth = readFromAppPointer("Vehicle Pointer", "Vehicle Health").current_value;
      returnMessage = "Successfully changed vehicle health to " + vehicleHealth + "!";
      writeToNotificationBox(returnMessage);
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
  }
}

function changePlayerHealth(username, message, channelName, customRewardIndex) {
  let returnMessage = "";
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    returnMessage = "Can't change health, reward on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  let msgWords = message.split(/\s+/ig);
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change health, game is not running, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change health, game is not ready, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(Number(msgWords[0])) == true) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    returnMessage = "Can't change health, invalid health number, please request a refund!";
    client.action(channelName, "@" + username + " " + returnMessage);
    return returnMessage;
  }
  if (isNaN(Number(msgWords[0])) == false) {
    if (Number(msgWords[0]) < 0 || Number(msgWords[0]) > 200) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      returnMessage = "Can't change health, invalid health number, please make sure health is between 0 and 200, please request a refund!";
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
    if (Number(msgWords[0]) >= 0 && Number(msgWords[0]) <= 200) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      writeToAppPointer("Player Pointer", "Player Health", Number(msgWords[0]));
      let playerHealth = readFromAppPointer("Player Pointer", "Player Health").current_value;
      returnMessage = "Successfully changed health to " + playerHealth + "!";
      writeToNotificationBox(returnMessage);
      client.action(channelName, "@" + username + " " + returnMessage);
      return returnMessage;
    }
  }
}

function prepareToWarp(username, message, channelName, customRewardIndex) {
  //console.log("This is a warp!");
  let coordinatesMsg = message.replace(/[\s\!]+/ig, "");
  let coordinates = message.split(/[\s\,]+/ig);
  if (isNaN(Number(coordinates[0])) == true) {
    client.action(channelName, "@" + username + " Invalid coordinates, please request a refund!");
  }
  if (isNaN(Number(coordinates[0])) == false && isNaN(Number(coordinates[1])) == true && isNaN(Number(coordinates[2])) == true) {
    notifMessage = warpToLocation(undefined, undefined, Number(coordinates[0]), customRewardIndex);
    writeToNotificationBox(notifMessage);
    client.action(channelName, "@" + username + " " + notifMessage);
  }
  if (isNaN(Number(coordinates[0])) == false && isNaN(Number(coordinates[1])) == false) {
    if (isNaN(Number(coordinates[2])) == true) {
      notifMessage = warpToLocation(Number(coordinates[0]), Number(coordinates[1]), undefined, customRewardIndex);
      writeToNotificationBox(notifMessage);
      client.action(channelName, "@" + username + " " + notifMessage);
    }
    if (isNaN(Number(coordinates[2])) == false) {
      notifMessage = warpToLocation(Number(coordinates[0]), Number(coordinates[1]), Number(coordinates[2]), customRewardIndex);
      writeToNotificationBox(notifMessage);
      client.action(channelName, "@" + username + " " + notifMessage);
    }
  }
}

function warpToLocation(coordX, coordY, coordZ, customRewardIndex) {
  /*
  if (rewardsConfig.rewards[customRewardIndex].cooldown <= new Date().getTime()) {
    console.log("THIS IS VALID");
  }
  */
  if (rewardsConfig.rewards[customRewardIndex].cooldown > new Date().getTime()) {
    //console.log("WE HAVE TO WAIT!");
    return "Can't warp, warp on cooldown, if you're seeing this, it means you bypassed Twitch's cooldown, next reward available in " + parseInt(((rewardsConfig.rewards[customRewardIndex].cooldown - new Date().getTime()) / 1000), 10) + " seconds, please request a refund!";
  }
  rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
  let playerPointer = 0;
  let vehiclePointer = 0;
  if (coordX < -1900 || coordX > 1900 || coordY < -1900 || coordY > 1900 || coordZ < -190 || coordZ > 190) {
    // Invalid coordinates that can crash the game
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    return "Invalid coordinate range, please make sure X and Y coordinates are between -1900 and 1900, and Z coordinate is between -190 and 190, please request a refund!";
  }
  /*
  if (coordX >= -1900 && coordX <= 1900 && coordY >= -1900 && coordY <= 1900 && coordZ >= -190 && coordZ <= 190) {
    // Valid coordinates that certainly won't crash the game
    console.log("VALID!");
  }
  */
  if (processObject == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    return "Can't warp, game is not running, please request a refund!";
  }
  playerPointer = readFromAppMemory("Player Pointer").current_value;
  vehiclePointer = readFromAppMemory("Vehicle Pointer").current_value;
  if (playerPointer <= startPointerAddress || playerPointer >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    return "Can't warp, game is not ready, please request a refund!";
  }
  if (coordX == undefined && coordY == undefined && coordZ != undefined) {
    // Set only coordinate Z
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    //writeToAppPointer("Player Pointer", "Player Speed X", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Y", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Z", 0);
    //writeToAppPointer("Player Pointer", "Player Heading", 0);

    //writeToAppPointer("Player Pointer", "Player Position X", coordX);
    //writeToAppPointer("Player Pointer", "Player Position Y", coordY);
    writeToAppPointer("Player Pointer", "Player Position Z", coordZ);

    //writeToAppPointer("Player Pointer", "Player Speed X", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Y", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Z", 0);
    //writeToAppPointer("Player Pointer", "Player Heading", 0);
    if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      // Set all speeds and rotations to 0 BEFORE warping
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", 0); // The 3 lines above are to make sure the car's speed is set to 0, so it doesn't go spinning like crazy
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD", 0); // The 6 rotation lines above are to make the car always face north
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", 0); // The 3 lines above are to make sure the car doesn't spin like crazy when warping

      //writeToAppPointer("Vehicle Pointer", "Vehicle Position X", coordX);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Position Y", coordY);
      writeToAppPointer("Vehicle Pointer", "Vehicle Position Z", coordZ);

      // AND set all speeds and rotations to 0 AFTER warping, just to make sure, hopefully this will fix the thing where sometimes vehicles spin like crazy when warping
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", 0); // The 3 lines above are to make sure the car's speed is set to 0, so it doesn't go spinning like crazy
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD", 0); // The 6 rotation lines above are to make the car always face north
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", 0); // The 3 lines above are to make sure the car doesn't spin like crazy when warping
      return "Successfully warped to " + readFromAppPointer("Vehicle Pointer", "Vehicle Position X").current_value.toFixed(4) + "," + readFromAppPointer("Vehicle Pointer", "Vehicle Position Y").current_value.toFixed(4) + "," + readFromAppPointer("Vehicle Pointer", "Vehicle Position Z").current_value.toFixed(4) + "!";
      //return "Successfully warped to " + readFromAppPointer("Vehicle Pointer", "Vehicle Position X").current_value.toFixed(4) + "," + readFromAppPointer("Vehicle Pointer", "Vehicle Position Y").current_value.toFixed(4) + "!";
    }
    return "Successfully warped to " + readFromAppPointer("Player Pointer", "Player Position X").current_value.toFixed(4) + "," + readFromAppPointer("Player Pointer", "Player Position Y").current_value.toFixed(4) + "," + readFromAppPointer("Player Pointer", "Player Position Z").current_value.toFixed(4) + "!";
    //return "Successfully warped to " + readFromAppPointer("Player Pointer", "Player Position X").current_value.toFixed(4) + "," + readFromAppPointer("Player Pointer", "Player Position Y").current_value.toFixed(4) + "!";
  }
  if (coordZ == undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    //writeToAppPointer("Player Pointer", "Player Speed X", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Y", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Z", 0);
    //writeToAppPointer("Player Pointer", "Player Heading", 0);

    writeToAppPointer("Player Pointer", "Player Position X", coordX);
    writeToAppPointer("Player Pointer", "Player Position Y", coordY);
    writeToAppPointer("Player Pointer", "Player Position Z", readFromAppPointer("Player Pointer", "Player Position Z").current_value + 10);

    //writeToAppPointer("Player Pointer", "Player Speed X", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Y", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Z", 0);
    //writeToAppPointer("Player Pointer", "Player Heading", 0);
    if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      // Set all speeds and rotations to 0 BEFORE warping
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", 0); // The 3 lines above are to make sure the car's speed is set to 0, so it doesn't go spinning like crazy
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD", 0); // The 6 rotation lines above are to make the car always face north
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", 0); // The 3 lines above are to make sure the car doesn't spin like crazy when warping

      writeToAppPointer("Vehicle Pointer", "Vehicle Position X", coordX);
      writeToAppPointer("Vehicle Pointer", "Vehicle Position Y", coordY);
      writeToAppPointer("Vehicle Pointer", "Vehicle Position Z", readFromAppPointer("Vehicle Pointer", "Vehicle Position Z").current_value + 10);

      // AND set all speeds and rotations to 0 AFTER warping, just to make sure, hopefully this will fix the thing where sometimes vehicles spin like crazy when warping
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", 0); // The 3 lines above are to make sure the car's speed is set to 0, so it doesn't go spinning like crazy
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD", 0); // The 6 rotation lines above are to make the car always face north
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", 0); // The 3 lines above are to make sure the car doesn't spin like crazy when warping
      return "Successfully warped to " + readFromAppPointer("Vehicle Pointer", "Vehicle Position X").current_value.toFixed(4) + "," + readFromAppPointer("Vehicle Pointer", "Vehicle Position Y").current_value.toFixed(4) + "," + readFromAppPointer("Vehicle Pointer", "Vehicle Position Z").current_value.toFixed(4) + "!";
      //return "Successfully warped to " + readFromAppPointer("Vehicle Pointer", "Vehicle Position X").current_value.toFixed(4) + "," + readFromAppPointer("Vehicle Pointer", "Vehicle Position Y").current_value.toFixed(4) + "!";
    }
    return "Successfully warped to " + readFromAppPointer("Player Pointer", "Player Position X").current_value.toFixed(4) + "," + readFromAppPointer("Player Pointer", "Player Position Y").current_value.toFixed(4) + "," + readFromAppPointer("Player Pointer", "Player Position Z").current_value.toFixed(4) + "!";
    //return "Successfully warped to " + readFromAppPointer("Player Pointer", "Player Position X").current_value.toFixed(4) + "," + readFromAppPointer("Player Pointer", "Player Position Y").current_value.toFixed(4) + "!";
  }
  if (coordZ != undefined) {
    //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
    //writeToAppPointer("Player Pointer", "Player Speed X", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Y", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Z", 0);
    //writeToAppPointer("Player Pointer", "Player Heading", 0);

    writeToAppPointer("Player Pointer", "Player Position X", coordX);
    writeToAppPointer("Player Pointer", "Player Position Y", coordY);
    writeToAppPointer("Player Pointer", "Player Position Z", coordZ);

    //writeToAppPointer("Player Pointer", "Player Speed X", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Y", 0);
    //writeToAppPointer("Player Pointer", "Player Speed Z", 0);
    //writeToAppPointer("Player Pointer", "Player Heading", 0);
    if (vehiclePointer > startPointerAddress && vehiclePointer < endPointerAddress) {
      //rewardsConfig.rewards[customRewardIndex].cooldown = new Date().getTime() + rewardsConfig.rewards[customRewardIndex].countdown;
      // Set all speeds and rotations to 0 BEFORE warping
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", 0); // The 3 lines above are to make sure the car's speed is set to 0, so it doesn't go spinning like crazy
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD", 0); // The 6 rotation lines above are to make the car always face north
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", 0); // The 3 lines above are to make sure the car doesn't spin like crazy when warping

      writeToAppPointer("Vehicle Pointer", "Vehicle Position X", coordX);
      writeToAppPointer("Vehicle Pointer", "Vehicle Position Y", coordY);
      writeToAppPointer("Vehicle Pointer", "Vehicle Position Z", coordZ);

      // AND set all speeds and rotations to 0 AFTER warping, just to make sure, hopefully this will fix the thing where sometimes vehicles spin like crazy when warping
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Speed Z", 0); // The 3 lines above are to make sure the car's speed is set to 0, so it doesn't go spinning like crazy
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt LR", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation EW 2", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation NS 2", 1);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Tilt UD", 0); // The 6 rotation lines above are to make the car always face north
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed X", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Y", 0);
      //writeToAppPointer("Vehicle Pointer", "Vehicle Rotation Speed Z", 0); // The 3 lines above are to make sure the car doesn't spin like crazy when warping
      return "Successfully warped to " + readFromAppPointer("Vehicle Pointer", "Vehicle Position X").current_value.toFixed(4) + "," + readFromAppPointer("Vehicle Pointer", "Vehicle Position Y").current_value.toFixed(4) + "," + readFromAppPointer("Vehicle Pointer", "Vehicle Position Z").current_value.toFixed(4) + "!";
    }
    return "Successfully warped to " + readFromAppPointer("Player Pointer", "Player Position X").current_value.toFixed(4) + "," + readFromAppPointer("Player Pointer", "Player Position Y").current_value.toFixed(4) + "," + readFromAppPointer("Player Pointer", "Player Position Z").current_value.toFixed(4) + "!";
  }
}

function processTextForNotificationBox(message) {
  let processedMessage = message;
  processedMessage = processedMessage.normalize("NFD").replace(/[\u007E-\uFFFF]+/ig, "");
  processedMessage = processedMessage.substring(0, 255);
  processedMessage = processedMessage.trim();
  processedMessage = processedMessage.replace(/\s+/ig, " ");
  processedMessage = processedMessage.replace(/[\u0000-\u001F]+/ig, "");
  processedMessage = processedMessage.replace(/[\u007E-\uFFFF]+/ig, "");
  for (let characterDataIndex = 0; characterDataIndex < characterData.length; characterDataIndex++) {
    if (characterData[characterDataIndex].is_enabled == true) {
      if (characterData[characterDataIndex].description != "Unused") {
        processedMessage = processedMessage.replace(characterData[characterDataIndex].character_original_string, characterData[characterDataIndex].character_replacement_string);
      }
    }
    if (controlCharacterData[characterDataIndex].is_enabled == true) {
      if (controlCharacterData[characterDataIndex].description != "Unused") {
        processedMessage = processedMessage.replace(controlCharacterData[characterDataIndex].character_original_string, controlCharacterData[characterDataIndex].character_replacement_string);
      }
    }
  }
  processedMessage = processedMessage.substring(0, 255);
  processedMessage = processedMessage.trim();
  return processedMessage;
}

function writeToNotificationBox(text) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  if (readFromAppMemory("Player Pointer").current_value <= startPointerAddress || readFromAppMemory("Player Pointer").current_value >= endPointerAddress) {
    //console.log("Don't do anything I guess");
    return "Game is not ready!";
  }
  text = text.substring(0, 255);
  text = text.trim();
  text = text.replace(/\s+/ig, " ");
  //text = text.replace(/[\u0000-\u001F]+/ig, "");
  //text = text.replace(/[\u007E-\uFFFF]+/ig, "");
  text = text.trim();
  text = text.substring(0, 255);
  text = text.trim();
  let textBuffer = Buffer.alloc(getMemoryDataSize("Notification Box 1"), 0);
  writeToAppBuffer("Notification Box 1", textBuffer);
  writeToAppBuffer("Notification Box 2", textBuffer);
  writeToAppBuffer("Notification Box 3", textBuffer); // I have to clear all notification boxes for the game to display repeat messages
  textBuffer.write(text, 0, getMemoryDataSize("Notification Box 1"), "utf16le");
  console.log(new Date().toISOString() + " [NOTIFBOX] " + text);
  return writeToAppBuffer("Notification Box 1", textBuffer);
}

function writeToAppPointerBuffer(pointerName, offsetName, buffer) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  // The code below is an unreadable mess
  let pointerIndex = gameMemory.memory_data.findIndex(element => element.address_name == pointerName);
  let offsetIndex = gameMemory.memory_data.findIndex(element => element.address_name == offsetName);
  if (pointerIndex == -1 || offsetIndex == -1) {
    return "Invalid pointer name or offset name";
  }
  if (gameMemory.memory_data[pointerIndex].pointer_type == "none" || gameMemory.memory_data[offsetIndex].offset_type == "none") {
    return "Pointer address provided is not a pointer or offset address provided is not an offset";
  }
  if (gameMemory.memory_data[offsetIndex].is_writeable == false) {
    gameMemory.memory_data[offsetIndex].current_value = "This offset is marked as Read Only";
    return gameMemory.memory_data[offsetIndex];
  }
  gameMemory.memory_data[pointerIndex].current_value = readFromCustomMemoryAddress(parseInt(gameMemory.memory_data[pointerIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), gameMemory.memory_data[pointerIndex].data_type, pointerIndex);
  if (gameMemory.memory_data[pointerIndex].current_value == 0) {
    gameMemory.memory_data[offsetIndex].memory_address = "0x0";
    gameMemory.memory_data[offsetIndex].current_value = -1;
    return gameMemory.memory_data[offsetIndex];
  }
  gameMemory.memory_data[offsetIndex].memory_address = "0x" + (parseInt(gameMemory.memory_data[offsetIndex].offset, 16) + gameMemory.memory_data[pointerIndex].current_value).toString(16);
  gameMemory.memory_data[offsetIndex].current_value = writeToCustomMemoryAddressBuffer(parseInt(gameMemory.memory_data[offsetIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), buffer, offsetIndex);
  return gameMemory.memory_data[offsetIndex];
}

function readFromAppPointerBuffer(pointerName, offsetName, size) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  // The code below is an unreadable mess
  let pointerIndex = gameMemory.memory_data.findIndex(element => element.address_name == pointerName);
  let offsetIndex = gameMemory.memory_data.findIndex(element => element.address_name == offsetName);
  if (pointerIndex == -1 || offsetIndex == -1) {
    return "Invalid pointer name or offset name";
  }
  if (gameMemory.memory_data[pointerIndex].pointer_type == "none" || gameMemory.memory_data[offsetIndex].offset_type == "none") {
    return "Pointer address provided is not a pointer or offset address provided is not an offset";
  }
  gameMemory.memory_data[pointerIndex].current_value = readFromCustomMemoryAddress(parseInt(gameMemory.memory_data[pointerIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), gameMemory.memory_data[pointerIndex].data_type, pointerIndex);
  if (gameMemory.memory_data[pointerIndex].current_value == 0) {
    gameMemory.memory_data[offsetIndex].memory_address = "0x0";
    gameMemory.memory_data[offsetIndex].current_value = -1;
    return gameMemory.memory_data[offsetIndex];
  }
  gameMemory.memory_data[offsetIndex].memory_address = "0x" + (parseInt(gameMemory.memory_data[offsetIndex].offset, 16) + gameMemory.memory_data[pointerIndex].current_value).toString(16);
  gameMemory.memory_data[offsetIndex].current_value = readFromCustomMemoryAddressBuffer(parseInt(gameMemory.memory_data[offsetIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), size, offsetIndex);
  return gameMemory.memory_data[offsetIndex];
}

function writeToAppBuffer(addressName, buffer) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  let memoryIndex = gameMemory.memory_data.findIndex(element => element.address_name == addressName);
  if (memoryIndex == -1) {
    return "Invalid memory name";
  }
  if (gameMemory.memory_data[memoryIndex].is_writeable == false) {
    gameMemory.memory_data[memoryIndex].current_value = "This address is marked as Read Only";
    return gameMemory.memory_data[memoryIndex];
  }
  gameMemory.memory_data[memoryIndex].current_value = writeToCustomMemoryAddressBuffer(parseInt(gameMemory.memory_data[memoryIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), buffer, memoryIndex);
  return gameMemory.memory_data[memoryIndex];
}

function readFromAppBuffer(addressName, size) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  let memoryIndex = gameMemory.memory_data.findIndex(element => element.address_name == addressName);
  if (memoryIndex == -1) {
    return "Invalid memory name";
  }
  gameMemory.memory_data[memoryIndex].current_value = readFromCustomMemoryAddressBuffer(parseInt(gameMemory.memory_data[memoryIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), size, memoryIndex);
  return gameMemory.memory_data[memoryIndex];
}

function writeToCustomMemoryAddressBuffer(address, offset, buffer, index) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  // Read and Write sync are faster than async by about 50000~60000 nanoseconds
  let valueChanged = false;
  if (index <= -1) {
    index = undefined;
  }
  if (index == undefined) {
    memoryjs.writeBuffer(processObject.handle, address + offset, buffer);
    return readFromCustomMemoryAddressBuffer(address, offset, buffer.byteLength, index);
  }
  memoryjs.writeBuffer(processObject.handle, address + offset, buffer);
  if (gameMemory.memory_data[index].current_value != gameMemory.memory_data[index].old_value) {
    //console.log(gameMemory.memory_data[index].current_value + " A " + gameMemory.memory_data[index].old_value);
    valueChanged = true;
  }
  gameMemory.memory_data[index].old_value = gameMemory.memory_data[index].current_value;
  return readFromCustomMemoryAddressBuffer(address, offset, buffer.byteLength, index); // Just doing this to make sure the memory was written correctly
}

function readFromCustomMemoryAddressBuffer(address, offset, size, index) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  // Read and Write sync are faster than async by about 50000~60000 nanoseconds
  let valueChanged = false;
  if (index <= -1) {
    index = undefined;
  }
  if (index == undefined) {
    return memoryjs.readBuffer(processObject.handle, address + offset, size);
  }
  if (gameMemory.memory_data[index].current_value != gameMemory.memory_data[index].old_value) {
    //console.log(gameMemory.memory_data[index].current_value + " B " + gameMemory.memory_data[index].old_value);
    valueChanged = true;
  }
  gameMemory.memory_data[index].old_value = gameMemory.memory_data[index].current_value;
  return memoryjs.readBuffer(processObject.handle, address + offset, size);
}

function writeToCustomMemoryAddress(address, offset, value, dataType, index) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  // Read and Write sync are faster than async by about 50000~60000 nanoseconds
  let valueChanged = false;
  if (index <= -1) {
    index = undefined;
  }
  if (index == undefined) {
    memoryjs.writeMemory(processObject.handle, address + offset, value, dataType);
    return readFromCustomMemoryAddress(address, offset, dataType, index);
  }
  memoryjs.writeMemory(processObject.handle, address + offset, value, dataType);
  if (gameMemory.memory_data[index].current_value != gameMemory.memory_data[index].old_value) {
    //console.log(gameMemory.memory_data[index].current_value + " A " + gameMemory.memory_data[index].old_value);
    valueChanged = true;
  }
  gameMemory.memory_data[index].old_value = gameMemory.memory_data[index].current_value;
  return readFromCustomMemoryAddress(address, offset, dataType, index); // Just doing this to make sure the memory was written correctly
}

function readFromCustomMemoryAddress(address, offset, dataType, index) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  // Read and Write sync are faster than async by about 50000~60000 nanoseconds
  let valueChanged = false;
  if (index <= -1) {
    index = undefined;
  }
  if (index == undefined) {
    return memoryjs.readMemory(processObject.handle, address + offset, dataType);
  }
  if (gameMemory.memory_data[index].current_value != gameMemory.memory_data[index].old_value) {
    //console.log(gameMemory.memory_data[index].current_value + " B " + gameMemory.memory_data[index].old_value);
    valueChanged = true;
  }
  gameMemory.memory_data[index].old_value = gameMemory.memory_data[index].current_value;
  return memoryjs.readMemory(processObject.handle, address + offset, dataType);
}

function writeToAppMemory(addressName, value) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  let memoryIndex = gameMemory.memory_data.findIndex(element => element.address_name == addressName);
  if (memoryIndex == -1) {
    return "Invalid memory name";
  }
  if (gameMemory.memory_data[memoryIndex].is_writeable == false) {
    gameMemory.memory_data[memoryIndex].current_value = "This address is marked as Read Only";
    return gameMemory.memory_data[memoryIndex];
  }
  gameMemory.memory_data[memoryIndex].current_value = writeToCustomMemoryAddress(parseInt(gameMemory.memory_data[memoryIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), value, gameMemory.memory_data[memoryIndex].data_type, memoryIndex);
  return gameMemory.memory_data[memoryIndex];
}

function readFromAppMemory(addressName) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  let memoryIndex = gameMemory.memory_data.findIndex(element => element.address_name == addressName);
  if (memoryIndex == -1) {
    return "Invalid memory name";
  }
  gameMemory.memory_data[memoryIndex].current_value = readFromCustomMemoryAddress(parseInt(gameMemory.memory_data[memoryIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), gameMemory.memory_data[memoryIndex].data_type, memoryIndex);
  return gameMemory.memory_data[memoryIndex];
}

function readFromAppPointer(pointerName, offsetName) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  // The code below is an unreadable mess
  let pointerIndex = gameMemory.memory_data.findIndex(element => element.address_name == pointerName);
  let offsetIndex = gameMemory.memory_data.findIndex(element => element.address_name == offsetName);
  if (pointerIndex == -1 || offsetIndex == -1) {
    return "Invalid pointer name or offset name";
  }
  if (gameMemory.memory_data[pointerIndex].pointer_type == "none" || gameMemory.memory_data[offsetIndex].offset_type == "none") {
    return "Pointer address provided is not a pointer or offset address provided is not an offset";
  }
  gameMemory.memory_data[pointerIndex].current_value = readFromCustomMemoryAddress(parseInt(gameMemory.memory_data[pointerIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), gameMemory.memory_data[pointerIndex].data_type, pointerIndex);
  if (gameMemory.memory_data[pointerIndex].current_value == 0) {
    gameMemory.memory_data[offsetIndex].memory_address = "0x0";
    gameMemory.memory_data[offsetIndex].current_value = -1;
    return gameMemory.memory_data[offsetIndex];
  }
  gameMemory.memory_data[offsetIndex].memory_address = "0x" + (parseInt(gameMemory.memory_data[offsetIndex].offset, 16) + gameMemory.memory_data[pointerIndex].current_value).toString(16);
  gameMemory.memory_data[offsetIndex].current_value = readFromCustomMemoryAddress(parseInt(gameMemory.memory_data[offsetIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), gameMemory.memory_data[offsetIndex].data_type, offsetIndex);
  return gameMemory.memory_data[offsetIndex];
}

function writeToAppPointer(pointerName, offsetName, value) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  // The code below is an unreadable mess
  let pointerIndex = gameMemory.memory_data.findIndex(element => element.address_name == pointerName);
  let offsetIndex = gameMemory.memory_data.findIndex(element => element.address_name == offsetName);
  if (pointerIndex == -1 || offsetIndex == -1) {
    return "Invalid pointer name or offset name";
  }
  if (gameMemory.memory_data[pointerIndex].pointer_type == "none" || gameMemory.memory_data[offsetIndex].offset_type == "none") {
    return "Pointer address provided is not a pointer or offset address provided is not an offset";
  }
  if (gameMemory.memory_data[offsetIndex].is_writeable == false) {
    gameMemory.memory_data[offsetIndex].current_value = "This offset is marked as Read Only";
    return gameMemory.memory_data[offsetIndex];
  }
  gameMemory.memory_data[pointerIndex].current_value = readFromCustomMemoryAddress(parseInt(gameMemory.memory_data[pointerIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), gameMemory.memory_data[pointerIndex].data_type, pointerIndex);
  if (gameMemory.memory_data[pointerIndex].current_value == 0) {
    gameMemory.memory_data[offsetIndex].memory_address = "0x0";
    gameMemory.memory_data[offsetIndex].current_value = -1;
    return gameMemory.memory_data[offsetIndex];
  }
  gameMemory.memory_data[offsetIndex].memory_address = "0x" + (parseInt(gameMemory.memory_data[offsetIndex].offset, 16) + gameMemory.memory_data[pointerIndex].current_value).toString(16);
  gameMemory.memory_data[offsetIndex].current_value = writeToCustomMemoryAddress(parseInt(gameMemory.memory_data[offsetIndex].memory_address, 16), parseInt(gameMemory.base_address, 16), value, gameMemory.memory_data[offsetIndex].data_type, offsetIndex);
  return gameMemory.memory_data[offsetIndex];
}

function getMemoryDataSize(addressName) {
  if (processObject == undefined) {
    return "Game is not running!";
  }
  let memoryIndex = gameMemory.memory_data.findIndex(element => element.address_name == addressName);
  if (memoryIndex == -1) {
    return "Invalid memory name";
  }
  return gameMemory.memory_data[memoryIndex].size;
}

var server = http.createServer(handleRequest);
server.listen(8080);

console.log("Server started on port " + 8080);

function handleRequest(req, res) {
  // What did we request?
  var pathname = req.url;

  // If blank let's ask for index.html
  if (pathname == '/') {
    pathname = '/index.html';
  }

  // Ok what's our file extension
  var ext = path.extname(pathname);

  // Map extension to file type
  var typeExt = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".ttf": "font/ttf",
    ".ico": "image/vnd.microsoft.icon",
    ".mp3": "audio/mpeg",
    ".png": "image/png",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg"
  };

  // What is it?  Default to plain text
  var contentType = typeExt[ext] || "text/plain";

  // User file system module
  fs.readFile(__dirname + pathname,
    // Callback function for reading
    function(err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200, {
        'Content-Type': contentType
      });
      res.end(data);
    }
  );
}


// WebSocket Portion
// WebSockets work with the HTTP server
//var io = require("socket.io").listen(server);
var io = require("socket.io")(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function(socket) {

    console.log("We have a new client: " + socket.id);
    if (processObject == undefined) {
      console.log("Client connected, app NOT running");
      gameMemoryToDisplay = [];
      gameMemoryToOverride = [];
      io.to(socket.id).emit("game_memory_to_display", gameMemoryToDisplay);
    }
    if (processObject != undefined) {
      console.log("Client connected, app running");
      gameMemory = JSON.parse(fs.readFileSync(gameMemoryConfigFileName, "utf8"));
      rewardsConfig = JSON.parse(fs.readFileSync(rewardsConfigFileName, "utf8"));
      overlayFilesList = fs.readdirSync(__dirname + "//" + "overlay");
      overlayMp3FilesOnly = overlayFilesList.filter(file => path.extname(file).toLowerCase() === mp3FileExtension);
      overlayMp3FilesOnly = overlayMp3FilesOnly.filter(file => file.toLowerCase() !== beybladeSfxFileName);
      findNewPcsx2BaseAddress();
      gameMemoryToDisplay = [];
      gameMemoryToOverride = [];
      for (let gameMemoryObjectIndex = 0; gameMemoryObjectIndex < gameMemory.memory_data.length; gameMemoryObjectIndex++) {
        if (gameMemory.memory_data[gameMemoryObjectIndex].to_override == true) {
          gameMemoryToOverride.push(gameMemory.memory_data[gameMemoryObjectIndex]);
        }
        if (gameMemory.memory_data[gameMemoryObjectIndex].to_display == true) {
          //console.log(gameMemory.memory_data[gameMemoryObjectIndex]);
          gameMemoryToDisplay.push(gameMemory.memory_data[gameMemoryObjectIndex]);
        }
      }
      let mp3FilesListObject = {
        mp3_files_list: overlayMp3FilesOnly,
        beyblade_filename: beybladeSfxFileName
      };
      //console.log(mp3FilesListObject);
      //console.log(gameMemoryToDisplay);
      io.to(socket.id).emit("mp3_files_list_object", mp3FilesListObject);
      io.to(socket.id).emit("game_memory_to_display", gameMemoryToDisplay);
    }
    socket.on('disconnect', function() {
      console.log("Client has disconnected: " + socket.id);
    });
  }
);