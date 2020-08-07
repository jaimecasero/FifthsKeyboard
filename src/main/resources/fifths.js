//model
var dominantMajorDeltaMap = [7,7,7,7,6,8,7,7];
var dominantMinorDeltaMap = [7,7,7,7,6,8,7,7];
var subdominantMajorDeltaMap = [4,4,2,5,3,4,4,4];
var subdominantMinorDeltaMap = [3,3,1,4,2,3,3,3];
var forthChordNoteIntervalMap = [0,0,0,0,0,0,11,14];


var CKey=['C','Dm','Em','F','G','Am','Bm'];
var CSharpKey=['C#','D#m','Fm','F#','G#','A#m','Cm'];
var keys=[CKey,CSharpKey];

var noteMajorLabel=['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
var noteMajorCode=[12,19,14,21,16,23,18,13,20,15,22,17];
var noteMajorCircleX=[248,357,433,461,430,357,247,135,71,38,64,142];
var noteMajorCircleY=[29,63,146,249,359,437,464,432,364,256,148,67];
var noteMajorCircleRadius=35;


var noteMinorLabel=['Am','Em','Bm','F#m','C#m','G#m','D#m','A#m','Fm','Cm','Gm','Dm'];
var noteMinorCode=[21,16,23,18,13,20,15,22,17,12,19,14];
var noteMinorCircleX=[248,323,373,391,365,325,250,174,127,101,128,181];
var noteMinorCircleY=[112,125,176,255,323,377,397,369,325,243,176,130];
var noteMinorCircleRadius=35;

var noteLabel=[noteMajorLabel, noteMinorLabel];
var noteCode=[noteMajorCode, noteMinorCode];
var noteCircleX=[noteMajorCircleX, noteMinorCircleX];
var noteCircleY=[noteMajorCircleY, noteMinorCircleY];
var noteCircleRadius=[noteMajorCircleRadius, noteMinorCircleRadius];



var disabledNoteColor='grey';
var tonicColor='blue';
var dominantColor='green';
var subdominantColor='yellow';
var forthColor='salmon';
var keyLineColor='orange';
var noteColor=[tonicColor,subdominantColor,dominantColor,forthColor];

// create web audio api context
var audioCtx = new (window.AudioContext || window.webkitAudioContext);
var gainNode = audioCtx.createGain();
gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
gainNode.connect(audioCtx.destination);

// create Oscillators node, one oscillator for each possible 4 notes in a chord
var oscillatorArray = [];
oscillatorArray[0] = audioCtx.createOscillator();
oscillatorArray[0].type = 'square';
oscillatorArray[0].frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
oscillatorArray[0].start();

oscillatorArray[1] = audioCtx.createOscillator();
oscillatorArray[1].type = 'square';
oscillatorArray[1].frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
oscillatorArray[1].start();

oscillatorArray[2] = audioCtx.createOscillator();
oscillatorArray[2].type = 'square';
oscillatorArray[2].frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
oscillatorArray[2].start();

oscillatorArray[3] = audioCtx.createOscillator();
oscillatorArray[3].type = 'square';
oscillatorArray[3].frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
oscillatorArray[3].start();




(function(window, document, undefined){
window.onload = init;

  function init(){
    // the code to be called when the dom has loaded
    // #document has its nodes
	//register multitouch listener
	console.log("init");
	document.getElementById('circleCanvas').addEventListener('touchstart', function(event) {
		  event.preventDefault();
		  audioCtx.resume();
		  for (var i = 0; i < event.changedTouches.length; i++) {
		    var touch = event.changedTouches[i];
		    	var rect = document.getElementById('circleCanvas').getBoundingClientRect();
                var x = touch.clientX - rect.left;
                var y = touch.clientY - rect.top;
            	console.log("touchstart.x", x, ",y:" + y);
                canvasDownXY(x, y);
		  }
	}, false);
	document.getElementById('circleCanvas').addEventListener('touchend', function(event) {
	      event.preventDefault();
		  for (var i = 0; i < event.changedTouches.length; i++) {
		    var touch = event.changedTouches[i];
		    	var rect = document.getElementById('circleCanvas').getBoundingClientRect();
                var x = touch.clientX - rect.left;
                var y = touch.clientY - rect.top;
		    	console.log("touchend.x", x, ",y:" + y);
                canvasUpXY(x,y);
		  }
	}, false);

	renderCircle();
	document.addEventListener("keydown",keyDownHandler, false);	
	document.addEventListener("keyup",keyUpHandler, false);
	changeNoteLabelColor();
	clearNoteLabels();
	changeKey();
  }

})(window, document, undefined);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
}


