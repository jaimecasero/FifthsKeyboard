//model
const NUM_NOTES=12;
const NOTE_PRESS_GAIN = 0.1;//the gain applied when note is pressed
const NOTE_PRESS_SUSTAIN = 2;//number of seconds the note will be sustained

const dominantMajorDeltaMap = [7,7,7,7,6,8,7,7];
const dominantMinorDeltaMap = [7,7,7,7,6,8,7,7];
const subdominantMajorDeltaMap = [4,4,2,5,3,4,4,4];
const subdominantMinorDeltaMap = [3,3,1,4,2,3,3,3];
const forthChordNoteIntervalMap = [0,0,0,0,0,0,11,14];


const noteMajorLabel=['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
const noteMajorCode=[12,19,14,21,16,23,18,13,20,15,22,17];
const noteMajorCircleRadius=25;


const noteMinorLabel=['Am','Em','Bm','F#m','C#m','G#m','D#m','A#m','Fm','Cm','Gm','Dm'];
const noteMinorCode=[21,16,23,18,13,20,15,22,17,12,19,14];
const noteMinorCircleRadius=25;
const noteMinorPositionDelta=30;

const noteLabel=[noteMajorLabel, noteMinorLabel];
const noteCode=[noteMajorCode, noteMinorCode];
const noteCircleRadius=[noteMajorCircleRadius, noteMinorCircleRadius];



const disabledNoteColor='grey';
const tonicColor='blue';
const dominantColor='green';
const subdominantColor='yellow';
const forthColor='salmon';
const keyLineColor='orange';
var noteColor=[tonicColor,subdominantColor,dominantColor,forthColor];

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext);


// create Oscillators node,
const oscillatorArray = [];
const gainArray = [];
function initOscillators() {
    //one oscillator for each possible 4 notes in a chord
    for (var i=0; i< 4 ; i++){
        oscillatorArray[i] = audioCtx.createOscillator();
        oscillatorArray[i].type = 'triangle';
        oscillatorArray[i].frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
        oscillatorArray[i].start();
        gainArray[i] = audioCtx.createGain();
        gainArray[i].gain.setValueAtTime(0.0001, audioCtx.currentTime);
        gainArray[i].connect(audioCtx.destination);
        oscillatorArray[i].connect(gainArray[i]);
    }
}



(function(window, document, undefined){
window.onload = init;

  function init(){
    // the code to be called when the dom has loaded
    // #document has its nodes
	console.log("init");
	initOscillators();
	//register multitouch listener
	document.getElementById('circleCanvas').addEventListener('touchstart', function(event) {
		  event.preventDefault();
		  audioCtx.resume();
		  for (var i = 0; i < event.changedTouches.length; i++) {
		    var touch = event.changedTouches[i];
		    	var rect = document.getElementById('circleCanvas').getBoundingClientRect();
		    	//transpose touch coordinates to canvas
                var x = touch.clientX - rect.left;
                var y = touch.clientY - rect.top;
            	console.log("touchstart.x", x, ",y:" + y + ",force:" + touch.force);
            	var force = 1.0;
            	if (touch.force > 0) {
            	   force = touch.force;
            	}
                canvasDownXY(x, y, force);
		  }
	}, false);
	document.getElementById('circleCanvas').addEventListener('touchend', function(event) {
	      event.preventDefault();
		  for (var i = 0; i < event.changedTouches.length; i++) {
		    var touch = event.changedTouches[i];
		    	var rect = document.getElementById('circleCanvas').getBoundingClientRect();
		    	//transpose touch coordinates to canvas
                var x = touch.clientX - rect.left;
                var y = touch.clientY - rect.top;
		    	console.log("touchend.x", x, ",y:" + y);
                canvasUpXY(x,y);
		  }
	}, false);

    //register key handlers
	document.addEventListener("keydown",keyDownHandler, false);
	document.addEventListener("keyup",keyUpHandler, false);

	changeKey();
	renderCircle();
	clearNoteLabels();

	var nColor = [];
	for (var i = 0;i<4;i++){
    var tColor = window.getComputedStyle(document.getElementById("noteText" + i),null).getPropertyValue("background-color");
    nColor.push(tColor);
    }
    console.log("ncolor:" + nColor);
    noteColor=nColor;
  }

})(window, document, undefined);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
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


