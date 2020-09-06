////////////////////////MODEL //////////////////////////////////////
const NUM_NOTES=12;
const NOTE_PRESS_GAIN = 0.1;//the gain applied when note is pressed
const NOTE_PRESS_SUSTAIN = 2;//number of seconds the note will be sustained
const DIM_NOTATION="\xBA";
const MINOR_NOTATION="m";
const MAJOR_NOTATION="";

const NOTE_LABEL= ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const KEY_MODE_ROOT_RING = [0,1,1,0,0,1,2];
const KEY_MODE_ROOT_NOTATION = [MAJOR_NOTATION,MINOR_NOTATION,MINOR_NOTATION,MAJOR_NOTATION,MAJOR_NOTATION,MINOR_NOTATION,DIM_NOTATION];

const IONIAN_INTERVAL= [0,2,4,5,7,9,11];
const IONIAN_CHORD=[MAJOR_NOTATION,MINOR_NOTATION,MINOR_NOTATION, MAJOR_NOTATION,MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION];
const DORIAN_INTERVAL= [0,2,3,5,7,9,10];
const DORIAN_CHORD=[MINOR_NOTATION,MINOR_NOTATION,MAJOR_NOTATION,MAJOR_NOTATION,MINOR_NOTATION,DIM_NOTATION,MAJOR_NOTATION];
const PRHYGIAN_INTERVAL= [0,1,3,5,7,8,10];
const PRHYGIAN_CHORD=[MINOR_NOTATION,MAJOR_NOTATION,MAJOR_NOTATION,MINOR_NOTATION, DIM_NOTATION, MAJOR_NOTATION, MINOR_NOTATION];
const LYDIAN_INTERVAL= [0,2,4,6,7,9,11];
const LYDIAN_CHORD=[MAJOR_NOTATION,MAJOR_NOTATION,MINOR_NOTATION,DIM_NOTATION,MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION];
const MIXOLYDIAN_INTERVAL= [0,2,4,5,7,9,10];
const MIXOLYDIAN_CHORD=[MAJOR_NOTATION,MINOR_NOTATION,DIM_NOTATION, MAJOR_NOTATION,MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION];
const AEOLIAN_INTERVAL= [0,2,3,5,7,8,10];
const AEOLIAN_CHORD=[MINOR_NOTATION,DIM_NOTATION,MAJOR_NOTATION, MINOR_NOTATION,MINOR_NOTATION,MAJOR_NOTATION,MAJOR_NOTATION];
const LOCRIAN_INTERVAL= [0,1,3,5,6,8,10];
const LOCRIAN_CHORD=[DIM_NOTATION,MAJOR_NOTATION,MINOR_NOTATION,MINOR_NOTATION,MAJOR_NOTATION,MAJOR_NOTATION,MINOR_NOTATION];

const KEY_MODE_INTERVAL= [IONIAN_INTERVAL, DORIAN_INTERVAL, PRHYGIAN_INTERVAL,LYDIAN_INTERVAL,MIXOLYDIAN_INTERVAL,AEOLIAN_INTERVAL,LOCRIAN_INTERVAL];
const KEY_MODE_CHORD = [IONIAN_CHORD, DORIAN_CHORD, PRHYGIAN_CHORD, LYDIAN_CHORD, MIXOLYDIAN_CHORD,AEOLIAN_CHORD, LOCRIAN_CHORD];

const dominantMajorDeltaMap = [7,7,7,7,6,8,7,7];
const dominantMinorDeltaMap = [7,7,7,7,6,8,7,7];
const dominantDimDeltaMap = [6,6,6,6,5,7,6,6];
const subdominantMajorDeltaMap = [4,4,2,5,3,4,4,4];
const subdominantMinorDeltaMap = [3,3,1,4,2,3,3,3];
const subdominantDimDeltaMap = [3,3,3,3,3,3,3,3];
const forthChordNoteIntervalMap = [0,0,0,0,0,0,11,14];