function changeNoteLabelColor() {
	for (var i = 0; i < noteColor.length; i++) {
	        document.getElementById('noteText' + i).style.backgroundColor = noteColor[i];
	}
}

function clearNoteLabels() {
	for (var i = 0; i < noteColor.length; i++) {
	        document.getElementById('noteText' + i).value= "";
	}
}

function keyDownHandler(event) {
	var keyPressed = String.fromCharCode(event.keyCode);
        if (event.keyCode >= 48 && event.keyCode <= 57) {
		document.getElementById("octaveSelect").selectedIndex = keyPressed;
	}
}

function keyUpHandler(event) {
}

function changeKey(){
    var selectedKey = document.getElementById('keySelect').value;
    var keyFormation = keys[selectedKey];
    console.log("selectedKey:"+ keyFormation);
	var c = document.getElementById("circleCanvas");
	var ctx = c.getContext("2d");
	var tonicIndex = noteMajorLabel.findIndex((element) => element === keyFormation[0]);
	for (var i=1; i < keyFormation.length; i++)
    {
        ctx.beginPath();
        ctx.strokeStyle=keyLineColor;
        ctx.moveTo(noteMajorCircleX[tonicIndex], noteMajorCircleY[tonicIndex]);

        if (keyFormation[i].includes("m")){
            var nextNoteIndex = noteMinorLabel.findIndex((element) => element === keyFormation[i]);
            ctx.lineTo(noteMinorCircleX[nextNoteIndex], noteMinorCircleY[nextNoteIndex]);

        } else {
            var nextNoteIndex = noteMajorLabel.findIndex((element) => element === keyFormation[i]);
            ctx.lineTo(noteMajorCircleX[nextNoteIndex], noteMajorCircleY[nextNoteIndex]);
        }
        ctx.stroke();
    }
    ctx.strokeStyle='black';
}


function intersects(x,y, cx, cy, r) {
    var dx = x - cx;
    var dy = y - cy;
    return dx*dx+dy*dy <= r*r;
}

function canvasDown(e){
   audioCtx.resume();
   canvasDownXY(e.offsetX, e.offsetY);
}

function canvasDownXY(x,y){
   console.log("down:" + x + "," + y);
   for(var i = 0; i < noteCode.length; i++) {
      for (var j = 0; j < noteCode[i].length; j++) {
	      if (intersects(x,y,noteCircleX[i][j],noteCircleY[i][j],noteCircleRadius[i])) {
		    down(noteCode[i][j], i);
		    break;
	      }
      }
   }
}

function canvasUp(e) {
	canvasUpXY(e.offsetX, e.offsetY);
}
function canvasUpXY(x,y) {
   for(var i = 0; i < noteCode.length; i++) {
      for (var j = 0; j < noteCode[i].length; j++) {
	      if (intersects(x,y,noteCircleX[i][j],noteCircleY[i][j],noteCircleRadius[i])) {
		    up(noteCode[i][j], i);
		    break;
	      }
      }
   }
}