function generateKeyArray(noteIndex) {
    var key = [];
    //calculate the 7 notes in the key based on intervals 1,2,3,4,5,11
    key[0] = noteMajorLabel[noteIndex];
    key[1] = noteMajorLabel[(noteIndex + 1) % NUM_NOTES];
    //add 'm' for minor chords
    key[2] = noteMajorLabel[(noteIndex + 2) % NUM_NOTES] + 'm';
    key[3] = noteMajorLabel[(noteIndex + 3) % NUM_NOTES] + 'm';
    key[4] = noteMajorLabel[(noteIndex + 4) % NUM_NOTES] + 'm';
    key[5] = noteMajorLabel[(noteIndex + 5) % NUM_NOTES] + 'm';
    key[6] = noteMajorLabel[(noteIndex + 11) % NUM_NOTES];
    return key;
}

function calculateNoteCenter(noteIndex, radius) {
	var canvas = document.getElementById("circleCanvas");
	//calculate note position based on angle
   //divide by 12, the possible notes based on noteindex[0,11]
   //use PI/2*3 to translate to canvas coordinates, where +y goes down
   var noteAngle = ((((2 * Math.PI) / NUM_NOTES) * noteIndex)  + Math.PI/2*3);
   //noteAngle= noteAngle / (noteAngle % Math.PI);
   //apply polar coordinates to calculate note position in the ring
   //add the canvas half to move the circle center in the center of canvas
   var x = radius * Math.cos(noteAngle) + (canvas.width/2);
   var y = radius * Math.sin(noteAngle) + (canvas.width/2);
   return {x,y};
}

function majorNoteRadius() {
    var canvas = document.getElementById("circleCanvas");
    return canvas.width/2 - ((canvas.width/2-innerRingRadius(canvas.width))/2);
}

function changeKey(){
    var selectedKey = document.getElementById('keySelect').value;
	var canvas = document.getElementById("circleCanvas");
	var ctx = canvas.getContext("2d");
	//clear all canvas to remove previous key lines
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var tonicIndex = noteMajorLabel.findIndex((element) => element === selectedKey);
    var keyFormation = generateKeyArray(tonicIndex);
    console.log("selectedKey:"+ keyFormation);
    ctx.strokeStyle=keyLineColor;
    var tonicPoint = calculateNoteCenter(tonicIndex, majorNoteRadius());
	for (var i=1; i < keyFormation.length; i++)
    {
        ctx.beginPath();
        ctx.moveTo(tonicPoint.x, tonicPoint.y);
        if (keyFormation[i].includes("m")){
            var nextNoteIndex = noteMinorLabel.findIndex((element) => element === keyFormation[i]);
            var nextMinorNotePoint = calculateNoteCenter(nextNoteIndex,innerRingRadius(canvas.width)-noteMinorPositionDelta);
            ctx.lineTo(nextMinorNotePoint.x, nextMinorNotePoint.y);

        } else {
            var nextNoteIndex = noteMajorLabel.findIndex((element) => element === keyFormation[i]);
            var nextMajorNotePoint = calculateNoteCenter(nextNoteIndex, majorNoteRadius());
            ctx.lineTo(nextMajorNotePoint.x, nextMajorNotePoint.y);

        }
        ctx.stroke();
    }
    //revert back stroke style
    ctx.strokeStyle='black';
    //draw all circle again
    renderCircle();
}





function intersects(x,y, cx, cy, r) {
    var dx = x - cx;
    var dy = y - cy;
    return dx*dx+dy*dy <= r*r;
}

function canvasDown(e){
   audioCtx.resume();
   canvasDownXY(e.offsetX, e.offsetY, 1.0);
}