const noteMajorLabel=['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
const noteMajorCode=[12,19,14,21,16,23,18,13,20,15,22,17];
const noteMajorCircleRadius=25;


const noteMinorLabel=['Am','Em','Bm','F#m','C#m','G#m','D#m','A#m','Fm','Cm','Gm','Dm'];
const noteMinorCode=[21,16,23,18,13,20,15,22,17,12,19,14];
const noteMinorCircleRadius=25;
const noteMinorPositionDelta=30;

const noteDimLabel=["B\xBA",'F#\xBA','C#\xBA','G#\xBA','D#\xBA','A#\xBA','F\xBA','C\xBA','G\xBA','D\xBA','A\xBA','E\xBA'];
const noteDimCode=[23,18,13,20,15,22,17,12,19,14,21,16];
const noteDimCircleRadius=20;
const noteDimPositionDelta=30;

const noteLabel=[noteMajorLabel, noteMinorLabel, noteDimLabel];
const noteCode=[noteMajorCode, noteMinorCode, noteDimCode];
const noteCircleRadius=[noteMajorCircleRadius, noteMinorCircleRadius, noteDimCircleRadius];



const disabledNoteColor='grey';
const tonicColor='blue';
const dominantColor='green';
const subdominantColor='yellow';
const forthColor='salmon';
const keyLineColor='orange';
var noteColor=[tonicColor,subdominantColor,dominantColor,forthColor];

function findNoteIndex(midiNote, ringLevel) {
   var normalizedMidiNote = midiNote;
   if (midiNote > 23) {
        //we work assuming octave is 1, this note went beyond this, so we need normalization
	normalizedMidiNote = midiNote - NUM_NOTES;//down tune note one octave
	console.log("Normalized Note:" + midiNote + "," + normalizedMidiNote);
   }
   return noteCode[ringLevel].findIndex((element) => element === normalizedMidiNote);
}


function generateKeyArray(noteIndex, keyMode) {
    var key = [];
    //calculate the 7 notes in the key based on intervals
    //add chord suffix accordingly
    for (var i = 0; i < 7; i++) {
        key[i] = NOTE_LABEL[(noteIndex + KEY_MODE_INTERVAL[keyMode][i]) % NUM_NOTES] + KEY_MODE_CHORD[keyMode][i];
    }
    return key;
}

////////DOM CACHING//////////////////
var canvas;
var chordModeSelect;
var octaveSelect;
var outputSelect;

(function(window, document, undefined){
window.onload = init;

  function init(){
    // the code to be called when the dom has loaded
    // #document has its nodes
	console.log("init");
	initOscillators();
	//cache DOM elements for better performance
	canvas = document.getElementById('circleCanvas');
    chordModeSelect = document.getElementById('chordModeSelect');
    octaveSelect = document.getElementById('octaveSelect');
    outputSelect = document.getElementById('outputSelect');

	//register multitouch listener
	canvas.addEventListener('touchstart', function(event) {
		  event.preventDefault();
		  //resume audiocontext on canvas touch
		  audioCtx.resume();
		  for (var i = 0; i < event.changedTouches.length; i++) {
		    var touch = event.changedTouches[i];
		    	var rect = canvas.getBoundingClientRect();
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
	canvas.addEventListener('touchend', function(event) {
	      event.preventDefault();
		  for (var i = 0; i < event.changedTouches.length; i++) {
		    var touch = event.changedTouches[i];
		    	var rect = canvas.getBoundingClientRect();
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


function clearNoteLabels() {
	for (var i = 0; i < noteColor.length; i++) {
	        document.getElementById('noteText' + i).value= "";
	}
}

///////////////INPUT HANDLING/////////////////////////////////////////

function keyDownHandler(event) {
	var keyPressed = String.fromCharCode(event.keyCode);
    if (event.keyCode >= 48 && event.keyCode <= 57) {
		octaveSelect.selectedIndex = keyPressed;
	}
}

function keyUpHandler(event) {
}

function canvasDown(e){
   //resume audiocontext on canvas mousedown
   audioCtx.resume();
   canvasDownXY(e.offsetX, e.offsetY, 1.0);
}

function canvasDownXY(x,y, force){
   console.log("down:" + x + "," + y);
   for(var i = 0; i < noteCode.length; i++) {
      for (var j = 0; j < noteCode[i].length; j++) {
          var noteCenterPoint = calculateCenterWithRing(j,i);
	      if (intersects(x,y,noteCenterPoint.x,noteCenterPoint.y,noteCircleRadius[i])) {
		    down(noteCode[i][j], i, force);
		    break;//note found no need to go on
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
          var noteCenterPoint = calculateCenterWithRing(j,i);
	      if (intersects(x,y,noteCenterPoint.x,noteCenterPoint.y,noteCircleRadius[i])) {
		    up(noteCode[i][j], i);
		    break;
	      }
      }
   }
}

function down(midiNote, ringLevel, force) {
  console.log("midiNote:" + midiNote);
  console.log("freqMidi:" + freq(midiNote));


  clearNoteLabels();

  var chordModeVal = chordModeSelect.value;
  console.log ("chordMode:"+ chordModeVal);
  var octaveSelectVal = octaveSelect.value;
  console.log("octave:" + octaveSelectVal);

  var midiNoteDelta = 0;
  for (var i = 0; i < 4 ; i++) {
      //calculate note delta depending on ringlevel
      midiNoteDelta = calculateNoteDelta(midiNote, ringLevel,chordModeVal, i);
      var adjustedMidiNote = midiNote + midiNoteDelta;
      if (outputSelect.value === "0") {
        playOscillatorNote(i,adjustedMidiNote,octaveSelectVal,force);
      } else {
        actualMidiNote = adjustedMidiNote + octaveSelectVal * 12;
        playMidiNote(actualMidiNote, force);
      }
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
            midiNoteDelta = subdominantMajorDeltaMap[chordModeVal];
        } else {
            if (ringLevel == 1) {
                midiNoteDelta = subdominantMinorDeltaMap[chordModeVal];
            } else {
                midiNoteDelta = subdominantDimDeltaMap[chordModeVal];
            }
        }
    }
    if (i == 2){
        if(ringLevel== 0){
           midiNoteDelta = dominantMajorDeltaMap[chordModeVal];
        } else {
           if (ringLevel == 1) {
            midiNoteDelta = dominantMinorDeltaMap[chordModeVal];
           } else {
            midiNoteDelta = dominantDimDeltaMap[chordModeVal];
           }
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
      if (outputSelect.value === "1") {
        var octaveSelectVal = octaveSelect.value;
        midiNoteDelta = midiNote + midiNoteDelta + octaveSelectVal * 12;
        playMidiNoteOff(midiNoteDelta);
      }
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


//////////////////////////// CONFIGURATION ////////////////////////////
function changeOutput(){
    var selectedOutput = document.getElementById('outputSelect').value;
    if (selectedOutput === "0") {
    } else {
       initMidi();
    }
}


function changeKey(){
    var selectedKey = document.getElementById('keySelect').value;
    var keyMode = document.getElementById('modeSelect').value;
	var ctx = canvas.getContext("2d");
	var ringLevel = KEY_MODE_ROOT_RING[keyMode];
	//clear all canvas to remove previous key lines
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var rootCircleIndex = noteLabel[ringLevel].findIndex((element) => element === (selectedKey + KEY_MODE_ROOT_NOTATION[keyMode]));
	var rootIndex = NOTE_LABEL.findIndex((element) => element === selectedKey );
    var keyFormation = generateKeyArray(rootIndex, keyMode);
    console.log("selectedKey:"+ keyFormation);
    ctx.strokeStyle=keyLineColor;
    var tonicPoint = calculateCenterWithRing(rootCircleIndex, ringLevel);
	for (var i=1; i < keyFormation.length; i++)
    {
        ctx.beginPath();
        ctx.moveTo(tonicPoint.x, tonicPoint.y);
        if (keyFormation[i].includes(DIM_NOTATION)){
            var nextNoteIndex = noteDimLabel.findIndex((element) => element === keyFormation[i]);
            var nextDimNotePoint = calculateNoteCenter(nextNoteIndex,dimRingRadius(canvas.width)-noteDimPositionDelta);
            ctx.lineTo(nextDimNotePoint.x, nextDimNotePoint.y);
        } else {
            if (keyFormation[i].includes(MINOR_NOTATION)){
                var nextNoteIndex = noteMinorLabel.findIndex((element) => element === keyFormation[i]);
                var nextMinorNotePoint = calculateNoteCenter(nextNoteIndex,innerRingRadius(canvas.width)-noteMinorPositionDelta);
                ctx.lineTo(nextMinorNotePoint.x, nextMinorNotePoint.y);

            } else {
                var nextNoteIndex = noteMajorLabel.findIndex((element) => element === keyFormation[i]);
                var nextMajorNotePoint = calculateNoteCenter(nextNoteIndex, majorNoteRadius());
                ctx.lineTo(nextMajorNotePoint.x, nextMajorNotePoint.y);
            }
        }
        ctx.stroke();
    }
    //revert back stroke style
    ctx.strokeStyle='black';
    //draw all circle again
    renderCircle();
}



////////////////// CANVAS RENDERING ///////////////////////

function intersects(x,y, cx, cy, r) {
    var dx = x - cx;
    var dy = y - cy;
    return dx*dx+dy*dy <= r*r;
}

function calculateNoteCenter(noteIndex, radius) {
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
    return canvas.width/2 - ((canvas.width/2-innerRingRadius(canvas.width))/2);
}


function innerRingRadius() {
	//inner ring at 3/4 of total radius
    return canvas.width/2/4*3;
}

function dimRingRadius() {
	//dim ring at 1/4 of total radius
    return canvas.width/2/4*2;
}

function renderCircle() {
	var ctx = canvas.getContext("2d");

	//draw outer and inner circles
	ctx.beginPath();
	ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, 2 * Math.PI);
	ctx.stroke(); 
	ctx.beginPath();

	ctx.arc(canvas.width/2, canvas.height/2, innerRingRadius(), 0, 2 * Math.PI);
	ctx.stroke();

	ctx.arc(canvas.width/2, canvas.height/2, dimRingRadius(), 0, 2 * Math.PI);
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

function drawNoteWithRing(midiNote, ringLevel, color,chordNoteIndex) {
    var noteDimIndex = findNoteIndex(midiNote,2);
    var noteMinorIndex = findNoteIndex(midiNote,1);
    var noteMajorIndex = findNoteIndex(midiNote,0);
    drawNoteIndex(noteMajorIndex,0,color);
    drawNoteIndex(noteMinorIndex, 1, color);
    drawNoteIndex(noteDimIndex, 2, color);

	if(ringLevel== 0){
		document.getElementById('noteText' + chordNoteIndex).value= noteLabel[ringLevel][noteMajorIndex];
		console.log("noteIndex:" + noteMajorIndex);
	} else {
	    if (ringLevel == 1) {
            document.getElementById('noteText' + chordNoteIndex).value= noteLabel[ringLevel][noteMinorIndex];
            console.log("noteIndex:" + noteMinorIndex);
        } else {
            document.getElementById('noteText' + chordNoteIndex).value= noteLabel[ringLevel][noteDimIndex];
            console.log("noteIndex:" + noteDimIndex);
        }
	}
}


function calculateCenterWithRing(noteIndex, ringLevel) {
    var noteCenterPoint;
    if (ringLevel == 0 ) {
        noteCenterPoint = calculateNoteCenter(noteIndex, majorNoteRadius());
    } else {
        if (ringLevel == 1 ) {
            noteCenterPoint = calculateNoteCenter(noteIndex, innerRingRadius() - noteMinorPositionDelta);
        } else {
            noteCenterPoint = calculateNoteCenter(noteIndex, dimRingRadius() - noteDimPositionDelta);
        }
    }
    return noteCenterPoint;
}

function drawNoteIndex(noteIndex,ringLevel, style) {
	var ctx = canvas.getContext("2d");
    var noteCenterPoint = calculateCenterWithRing(noteIndex, ringLevel);
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



////////////////////// OSCILLATOR OUTPUT //////////////////////
// create Oscillators node,
const oscillatorArray = [];
const gainArray = [];
const A4_FREQ = 440;

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext);


function initOscillators() {
    //one oscillator for each possible 4 notes in a chord
    for (var i=0; i< 4 ; i++){
        oscillatorArray[i] = audioCtx.createOscillator();
        oscillatorArray[i].type = 'triangle';
        //use A4 as initial note
        oscillatorArray[i].frequency.setValueAtTime(A4_FREQ, audioCtx.currentTime); // value in hertz
        oscillatorArray[i].start();
        gainArray[i] = audioCtx.createGain();
        //set a very low gain value to  make it as quiet as possible
        gainArray[i].gain.setValueAtTime(0.0001, audioCtx.currentTime);
        gainArray[i].connect(audioCtx.destination);
        oscillatorArray[i].connect(gainArray[i]);
    }
}

function freq (midi) {
	tuning = 440;
	return midi === 0 || (midi > 0 && midi < 128) ? Math.pow(2, (midi - 69) / 12) * tuning : null
}

function playOscillatorNote(i,adjustedMidiNote, octaveSelectVal, force){
      var noteFreq = freq(adjustedMidiNote) * Math.pow(2,octaveSelectVal);
      console.log("biteFreq" + i + ":" + noteFreq);
      oscillatorArray[0].frequency.setValueAtTime(noteFreq, audioCtx.currentTime); // value in hertz
      gainArray[0].gain.cancelScheduledValues(audioCtx.currentTime);
      gainArray[0].gain.exponentialRampToValueAtTime(NOTE_PRESS_GAIN * force, audioCtx.currentTime + 0.1);
      gainArray[0].gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (NOTE_PRESS_SUSTAIN * force) + 0.1);
}

/////////////////////////////MIDI OUTPUT//////////////////////
const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
var outputs;
var midiOut;
var midiVelocity= 127;
var midiChannel=0;

function initMidi() {
   if (navigator.requestMIDIAccess){
        navigator.requestMIDIAccess({sysex: true}).then(onMIDISuccess, onMIDIFailure);
   } else {
    console.log("no midi support");
   }
}
function onMIDISuccess(midiAccess) {
    console.log(midiAccess);
    outputs = midiAccess.outputs;
    var midiOutputSelect = document.getElementById('midiOutputSelect');
    for (var output of outputs.values()) {
        var opt = document.createElement('option');
        opt.value = output.id;
        opt.innerHTML = output.name;
        midiOutputSelect.appendChild(opt);
        midiOut = output;
    }
}

function changeMidiOutput() {
    var midiOutputSelect = document.getElementById('midiOutputSelect');
    for (var output of outputs.values()) {
        if (output.id === midiOutputSelect.value){
          midiOut = output;
          break;
        }
    }
}

function playMidiNote(midiNote, force) {
   console.log("turn on:" + midiNote);
       midiOut.send( [NOTE_ON, midiNote, midiVelocity * force]);
}
function playMidiNoteOff(midiNote) {
   console.log("turn off:" + midiNote);
       midiOut.send( [NOTE_OFF, midiNote, midiVelocity] );
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}