function renderCircle() {
	var c = document.getElementById("circleCanvas");
	var ctx = c.getContext("2d");

	//draw outer and inner circles
	ctx.beginPath();
	ctx.arc(c.width/2, c.height/2, c.width/2, 0, 2 * Math.PI);
	ctx.stroke(); 
	ctx.beginPath();
	ctx.arc(c.width/2, c.height/2, c.width/2/4*3, 0, 2 * Math.PI);
	ctx.stroke();

    var thirdDivisionDelta = (c.width/2 * 2 * 3.14)/4/3/2;
    var point1 = c.width - thirdDivisionDelta;
    var point2 = c.width + thirdDivisionDelta;

	//draw the note dividers
	ctx.beginPath();
	ctx.moveTo(180, 0);
	ctx.lineTo(320, c.width);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(320, 0);
	ctx.lineTo(180, c.width);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0, 180);
	ctx.lineTo(c.width, 320);
	ctx.stroke();
 
	ctx.beginPath();
	ctx.moveTo(0, 320);
	ctx.lineTo(c.width, 180);
	ctx.stroke(); 

	ctx.beginPath();
	ctx.moveTo(c.width, c.width);
	ctx.lineTo(0, 0);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(c.width, 0);
	ctx.lineTo(0, c.width);
	ctx.stroke();

	//draw notes
	for(var i = 0; i < noteCode.length; i++) {
           for(var j = 0; j < noteCode[i].length; j++) {
              drawNoteIndex(j,i, disabledNoteColor);
	   }
	}
}


function freq (midi) {
	tuning = 440;
	return midi === 0 || (midi > 0 && midi < 128) ? Math.pow(2, (midi - 69) / 12) * tuning : null
}

function findNoteIndex(midiNote, ringLevel) {
   var normalizedMidiNote = midiNote;
   if (midiNote > 23) {
        //we work assuming octave is 1, this note went beyond this, so we need normalization
	normalizedMidiNote = midiNote - 12;//down tune note one octave
	console.log("Normalized Note:" + midiNote + "," + normalizedMidiNote);
   }
   return noteCode[ringLevel].findIndex((element) => element === normalizedMidiNote);
}


function drawNoteWithRing(midiNote, ringLevel, color,chordNoteIndex) {
	if(ringLevel== 0){
		var noteMinorIndex = findNoteIndex(midiNote,1);
		var noteIndex = findNoteIndex(midiNote,ringLevel);
		document.getElementById('noteText' + chordNoteIndex).value= noteLabel[ringLevel][noteIndex];
		console.log("noteIndex:" + noteIndex);
		drawNoteIndex(noteIndex,ringLevel,color);
		var counterPartColor = "light"+color;
		if (color === disabledNoteColor){
		   counterPartColor = disabledNoteColor;
		}
		drawNoteIndex(noteMinorIndex, 1, counterPartColor);
	} else {
		var noteMinorIndex = findNoteIndex(midiNote,ringLevel);
		var noteIndex = findNoteIndex(midiNote,0);
		document.getElementById('noteText' + chordNoteIndex).value= noteLabel[ringLevel][noteIndex];
		console.log("noteIndex:" + noteIndex);
		drawNoteIndex(noteMinorIndex,ringLevel,color);
		var counterPartColor = "light"+color;
		if (color === disabledNoteColor){
		   counterPartColor = disabledNoteColor;
		}
		drawNoteIndex(noteIndex,0,counterPartColor);
	}
}


function drawNoteIndex(noteIndex,ringLevel, style) {
	var c = document.getElementById("circleCanvas");
	var ctx = c.getContext("2d");

	ctx.beginPath();
	ctx.fillStyle=style;
	ctx.arc(noteCircleX[ringLevel][noteIndex],noteCircleY[ringLevel][noteIndex],noteCircleRadius[ringLevel], 0, 2 * Math.PI);
	ctx.fill(); 
	ctx.stroke();

	ctx.fillStyle='black';
	ctx.font = "25px Arial";
	//make coordinate correction so text is centered in the circle
	ctx.fillText(noteLabel[ringLevel][noteIndex], noteCircleX[ringLevel][noteIndex]- 20,noteCircleY[ringLevel][noteIndex]+10); 

	
}


