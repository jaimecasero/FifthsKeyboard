////////////////////////MODEL //////////////////////////////////////
const NUM_NOTES=12;
const NOTE_PRESS_SUSTAIN = 6;//number of seconds the note will be sustained
const DIM_NOTATION="\xBA";
const MINOR_NOTATION="m";
const MAJOR_NOTATION="";
const CHORD_SEPARATOR="-"

const INTEGER_2_INTERVAL=['1', 'b2', '2', 'b3', '3', 'p4', '#4/b5', 'p5', 'b6', '6', '7', '#7','8', 'b9', '9', '11', '11#', 'b13', '13' ];

const NOTE_LABEL= ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_CODE= [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const NOTE_COLOR= ['#FF3333', '#33FF8D', '#FF8A33', '#3358FF', '#FFFC33', '#FF33C1', '#33FF33', '#FF6133', '#33FCFF', '#FFB233', '#A833FF', '#93FF33'];

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


const NOTE_MAJOR_LABEL=['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
const NOTE_MAJOR_CODE=[12,19,14,21,16,23,18,13,20,15,22,17];
const NOTE_MAJOR_CIRCLE_RADIUS=25;


const NOTE_MINOR_LABEL=['Am','Em','Bm','F#m','C#m','G#m','D#m','A#m','Fm','Cm','Gm','Dm'];
const NOTE_MINOR_CODE=[21,16,23,18,13,20,15,22,17,12,19,14];
const NOTE_MINOR_CIRCLE_RADIUS=25;
const NOTE_MINOR_POSITION_DELTA=30;

const NOTE_DIM_LABEL=["B\xBA",'F#\xBA','C#\xBA','G#\xBA','D#\xBA','A#\xBA','F\xBA','C\xBA','G\xBA','D\xBA','A\xBA','E\xBA'];
const NOTE_DIM_CODE=[23,18,13,20,15,22,17,12,19,14,21,16];
const NOTE_DIM_CIRCLE_RADIUS=20;
const NOTE_DIM_POSITION_DELTA=30;

const noteLabel=[NOTE_MAJOR_LABEL, NOTE_MINOR_LABEL, NOTE_DIM_LABEL];
const noteCode=[NOTE_MAJOR_CODE, NOTE_MINOR_CODE, NOTE_DIM_CODE];
const NOTE_CIRCLE_RADIUS=[NOTE_MAJOR_CIRCLE_RADIUS, NOTE_MINOR_CIRCLE_RADIUS, NOTE_DIM_CIRCLE_RADIUS];



const DISABLED_NOTE_COLOR='grey';
const TONIC_COLOR='#FFFFFF';
const DOMINANT_COLOR='#F6F6F6';
const SUBDOMINANT_COLOR='#F9F9F9';
const FORTH_COLOR='#F3F3F3';
const keyLineColor='red';
var noteColor=[TONIC_COLOR,SUBDOMINANT_COLOR,DOMINANT_COLOR,FORTH_COLOR];
var octave=3;
var notePressGain = 0.8;//the gain applied when note is pressed
var keyFormation=[];
var chordModifier=[0,0,0,0]

function normalizeMidiNote(midiNote) {
   var normalizedMidiNote = midiNote;

   while (normalizedMidiNote > 23) {
        //we work assuming octave is 1, this note went beyond this, so we need normalization
	normalizedMidiNote = normalizedMidiNote - NUM_NOTES;//down tune note one octave
   }
   return normalizedMidiNote;
}

function findNoteIndex(midiNote, ringLevel) {
   var normalizedMidiNote = normalizeMidiNote(midiNote);
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
var outputSelect;
var integerNotationText;
var intervalNotationText;

(function(window, document, undefined){
window.onload = init;

  function init(){
    // the code to be called when the dom has loaded
    // #document has its nodes
	console.log("init");
	initOscillators();
	//cache DOM elements for better performance
	canvas = document.getElementById('circleCanvas');
    outputSelect = document.getElementById('outputSelect');
    intervalNotationText = document.getElementById('intervalNotationText');
    integerNotationText = document.getElementById('integerNotationText');
    chordText = document.getElementById('chordText');

	//register multitouch listener
	canvas.addEventListener('touchstart', function(event) {
		  event.preventDefault();
		  //resume audiocontext on canvas touch
		  
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

  }

})(window, document, undefined);


function clearNoteLabels() {
	noteText.value="";
	integerNotationText.value="";
	intervalNotationText.value=""
	chordText.value="";
}

///////////////INPUT HANDLING/////////////////////////////////////////
var shiftPressed = false;
function keyDownHandler(event) {
	var keyPressed = String.fromCharCode(event.keyCode);
	if (event.keyCode == 16) {
		shiftPressed = true;
	}
    if (event.keyCode >= 48 && event.keyCode <= 57) {
        if (shiftPressed) {
		    octave = keyPressed;
		} else {
		    chordDown(event, event.keyCode - 49);
		}
	}
	if (shiftPressed) {
		keyPressed = keyPressed + "#";
	}


	var noteIndex = NOTE_MAJOR_LABEL.findIndex((element) => element === keyPressed);
	console.log("rep:" + event.repeat)
	if (noteIndex > -1 && !event.repeat ) {
		var ring = 0;
		if (event.shiftKey) {
			ring =0;
		}
		if (event.altKey) {
			ring =1;
		}
		if (event.ctrlKey) {
			ring =2;
		}
		
		down(NOTE_MAJOR_CODE[noteIndex],ring, notePressGain);
	} else {
	}
}

function keyUpHandler(event) {
	var keyPressed = String.fromCharCode(event.keyCode);
	if (event.keyCode == 16) {
		shiftPressed = false;
	}
    if (event.keyCode >= 48 && event.keyCode <= 57) {
        if (shiftPressed) {
		    octave = keyPressed;
		} else {
		    chordUp(event, event.keyCode - 49);
		}
	}
	if (shiftPressed) {
		keyPressed = keyPressed + "#";
	}	
	var noteIndex = NOTE_MAJOR_LABEL.findIndex((element) => element === keyPressed);
	if (noteIndex > -1) {
				var ring = 0;
		if (event.shiftKey) {
			ring =0;
		}
		if (event.altKey) {
			ring =1;
		}
		if (event.ctrlKey) {
			ring =2;
		}
		up(NOTE_MAJOR_CODE[noteIndex],ring);
	}	
	
}

function changeChordModifier(modifier) {
    console.log("chord mofider:" + modifier)
    chordModifier = modifier;
}

function resetChordModifier() {
    chordModifier = [0,0,0,0];
    console.log("chord modifier reset")
}

function chordDown(event, grade) {
    //calculate chord notes
    var notePressed = keyFormation[grade];
    var pressure = ((event.pressure == null ) ? 0.5 : event.pressure);
    for(var i = 0; i < noteLabel.length; i++) {
        var noteIndex = noteLabel[i].findIndex((element) => element === notePressed);
        if (noteIndex > -1) {
            console.log("i:" + noteCode[i][noteIndex]);
            down(noteCode[i][noteIndex],i, pressure);
        }
    }
}
function chordUp(event, grade) {
    //calculate chord notes
    var notePressed = keyFormation[grade];

    console.log("chordup:" + notePressed);
    for(var i = 0; i < noteLabel.length; i++) {
        var noteIndex = noteLabel[i].findIndex((element) => element === notePressed);
        if (noteIndex > -1) {
            console.log("chordup:" + noteCode[i][noteIndex]);
            up(noteCode[i][noteIndex],i);
        }
    }
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
	      if (intersects(x,y,noteCenterPoint.x,noteCenterPoint.y,NOTE_CIRCLE_RADIUS[i])) {
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
	      if (intersects(x,y,noteCenterPoint.x,noteCenterPoint.y,NOTE_CIRCLE_RADIUS[i])) {
		    up(noteCode[i][j], i);
		    break;
	      }
      }
   }
}

function down(midiNote, ringLevel, force) {
  clearNoteLabels();
  var octaveSelectVal = octave;

  var midiNoteDelta = 0;
  for (var i = 0; i < 4 ; i++) {
       var separator =CHORD_SEPARATOR;
       if (i === 3) {
        separator = "";
       }
      //calculate note delta depending on ringlevel
      midiNoteDelta = calculateNoteDelta(midiNote, ringLevel, i);
      var adjustedMidiNote = midiNote + midiNoteDelta;
      actualMidiNote = adjustedMidiNote + octaveSelectVal * 12;

      if (outputSelect.value === "0") {
        playOscillatorNote(actualMidiNote, force);
      } else {
        playMidiNote(actualMidiNote, force);
      }

      integerNotationText.value = integerNotationText.value + midiNoteDelta + separator;
      intervalNotationText.value = intervalNotationText.value + INTEGER_2_INTERVAL[midiNoteDelta] + separator;
      var normNote = normalizeMidiNote(adjustedMidiNote)
      var noteIndex = NOTE_CODE.findIndex((element) => element === normNote);
      noteText.value = noteText.value + NOTE_LABEL[noteIndex] + separator;


      drawNoteWithRing(adjustedMidiNote,ringLevel, noteColor[i],i);

  }

}


function calculateNoteDelta(midiNote,ringLevel,i) {
    var midiNoteDelta = 0;
    //calculate note delta depending on ringlevel
    if (i == 1) {
        if(ringLevel== 0){
            midiNoteDelta = 4 ;
        } else {
            if (ringLevel == 1) {
                midiNoteDelta = 3;
            } else {
                midiNoteDelta = 3;
            }
        }
    }
    if (i == 2){
        if(ringLevel== 0){
           midiNoteDelta = 7;
        } else {
           if (ringLevel == 1) {
            midiNoteDelta = 7;
           } else {
            midiNoteDelta = 6;
           }
        }
    }
    if (i == 3){
        midiNoteDelta = 0;
    }

    return midiNoteDelta + chordModifier[i];
}

function up(midiNote, ringLevel) {
  console.log("UP.midiNote:" + midiNote);
  var midiNoteDelta = 0;

  for (var i = 0; i < 4 ; i++) {
        midiNoteDelta = calculateNoteDelta(midiNote, ringLevel, i);
		var color = calculateNoteColorByMidi(normalizeMidiNote(midiNote + midiNoteDelta));
        drawNoteWithRing(midiNote + midiNoteDelta,ringLevel, color,i);
        var octaveSelectVal = octave;
        midiNoteDelta = midiNote + midiNoteDelta + octaveSelectVal * 12;
      if (outputSelect.value === "0") {
        playOscillatorNoteOff(midiNoteDelta);
      }
      if (outputSelect.value === "1") {
        playMidiNoteOff(midiNoteDelta);
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

function changeOctave(){
    octave = document.querySelector('input[name="octaveSelect"]:checked').value;
}

function changeGain(){
    var keyMode = document.getElementById('gainSelect').value;
    notePressGain = keyMode;
    console.log("new gain:" + notePressGain);
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
    keyFormation = generateKeyArray(rootIndex, keyMode);
    console.log("selectedKey:"+ keyFormation);
    ctx.strokeStyle=keyLineColor;
    var tonicPoint = calculateCenterWithRing(rootCircleIndex, ringLevel);
	for (var i=0; i < keyFormation.length; i++)
    {
        document.getElementById('GradeButton' + i).value = document.getElementById('GradeButton' + i).value.replace(DIM_NOTATION, '');
        ctx.beginPath();
        ctx.moveTo(tonicPoint.x, tonicPoint.y);
        if (keyFormation[i].includes(DIM_NOTATION)){
            var nextNoteIndex = NOTE_DIM_LABEL.findIndex((element) => element === keyFormation[i]);
            var nextDimNotePoint = calculateNoteCenter(nextNoteIndex,dimRingRadius(canvas.width)-NOTE_DIM_POSITION_DELTA);
            ctx.lineTo(nextDimNotePoint.x, nextDimNotePoint.y);
            document.getElementById('GradeButton' + i).value = document.getElementById('GradeButton' + i).value.toLowerCase() + DIM_NOTATION;
        } else {
            if (keyFormation[i].includes(MINOR_NOTATION)){
                var nextNoteIndex = NOTE_MINOR_LABEL.findIndex((element) => element === keyFormation[i]);
                var nextMinorNotePoint = calculateNoteCenter(nextNoteIndex,innerRingRadius(canvas.width)-NOTE_MINOR_POSITION_DELTA);
                ctx.lineTo(nextMinorNotePoint.x, nextMinorNotePoint.y);
                document.getElementById('GradeButton' + i).value = document.getElementById('GradeButton' + i).value.toLowerCase();
            } else {
                var nextNoteIndex = NOTE_MAJOR_LABEL.findIndex((element) => element === keyFormation[i]);
                var nextMajorNotePoint = calculateNoteCenter(nextNoteIndex, majorNoteRadius());
                ctx.lineTo(nextMajorNotePoint.x, nextMajorNotePoint.y);
                document.getElementById('GradeButton' + i).value = document.getElementById('GradeButton' + i).value.toUpperCase();
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
              drawNoteIndex(j,i, calculateNoteColor(i,j));
	   }
	}
}

function calculateNoteColor(i,j) {
	var color = DISABLED_NOTE_COLOR;
	var noteIndex = NOTE_CODE.findIndex((element) => element === noteCode[i][j]);
	if (noteIndex > -1) {
	  color = NOTE_COLOR[noteIndex];
	}	
	return color;
}

function calculateNoteColorByMidi(midiNote) {
	var color = DISABLED_NOTE_COLOR;
	var noteIndex = NOTE_CODE.findIndex((element) => element === midiNote);
	if (noteIndex > -1) {
	  color = NOTE_COLOR[noteIndex];
	}	
	return color;
}

function drawNoteWithRing(midiNote, ringLevel, color,chordNoteIndex) {
    var noteDimIndex = findNoteIndex(midiNote,2);
    var noteMinorIndex = findNoteIndex(midiNote,1);
    var noteMajorIndex = findNoteIndex(midiNote,0);
    drawNoteIndex(noteMajorIndex,0,color);
    drawNoteIndex(noteMinorIndex, 1, color);
    drawNoteIndex(noteDimIndex, 2, color);
}


function calculateCenterWithRing(noteIndex, ringLevel) {
    var noteCenterPoint;
    if (ringLevel == 0 ) {
        noteCenterPoint = calculateNoteCenter(noteIndex, majorNoteRadius());
    } else {
        if (ringLevel == 1 ) {
            noteCenterPoint = calculateNoteCenter(noteIndex, innerRingRadius() - NOTE_MINOR_POSITION_DELTA);
        } else {
            noteCenterPoint = calculateNoteCenter(noteIndex, dimRingRadius() - NOTE_DIM_POSITION_DELTA);
        }
    }
    return noteCenterPoint;
}

function drawNoteIndex(noteIndex,ringLevel, style) {
	var ctx = canvas.getContext("2d");
    var noteCenterPoint = calculateCenterWithRing(noteIndex, ringLevel);
	ctx.beginPath();
	ctx.fillStyle=style;
	ctx.arc(noteCenterPoint.x,noteCenterPoint.y,NOTE_CIRCLE_RADIUS[ringLevel], 0, 2 * Math.PI);
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

    MIDI.loadPlugin({
      soundfontUrl: "./soundfont/",
      instrument: "acoustic_grand_piano",
      onprogress: (state, progress) => console.log(state, progress),
      onsuccess: () => {
        console.log("MIDI.js loaded");
      },
    });

}

/**
 * Convert mouse event force (0-1) to MIDI velocity (0-127).
 * @param {number} force - The force value from a mouse event (0 to 1).
 * @returns {number} - The corresponding MIDI velocity (0 to 127).
 */
function forceToMidiVelocity(force) {
  // Clamp the force value to the range 0-1
  const clampedForce = Math.min(Math.max(force, 0), 1);
  // Scale the clamped force to the MIDI velocity range (0-127)
  const midiVelocity = Math.round(clampedForce * 127);
  return midiVelocity;
}

function playOscillatorNote(adjustedMidiNote, force){
	MIDI.noteOn(0,adjustedMidiNote, forceToMidiVelocity(force),0);
}

function playOscillatorNoteOff(adjustedMidiNote){
	MIDI.noteOff(0,adjustedMidiNote,0);
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