function canvasDownXY(x,y, force){
   console.log("down:" + x + "," + y);
   var canvas = document.getElementById("circleCanvas");
   for(var i = 0; i < noteCode.length; i++) {
      for (var j = 0; j < noteCode[i].length; j++) {
          var noteCenterPoint = calculateNoteCenter(j, majorNoteRadius());
          if (i > 0 ) {
            noteCenterPoint = calculateNoteCenter(j, innerRingRadius(canvas.width) - noteMinorPositionDelta);
          }
	      if (intersects(x,y,noteCenterPoint.x,noteCenterPoint.y,noteCircleRadius[i])) {
		    down(noteCode[i][j], i, force);
		    break;
	      }
      }
   }
}

function canvasUp(e) {
	canvasUpXY(e.offsetX, e.offsetY);
}
function canvasUpXY(x,y) {
   var canvas = document.getElementById("circleCanvas");
   for(var i = 0; i < noteCode.length; i++) {
      for (var j = 0; j < noteCode[i].length; j++) {
          var noteCenterPoint = calculateNoteCenter(j, majorNoteRadius());
          if (i > 0 ) {
            noteCenterPoint = calculateNoteCenter(j, innerRingRadius(canvas.width) - noteMinorPositionDelta);
          }
	      if (intersects(x,y,noteCenterPoint.x,noteCenterPoint.y,noteCircleRadius[i])) {
		    up(noteCode[i][j], i);
		    break;
	      }
      }
   }
}


function innerRingRadius(canvasWidth) {
	//inner ring at 3/4 of total radius
    return canvasWidth/2/4*3;
}

function renderCircle() {
	var canvas = document.getElementById("circleCanvas");
	var ctx = canvas.getContext("2d");

	//draw outer and inner circles
	ctx.beginPath();
	ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, 2 * Math.PI);
	ctx.stroke(); 
	ctx.beginPath();

	ctx.arc(canvas.width/2, canvas.height/2, innerRingRadius(canvas.width), 0, 2 * Math.PI);
	ctx.stroke();

	//dividers needs to split the quarter of the whole circumference in three.
	//calculate circumference. divide by 4 parts
	//divide by 3 to get the 2 lines per quarter
	//divide by 2 to calculate delta from square center
    var thirdDivisionDelta = (canvas.width * 3.14)/4/3/2;
    console.log("divDelta:" + thirdDivisionDelta);
    //apply delta to the square center
    var point1 = canvas.width/2 - thirdDivisionDelta;
    var point2 = canvas.width/2 + thirdDivisionDelta;
    console.log("point1:" + point1);
	//draw the note dividers
	ctx.beginPath();
	ctx.moveTo(point1, 0);
	ctx.lineTo(point2, canvas.width);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(point2, 0);
	ctx.lineTo(point1, canvas.width);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0, point1);
	ctx.lineTo(canvas.width, point2);
	ctx.stroke();
 
	ctx.beginPath();
	ctx.moveTo(0, point2);
	ctx.lineTo(canvas.width, point1);
	ctx.stroke(); 

	ctx.beginPath();
	ctx.moveTo(canvas.width, canvas.width);
	ctx.lineTo(0, 0);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(canvas.width, 0);
	ctx.lineTo(0, canvas.width);
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
	normalizedMidiNote = midiNote - NUM_NOTES;//down tune note one octave
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
		drawNoteIndex(noteMinorIndex, 1, color);
	} else {
		var noteMinorIndex = findNoteIndex(midiNote,ringLevel);
		var noteIndex = findNoteIndex(midiNote,0);
		document.getElementById('noteText' + chordNoteIndex).value= noteLabel[ringLevel][noteIndex];
		console.log("noteIndex:" + noteIndex);
		drawNoteIndex(noteMinorIndex,ringLevel,color);
		drawNoteIndex(noteIndex,0,color);
	}
}