function down(midiNote, ringLevel) {
  console.log("midiNote:" + midiNote);
  console.log("freqMidi:" + freq(midiNote));

  clearNoteLabels();

  var chordModeVal = document.getElementById('chordModeSelect').value;
  console.log ("chordMode:"+ chordModeVal);
  var octaveSelectVal = document.getElementById('octaveSelect').value;
  console.log("octave:" + octaveSelectVal);

  var tonicFreq = freq(midiNote) * Math.pow(2,octaveSelectVal);
  console.log("tonicFreq:" + tonicFreq);
  oscillatorArray[0].frequency.setValueAtTime(tonicFreq,          audioCtx.currentTime); // value in hertz
  oscillatorArray[0].connect(gainNode);
  drawNoteWithRing(midiNote,ringLevel, tonicColor,0);




  if (chordModeVal > 0) {
	var dominantDelta=0;
	if(ringLevel== 0){
	   dominantDelta = dominantMajorDeltaMap[chordModeVal];//this is the same for major and minor chords
	} else {
	   dominantDelta = dominantMinorDeltaMap[chordModeVal];//this is the same for major and minor chords
	}
	drawNoteWithRing(midiNote + dominantDelta,ringLevel,dominantColor,2);
	var dominantFreq = freq(midiNote + dominantDelta) * Math.pow(2,octaveSelectVal);
	console.log("dominantFreq:" + dominantFreq);
	oscillatorArray[1].frequency.setValueAtTime(dominantFreq,          audioCtx.currentTime); // value in hertz


	var subdominantDelta=0;
	if(ringLevel== 0){
		subdominantDelta = subdominantMajorDeltaMap[chordModeVal];//this is the same for major and minor chords
	} else {
		subdominantDelta = subdominantMinorDeltaMap[chordModeVal];//this is the same for major and minor chords
	}
	drawNoteWithRing(midiNote + subdominantDelta,ringLevel,subdominantColor,1);
	var subdominantFreq = freq(midiNote + subdominantDelta) * Math.pow(2,octaveSelectVal);
	console.log("subdominantFreq:" + subdominantFreq);
	oscillatorArray[2].frequency.setValueAtTime(subdominantFreq,          audioCtx.currentTime); // value in hertz

	oscillatorArray[1].connect(gainNode);
	oscillatorArray[2].connect(gainNode);
  }
  if (chordModeVal > 5) {
	var forthDelta=forthChordNoteIntervalMap[chordModeVal];
	var forthFreq = freq(midiNote + forthDelta) * Math.pow(2,octaveSelectVal);
	console.log("forthFreq:" + forthFreq);
	oscillatorArray[3].frequency.setValueAtTime(forthFreq,          audioCtx.currentTime); // value in hertz
	drawNoteWithRing(midiNote + forthDelta,ringLevel,forthColor,3);
	oscillatorArray[3].connect(gainNode);
  }
}

function up(midiNote, ringLevel) {
  var chordModeVal = document.getElementById('chordModeSelect').value;

  console.log("UP.midiNote:" + midiNote);
  drawNoteWithRing(midiNote,ringLevel, disabledNoteColor,0);
  oscillatorArray[0].disconnect(gainNode);

  if (chordModeVal > 0) {
	oscillatorArray[1].disconnect(gainNode);
	var dominantDelta=0;
	if(ringLevel== 0){
		dominantDelta = dominantMajorDeltaMap[chordModeVal];
	} else {
		dominantDelta = dominantMinorDeltaMap[chordModeVal];
	}
	drawNoteWithRing(midiNote + dominantDelta,ringLevel,disabledNoteColor,2);


	var subdominantDelta=0;
	if(ringLevel== 0){
		subdominantDelta = subdominantMajorDeltaMap[chordModeVal];
	} else {
		subdominantDelta = subdominantMinorDeltaMap[chordModeVal];
	}
	drawNoteWithRing(midiNote + subdominantDelta,ringLevel,disabledNoteColor,1);
	oscillatorArray[2].disconnect(gainNode);
  }
  if (chordModeVal > 5) {
    oscillatorArray[3].disconnect(gainNode);
    var forthDelta=forthChordNoteIntervalMap[chordModeVal];
    drawNoteWithRing(midiNote + forthDelta,ringLevel,disabledNoteColor,3);
  }

}