function drawNoteIndex(noteIndex,ringLevel, style) {
	var canvas = document.getElementById("circleCanvas");
	var ctx = canvas.getContext("2d");
    var noteCenterPoint;
    if (ringLevel == 0 ) {
        noteCenterPoint = calculateNoteCenter(noteIndex, majorNoteRadius());
    } else {
        noteCenterPoint = calculateNoteCenter(noteIndex, innerRingRadius(canvas.width) - noteMinorPositionDelta);
    }
	ctx.beginPath();
	ctx.fillStyle=style;
	ctx.arc(noteCenterPoint.x,noteCenterPoint.y,noteCircleRadius[ringLevel], 0, 2 * Math.PI);
	ctx.fill(); 
	ctx.stroke();

	ctx.fillStyle='black';
	ctx.font = "25px Arial";
	//make coordinate correction so text is centered in the circle
	ctx.fillText(noteLabel[ringLevel][noteIndex], noteCenterPoint.x- 20,noteCenterPoint.y+10);

	
}


function down(midiNote, ringLevel, force) {
  console.log("midiNote:" + midiNote);
  console.log("freqMidi:" + freq(midiNote));

  clearNoteLabels();

  var chordModeVal = document.getElementById('chordModeSelect').value;
  console.log ("chordMode:"+ chordModeVal);
  var octaveSelectVal = document.getElementById('octaveSelect').value;
  console.log("octave:" + octaveSelectVal);

  var midiNoteDelta = 0;
  for (var i = 0; i < 4 ; i++) {
      //calculate note delta depending on ringlevel
      midiNoteDelta = calculateNoteDelta(midiNote, ringLevel,chordModeVal, i);
      var adjustedMidiNote = midiNote + midiNoteDelta;
      var noteFreq = freq(adjustedMidiNote) * Math.pow(2,octaveSelectVal);
      console.log("biteFreq" + i + ":" + noteFreq);
      oscillatorArray[0].frequency.setValueAtTime(noteFreq, audioCtx.currentTime); // value in hertz
      gainArray[0].gain.cancelScheduledValues(audioCtx.currentTime);
      gainArray[0].gain.exponentialRampToValueAtTime(NOTE_PRESS_GAIN * force, audioCtx.currentTime + 0.1);
      gainArray[0].gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (NOTE_PRESS_SUSTAIN * force) + 0.1);
      drawNoteWithRing(adjustedMidiNote,ringLevel, noteColor[i],i);
      if (chordModeVal == 0) {
        //single note mode, break loop here
        break;
      }
      if (chordModeVal < 6 && i >= 2) {
        //this is 3 note chord mode, stop on third iteration
        break;
      }
  }

}


function calculateNoteDelta(midiNote,ringLevel,chordModeVal,i) {
   var midiNoteDelta = 0;
      //calculate note delta depending on ringlevel
      if (i == 1) {
        if(ringLevel== 0){
            midiNoteDelta = subdominantMajorDeltaMap[chordModeVal];//this is the same for major and minor chords
        } else {
            midiNoteDelta = subdominantMinorDeltaMap[chordModeVal];//this is the same for major and minor chords
        }

      }
      if (i == 2){
        if(ringLevel== 0){
           midiNoteDelta = dominantMajorDeltaMap[chordModeVal];//this is the same for major and minor chords
        } else {
           midiNoteDelta = dominantMinorDeltaMap[chordModeVal];//this is the same for major and minor chords
        }
      }
      if (i == 3){
    	midiNoteDelta = forthChordNoteIntervalMap[chordModeVal];
      }

      return midiNoteDelta;
}

function up(midiNote, ringLevel) {
  var chordModeVal = document.getElementById('chordModeSelect').value;
  console.log("UP.midiNote:" + midiNote);
  var midiNoteDelta = 0;
  for (var i = 0; i < 4 ; i++) {
        midiNoteDelta = calculateNoteDelta(midiNote, ringLevel,chordModeVal, i);
        drawNoteWithRing(midiNote + midiNoteDelta,ringLevel, disabledNoteColor,i);

      if (chordModeVal == 0) {
        //single note mode, break loop here
        break;
      }
      if (chordModeVal < 6 && i >= 2) {
        //this is 3 note chord mode, stop on third iteration
        break;
      }
   }

}