////////////////////////MODEL //////////////////////////////////////
const NUM_NOTES = 12;
const NOTE_PRESS_SUSTAIN = 6;//number of seconds the note will be sustained
const DIM_NOTATION = "\xBA";
const MINOR_NOTATION = "m";
const MAJOR_NOTATION = "";
const CHORD_SEPARATOR = "-"

const INTEGER_2_INTERVAL = ['1', 'b2', '2', 'b3', '3', 'p4', '#4/b5', 'p5', 'b6', '6', '7', '#7', '8', 'b9', '9', '11', '11#', 'b13', '13'];

const NOTE_LABEL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_CODE = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const NOTE_KEY_SIG = ['', '\u266F\u266F\u266F\u266F\u266F\u266F\u266F/\u266D\u266D\u266D\u266D\u266D', '\u266F\u266F', '\u266D\u266D\u266D', '\u266F\u266F\u266F\u266F', '\u266D', '\u266F\u266F\u266F\u266F\u266F\u266F/\u266D\u266D\u266D\u266D\u266D\u266D', '\u266F', '\u266D\u266D\u266D\u266D', '\u266F\u266F\u266F', '\u266D\u266D', '\u266F\u266F\u266F\u266F\u266F/\u266D\u266D\u266D\u266D\u266D\u266D\u266D'];
const NOTE_COLOR = ['#FF3333', '#33FF8D', '#FF8A33', '#3358FF', '#FFFC33', '#FF33C1', '#33FF33', '#FF6133', '#33FCFF', '#FFB233', '#A833FF', '#93FF33'];
const NOTE_NATURAL_ART_COLOR = ['white', 'grey', 'white', 'grey', 'white', 'white', 'grey', 'white', 'grey', 'white', 'grey', 'white'];


const KEY_MODE_ROOT_RING = [0, 1, 1, 0, 0, 1, 2];
const KEY_MODE_ROOT_NOTATION = [MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION];


const HALF_STEP_LABEL="H";
const WHOLE_STEP_LABEL="W";

const IONIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 11];
const IONIAN_FORMULA = "WWHWWWH";
const IONIAN_MAJOR_RELATIVE = "1 2 3 4 5 6 7";
const IONIAN_CHORD = [MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION];
const DORIAN_INTERVAL = [0, 2, 3, 5, 7, 9, 10];
const DORIAN_FORMULA= "WHWWWHW";
const DORIAN_MAJOR_RELATIVE= "1 2 b3 4 5 6 b7";
const DORIAN_CHORD = [MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION, MAJOR_NOTATION];
const PRHYGIAN_INTERVAL = [0, 1, 3, 5, 7, 8, 10];
const PRHYGIAN_FORMULA = "HWWWHWW";
const PRHYGIAN_MAJOR_RELATIVE = "1 b2 b3 4 5 b6 b7";
const PRHYGIAN_CHORD = [MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION, MAJOR_NOTATION, MINOR_NOTATION];
const LYDIAN_INTERVAL = [0, 2, 4, 6, 7, 9, 11];
const LYDIAN_FORMULA = "WWWHWWH";
const LYDIAN_MAJOR_RELATIVE = "1 2 3 #4 5 6 7";
const LYDIAN_CHORD = [MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION];
const MIXOLYDIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 10];
const MIXOLYDIAN_FORMULA = "WWHWWHW";
const MIXOLYDIAN_MAJOR_RELATIVE = "1 2 3 4 5 6 b7";
const MIXOLYDIAN_CHORD = [MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION];
const AEOLIAN_INTERVAL = [0, 2, 3, 5, 7, 8, 10];
const AEOLIAN_FORMULA = "WHWWHWW";
const AEOLIAN_MAJOR_RELATIVE = "1 2 b3 4 5 b6 b7";
const AEOLIAN_CHORD = [MINOR_NOTATION, DIM_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION];
const LOCRIAN_INTERVAL = [0, 1, 3, 5, 6, 8, 10];
const LOCRIAN_FORMULA = "HWWHWWW";
const LOCRIAN_MAJOR_RELATIVE = "1 b2 b3 4 b5 b6 b7";
const LOCRIAN_CHORD = [DIM_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION];

const KEY_MODE_INTERVAL = [IONIAN_INTERVAL, DORIAN_INTERVAL, PRHYGIAN_INTERVAL, LYDIAN_INTERVAL, MIXOLYDIAN_INTERVAL, AEOLIAN_INTERVAL, LOCRIAN_INTERVAL];
const KEY_MODE_FORMULA = [IONIAN_FORMULA, DORIAN_FORMULA, PRHYGIAN_FORMULA, LYDIAN_FORMULA, MIXOLYDIAN_FORMULA, AEOLIAN_FORMULA, LOCRIAN_FORMULA];
const KEY_MODE_MAJOR_RELATIVE = [IONIAN_MAJOR_RELATIVE, DORIAN_MAJOR_RELATIVE, PRHYGIAN_MAJOR_RELATIVE, LYDIAN_MAJOR_RELATIVE, MIXOLYDIAN_MAJOR_RELATIVE, AEOLIAN_MAJOR_RELATIVE, LOCRIAN_MAJOR_RELATIVE];
const KEY_MODE_CHORD = [IONIAN_CHORD, DORIAN_CHORD, PRHYGIAN_CHORD, LYDIAN_CHORD, MIXOLYDIAN_CHORD, AEOLIAN_CHORD, LOCRIAN_CHORD];
const KEY_MODE_RELATIVE_MAJOR = [0, -2, -4, -5, -7, -9, -11];


const NOTE_MAJOR_LABEL = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
const NOTE_MAJOR_CODE = [12, 19, 14, 21, 16, 23, 18, 13, 20, 15, 22, 17];
const NOTE_MAJOR_CIRCLE_RADIUS = 25;


const NOTE_MINOR_LABEL = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'];
const NOTE_MINOR_CODE = [21, 16, 23, 18, 13, 20, 15, 22, 17, 12, 19, 14];
const NOTE_MINOR_CIRCLE_RADIUS = 25;
const NOTE_MINOR_POSITION_DELTA = 30;

const NOTE_DIM_LABEL = ["B\xBA", 'F#\xBA', 'C#\xBA', 'G#\xBA', 'D#\xBA', 'A#\xBA', 'F\xBA', 'C\xBA', 'G\xBA', 'D\xBA', 'A\xBA', 'E\xBA'];
const NOTE_DIM_CODE = [23, 18, 13, 20, 15, 22, 17, 12, 19, 14, 21, 16];
const NOTE_DIM_CIRCLE_RADIUS = 20;
const NOTE_DIM_POSITION_DELTA = 30;

const NOTE_CIRCLE_LABEL = [NOTE_MAJOR_LABEL, NOTE_MINOR_LABEL, NOTE_DIM_LABEL];
const NOTE_CIRCLE_CODE = [NOTE_MAJOR_CODE, NOTE_MINOR_CODE, NOTE_DIM_CODE];
const NOTE_CIRCLE_RADIUS = [NOTE_MAJOR_CIRCLE_RADIUS, NOTE_MINOR_CIRCLE_RADIUS, NOTE_DIM_CIRCLE_RADIUS];

const FIRST_INVERSION_FORMULA = [0, -12, 0,0];
const SECOND_INVERSION_FORMULA = [0, -0, -12,0];
const SUS2_FORMULA = [0, -2, 0, 0];
const B3_FORMULA = [0, -1, 0, 0];
const SUS4_FORMULA = [0, 1, 0, 0];
const B5_FORMULA = [0, 0, -1, 0];
const AUG_FORMULA = [0, 0, 1, 0];
const EXT_6_FORMULA = [0, 0, 0, 9];
const EXT_7_FORMULA = [0, 0, 0, 10];
const EXT_MAJ7_FORMULA = [0, 0, 0, 11];
const EXT_B9_FORMULA = [0, 0, 0, 13];
const EXT_9_FORMULA = [0, 0, 0, 14];
const EXT_11_FORMULA = [0, 0, 0, 17];
const EXT_MAJ11_FORMULA = [0, 0, 0, 18];
const EXT_B13_FORMULA = [0, 0, 0, 20];
const EXT_13_FORMULA = [0, 0, 0, 21];
const CHORD_MOD_ARR = [SUS2_FORMULA, B3_FORMULA, SUS4_FORMULA, B5_FORMULA, AUG_FORMULA, EXT_7_FORMULA, EXT_MAJ7_FORMULA, EXT_B9_FORMULA, EXT_9_FORMULA, EXT_11_FORMULA, EXT_MAJ11_FORMULA, EXT_B13_FORMULA, EXT_13_FORMULA, EXT_6_FORMULA];


const GRADE_LABEL= ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const DISABLED_NOTE_COLOR = 'grey';
const TONIC_COLOR = '#00FF00';
const DOMINANT_COLOR = '#006600';
const SUBDOMINANT_COLOR = '#009900';
const FORTH_COLOR = '#003300';
const NOTE_CHORD_COLOR = [TONIC_COLOR, SUBDOMINANT_COLOR, DOMINANT_COLOR, FORTH_COLOR];
const KEYBOARD_GAIN = 0.657;//the gain applied when note is pressed

//GRADES RING
const TONIC_CHORD_COLOR="green";
const SUBDOMINANT_CHORD_COLOR="yellow";
const DOMINANT_CHORD_COLOR="red";
const GRADE_COLOR=[TONIC_CHORD_COLOR, SUBDOMINANT_CHORD_COLOR, TONIC_CHORD_COLOR, SUBDOMINANT_CHORD_COLOR, DOMINANT_CHORD_COLOR, TONIC_CHORD_COLOR, DOMINANT_CHORD_COLOR];


//INTERVAL RING
const PERFECT_CONSONANCE = "green";
const IMPERFECT_CONSONANCE = "yellowgreen";
const MILD_DISONANCE= "orange";
const STRONG_DISONANCE="red";
const INTERVAL_LABEL = ["P1", "P5", "M2", "M6", "M3", "M7", "4#", "m2", "m6", "m3", "m7", "P4"];
const INTERVAL_COLOR = [PERFECT_CONSONANCE, PERFECT_CONSONANCE, MILD_DISONANCE, MILD_DISONANCE, IMPERFECT_CONSONANCE, STRONG_DISONANCE, STRONG_DISONANCE, STRONG_DISONANCE, IMPERFECT_CONSONANCE, IMPERFECT_CONSONANCE, MILD_DISONANCE, PERFECT_CONSONANCE];



var octave = 3;
var keyFormation = [];
var keyNoteFormation = [];
var chordModifier = [0, 0, 0, 0];
var pressedNotes = [];
var intervalTextRing = INTERVAL_LABEL.slice();
var intervalStyleRing = INTERVAL_COLOR.slice();
function normalizeMidiNote(midiNote) {
    let normalizedMidiNote = midiNote;

    while (normalizedMidiNote > 23) {
        //we work assuming octave is 1, this note went beyond this, so we need normalization
        normalizedMidiNote = normalizedMidiNote - NUM_NOTES;//down tune note one octave
    }
    return normalizedMidiNote;
}

function findNoteIndex(midiNote, ringLevel) {
    const normalizedMidiNote = normalizeMidiNote(midiNote);
    return NOTE_CIRCLE_CODE[ringLevel].findIndex((element) => element === normalizedMidiNote);
}


function generateKeyChordArray(noteIndex, keyMode) {
    let key = [];
    //calculate the 7 notes in the key based on intervals
    //add chord suffix accordingly
    for (let i = 0; i < 7; i++) {
        key[i] = NOTE_LABEL[(noteIndex + KEY_MODE_INTERVAL[keyMode][i]) % NUM_NOTES] + KEY_MODE_CHORD[keyMode][i];
    }
    return key;
}

function generateKeyNoteArray(noteIndex, keyMode) {
    let key = [];
    //calculate the 7 notes in the key based on intervals
    for (let i = 0; i < 7; i++) {
        key[i] = NOTE_LABEL[(noteIndex + KEY_MODE_INTERVAL[keyMode][i]) % NUM_NOTES];
    }
    return key;
}

////////DOM CACHING//////////////////
var canvas;
var outputSelect;
var integerNotationText;
var intervalNotationText;
var noteText;
var diatonicCheck;
var chordText;
var keySignatureInput;
var keyFormulaInput;
var keyMajorRelativeInput;

(function (window, document, undefined) {
    window.onload = init;

    function init() {
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
        diatonicCheck = document.getElementById('diatonicCheck');
        noteText = document.getElementById('noteText');
        keySignatureInput = document.getElementById('keySignatureInput');
        keyFormulaInput = document.getElementById('keyFormulaInput');
        keyMajorRelativeInput = document.getElementById('keyMajorRelativeInput');

        //register multitouch listener
        canvas.addEventListener('touchstart', function (event) {
            event.preventDefault();
            //resume audiocontext on canvas touch

            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                const rect = canvas.getBoundingClientRect();
                //transpose touch coordinates to canvas
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                console.log("touchstart.x", x, ",y:" + y + ",force:" + touch.force);
                let force = 1.0;
                if (touch.force > 0) {
                    force = touch.force;
                }
                canvasDownXY(x, y, force);
            }
        }, false);
        canvas.addEventListener('touchend', function (event) {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                const rect = canvas.getBoundingClientRect();
                //transpose touch coordinates to canvas
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                console.log("touchend.x", x, ",y:" + y);
                canvasUpXY(x, y);
            }
        }, false);

        //register key handlers
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);

        changeKey();
        renderCircle();
        clearNoteLabels();

    }

})(window, document, undefined);


function clearNoteLabels() {
    noteText.value = "";
    integerNotationText.value = "";
    intervalNotationText.value = ""
    chordText.value = "";
    diatonicCheck.checked = false;
}

///////////////INPUT HANDLING/////////////////////////////////////////
var shiftPressed = false;
var pressedKeys=[];

function keyDownHandler(event) {
    let keyPressed = String.fromCharCode(event.keyCode);
    if (pressedKeys.indexOf(keyPressed) !== -1) {
        return;
    } else {
        pressedKeys.push(keyPressed);
    }
    if (event.keyCode === 16) {
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


    const noteIndex = NOTE_MAJOR_LABEL.findIndex((element) => element === keyPressed);
    console.log("rep:" + event.repeat)
    if (noteIndex > -1 && !event.repeat) {
        console.log("noteIndex:" + noteIndex);
        playNote(noteIndex, KEYBOARD_GAIN);
    } else {
    }
}

function keyUpHandler(event) {
    let keyPressed = String.fromCharCode(event.keyCode);
    const index = pressedKeys.indexOf(keyPressed);
    if (index !== -1) {
        pressedKeys.splice(index, 1)
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
    const noteIndex = NOTE_MAJOR_LABEL.findIndex((element) => element === keyPressed);
    if (noteIndex > -1) {
        let ring = 0;
        if (event.shiftKey) {
            ring = 0;
        }
        if (event.altKey) {
            ring = 1;
        }
        if (event.ctrlKey) {
            ring = 2;
        }
        playNoteOff(noteIndex, ring);
    }

}

function changeChordModifier(modifier) {
    console.log("chord mofider:" + modifier)
    chordModifier = modifier;
}

function resetChordModifier() {
    chordModifier = [0, 0, 0, 0];
    console.log("chord modifier reset")
}

function chordDown(event, grade) {
    const pressure = ((event.pressure == null) ? KEYBOARD_GAIN : event.pressure);
    console.log("chordDown:" + grade + " pressure:" + pressure);
    //build basic chord triad
    let chordIndexes = [];
    let chromaticIndexes = [];
    let chordArray = [];
    let integerNotation ="";
    let intervalNotation = "";
    let noteTextTemp = "";

    for (let i = 0; i < 3; i++) {
        const nextChordNote = (grade + i * 2) % keyNoteFormation.length;
        const notePressed = keyNoteFormation[nextChordNote];
        console.log("notePressed:" + notePressed);
        const noteIndex = NOTE_MAJOR_LABEL.findIndex((element) => element === notePressed);
        const chromaticIndex = NOTE_LABEL.findIndex((element) => element === notePressed);
        chordIndexes.push(noteIndex);
        chordArray.push(notePressed);
        chromaticIndexes.push(chromaticIndex);
        playNote(noteIndex, pressure);

        //update all UI elements
        const separator = (i === 3) ? "" : CHORD_SEPARATOR;
        let rootDelta = chromaticIndex - chromaticIndexes[0];
        if (rootDelta < 0) {
            rootDelta = rootDelta + NUM_NOTES;
        }
        integerNotation = integerNotation + rootDelta + separator;
        intervalNotation = intervalNotation + INTEGER_2_INTERVAL[rootDelta] + separator;
        noteTextTemp = noteTextTemp + NOTE_LABEL[chromaticIndex] + separator;
    }
    //put root as default extension
    chromaticIndexes.push(chromaticIndexes[0]);
    noteText.value = noteTextTemp;
    integerNotationText.value = integerNotation;
    intervalNotationText.value = intervalNotation;
    highlightDiatonicMods(chromaticIndexes);
    diatonicCheck.checked = isDiatonic(chordArray);


    //calculate all circle intervals based on root note
    for (let i = 0; i < NOTE_MAJOR_CODE.length; i++) {
        let j = i + chordIndexes[0];
        if (j >= NOTE_MAJOR_CODE.length) {
            j = j - NOTE_MAJOR_CODE.length;
        }
        intervalStyleRing[j] = INTERVAL_COLOR[i];
        intervalTextRing[j]= INTERVAL_LABEL[i];
    }
    renderCircle();
}

function chordUp(event, grade) {
    //calculate chord notes
    //build basic chord triad
    for (let i = 0; i < 3; i++) {
        const nextChordNote = (grade + i * 2 ) % keyNoteFormation.length;
        const notePressed = keyNoteFormation[nextChordNote];
        const noteIndex = NOTE_MAJOR_LABEL.findIndex((element) => element === notePressed);
        playNoteOff(noteIndex);
    }
    resetMods();
}

function canvasDown(e) {
    //resume audiocontext on canvas mousedown
    audioCtx.resume();
    canvasDownXY(e.offsetX, e.offsetY, 1.0);
}

function keyNoteDown(event, keyIndex) {
    const pressure = ((event.pressure == null) ? KEYBOARD_GAIN : event.pressure);
    console.log("keyNoteDown:" + NOTE_MAJOR_LABEL.indexOf(keyNoteFormation[keyIndex]));
    playNote(NOTE_MAJOR_LABEL.indexOf(keyNoteFormation[keyIndex]), pressure);
}

function keyNoteUp(event, keyIndex) {
    playNoteOff(NOTE_MAJOR_LABEL.indexOf(keyNoteFormation[keyIndex]));
}

function playNote(noteIndex, force) {
    const actualMidiNote = NOTE_MAJOR_CODE[noteIndex] + octave * 12;
    pressedNotes.push(noteIndex);
    playMidiNote(actualMidiNote, force);
    renderCircle();
}

function playNoteOff(noteIndex) {
    const index = pressedNotes.indexOf(noteIndex);
    if (index > -1) { // only splice array when item is found
        pressedNotes.splice(index, 1); // 2nd parameter means remove one item only
        console.log("pressedNotes:" + pressedNotes);
    }
    const actualMidiNote = NOTE_MAJOR_CODE[noteIndex] + octave * 12;
    playMidiNoteOff(actualMidiNote);
    renderCircle();
}

function canvasDownXY(x, y, force) {
    console.log("down:" + x + "," + y);
    let found = false;
    for (let i = 0; i < NOTE_MAJOR_CODE.length; i++) {
        const noteCenterPoint = calculateCenterWithRing(i, 0);
        if (intersects(x, y, noteCenterPoint.x, noteCenterPoint.y, NOTE_MAJOR_CIRCLE_RADIUS)) {
            //calculate note delta depending on ringlevel
            playNote(i,force);
            found = true;
            break;//note found no need to go on
        }
    }

    if (!found) {
        for (let i = 0; i < NOTE_MAJOR_CODE.length; i++) {
            const noteCenterPoint = calculateCenterWithRing(i, 1);
            if (intersects(x, y, noteCenterPoint.x, noteCenterPoint.y, NOTE_MAJOR_CIRCLE_RADIUS)) {
                for (let j = 0; j < keyNoteFormation.length; j++) {
                    if (NOTE_MAJOR_LABEL[i] === keyNoteFormation[j]) {
                        console.log("keyNoteFormation:" + keyNoteFormation[j]);
                        chordDown(j, j);
                        break;
                    }
                }

            }
        }
    }
}


function canvasUp(e) {
    canvasUpXY(e.offsetX, e.offsetY);
}

function canvasUpXY(x, y) {
    console.log("up:" + x + "," + y);
    let found = false;
    for (let i = 0; i < NOTE_MAJOR_CODE.length; i++) {
        const noteCenterPoint = calculateCenterWithRing(i, 0);
        if (intersects(x, y, noteCenterPoint.x, noteCenterPoint.y, NOTE_MAJOR_CIRCLE_RADIUS)) {
            playNoteOff(i);
            found = true;
            break;
        }
    }
    if (!found) {
        for (let i = 0; i < NOTE_MAJOR_CODE.length; i++) {
            const noteCenterPoint = calculateCenterWithRing(i, 1);
            if (intersects(x, y, noteCenterPoint.x, noteCenterPoint.y, NOTE_MAJOR_CIRCLE_RADIUS)) {
                for (let j = 0; j < keyNoteFormation.length; j++) {
                    if (NOTE_MAJOR_LABEL[i] === keyNoteFormation[j]) {
                        console.log("keyNoteFormation:" + keyNoteFormation[j]);
                        chordUp(j, j);
                        break;
                    }
                }

            }
        }
    }
}


function isDiatonic(chordArray) {
    let diatonic = true;
    console.log("isDiatonic:" + chordArray + "|onkey:" + keyNoteFormation);
    for (let i = 0; i < chordArray.length; i++) {
        diatonic = diatonic && keyNoteFormation.indexOf(chordArray[i]) > -1;
    }
    console.log("isDiatonic:" + chordArray + "->" + diatonic);
    return diatonic;
}

function resetMods() {
    for (let i = 0; i < CHORD_MOD_ARR.length; i++) {
        const chordModRadio = document.getElementById('chordMod' + i);
        if (chordModRadio !== null) {
            chordModRadio.className = 'noDiatonicClass';
        }
    }
}

function highlightDiatonicMods(chromaticArray) {
    console.log("highlightDiatonicMods:" + chromaticArray);
    for (let i = 0; i < CHORD_MOD_ARR.length; i++) {
        const chordModRadio = document.getElementById('chordMod' + i);
        if (chordModRadio !== null) {
            let chordArray = [];
            for (let j = 0; j < 4; j++) {
                let noteIndex = chromaticArray[j] + CHORD_MOD_ARR[i][j];
                if (noteIndex > NOTE_LABEL.length ) {
                   noteIndex = noteIndex - NOTE_LABEL.length;
                }
                chordArray.push(NOTE_LABEL[noteIndex]);
            }
            console.log("chordArray:" + chordArray);
            if (isDiatonic(chordArray)) {
                chordModRadio.className = 'diatonicClass';
            }
        }
    }
}


function calculateNoteDeltaNoMod( ringLevel, i) {
    let midiNoteDelta = 0;
    //calculate note delta depending on ringlevel
    if (i === 1) {
        if (ringLevel === 0) {
            midiNoteDelta = 4;
        } else {
            if (ringLevel === 1) {
                midiNoteDelta = 3;
            } else {
                midiNoteDelta = 3;
            }
        }
    }
    if (i === 2) {
        if (ringLevel === 0) {
            midiNoteDelta = 7;
        } else {
            if (ringLevel === 1) {
                midiNoteDelta = 7;
            } else {
                midiNoteDelta = 6;
            }
        }
    }
    if (i === 3) {
        midiNoteDelta = 0;
    }

    return midiNoteDelta;
}

function calculateNoteDelta(ringLevel, i) {
    return calculateNoteDeltaNoMod(ringLevel,i) +  chordModifier[i];
}

function up(midiNote, ringLevel) {
    console.log("UP.midiNote:" + midiNote);
    let midiNoteDelta = 0;

    for (let i = 0; i < 4; i++) {
        midiNoteDelta = calculateNoteDelta(midiNote, ringLevel, i);
        const color = calculateNoteColorByMidi(normalizeMidiNote(midiNote + midiNoteDelta));
        drawNoteWithRing(midiNote + midiNoteDelta, ringLevel, color, i);
        midiNoteDelta = midiNote + midiNoteDelta + octave * 12;
        playMidiNoteOff(midiNoteDelta);
    }

    resetMods(midiNote, ringLevel)

}


//////////////////////////// CONFIGURATION ////////////////////////////
function changeOutput(outputMode) {
    if (changeOutput === "0") {
    } else {
        initMidi();
    }
}

function changeOctave(newValue) {
    octave = newValue;
}


function changeKey() {
    const selectedKey = document.getElementById('keySelect').value;
    const keyMode = document.getElementById('modeSelect').value;
    console.log("key:" + selectedKey + " mode:" + keyMode);
    const ctx = canvas.getContext("2d");
    //clear all canvas to remove previous key lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rootIndex = NOTE_LABEL.findIndex((element) => element === selectedKey);
    console.log("rootIndex:" + rootIndex);
    let relativeMajorNote = rootIndex + KEY_MODE_RELATIVE_MAJOR[keyMode];
    if (relativeMajorNote < 0) {
        relativeMajorNote = NUM_NOTES + relativeMajorNote;
    }
    console.log("relativeMajorNote:" + relativeMajorNote);
    keySignatureInput.value = NOTE_KEY_SIG[relativeMajorNote];
    keyFormulaInput.value = KEY_MODE_FORMULA[keyMode]
    keyMajorRelativeInput.value=KEY_MODE_MAJOR_RELATIVE[keyMode];
    keyFormation = generateKeyChordArray(rootIndex, keyMode);
    keyNoteFormation = generateKeyNoteArray(rootIndex, keyMode);
    console.log("selectedKey:" + keyFormation);
    for (let i = 0; i < keyFormation.length; i++) {
        GRADE_LABEL[i] = GRADE_LABEL[i].replace(DIM_NOTATION, '').toUpperCase();
        if (keyFormation[i].includes(DIM_NOTATION)) {
            GRADE_LABEL[i] = GRADE_LABEL[i].toLowerCase() + DIM_NOTATION;
        } else {
            if (keyFormation[i].includes(MINOR_NOTATION)) {
                GRADE_LABEL[i] = GRADE_LABEL[i].toLowerCase();
            }
        }
        document.getElementById('GradeButton' + i).value = GRADE_LABEL[i];
        document.getElementById('NoteButton' + i).value = keyNoteFormation[i];
        document.getElementById('GradeButton' + i).style.borderColor = GRADE_COLOR[i];
        const noteIndex = NOTE_LABEL.findIndex((element) => element === keyNoteFormation[i]);
        document.getElementById('NoteButton' + i).style.borderColor = NOTE_COLOR[noteIndex];
    }

    //draw all circle again
    renderCircle();
}


////////////////// CANVAS RENDERING ///////////////////////

function intersects(x, y, cx, cy, r) {
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= r * r;
}

function calculateNoteCenter(noteIndex, radius) {
    //calculate note position based on angle
    //divide by 12, the possible notes based on noteindex[0,11]
    //use PI/2*3 to translate to canvas coordinates, where +y goes down
    const noteAngle = ((((2 * Math.PI) / NUM_NOTES) * noteIndex) + Math.PI / 2 * 3);
    //noteAngle= noteAngle / (noteAngle % Math.PI);
    //apply polar coordinates to calculate note position in the ring
    //add the canvas half to move the circle center in the center of canvas
    const x = radius * Math.cos(noteAngle) + (canvas.width / 2);
    const y = radius * Math.sin(noteAngle) + (canvas.width / 2);
    return {x, y};
}

function majorNoteRadius() {
    return canvas.width / 2 - ((canvas.width / 2 - innerRingRadius(canvas.width)) / 2);
}


function innerRingRadius() {
    //inner ring at 3/4 of total radius
    return canvas.width / 2 / 4 * 3;
}

function dimRingRadius() {
    //dim ring at 1/4 of total radius
    return canvas.width / 2 / 4 * 2;
}

function renderCircle() {
    const ctx = canvas.getContext("2d");

    //draw outer and inner circles
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();

    ctx.arc(canvas.width / 2, canvas.height / 2, innerRingRadius(), 0, 2 * Math.PI);
    ctx.stroke();

    ctx.arc(canvas.width / 2, canvas.height / 2, dimRingRadius(), 0, 2 * Math.PI);
    ctx.stroke();

    //dividers needs to split the quarter of the whole circumference in three.
    //calculate circumference. divide by 4 parts
    //divide by 3 to get the 2 lines per quarter
    //divide by 2 to calculate delta from square center
    const thirdDivisionDelta = (canvas.width * 3.14) / 4 / 3 / 2;
    //console.log("divDelta:" + thirdDivisionDelta);
    //apply delta to the square center
    const point1 = canvas.width / 2 - thirdDivisionDelta;
    const point2 = canvas.width / 2 + thirdDivisionDelta;
    //console.log("point1:" + point1);
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
    for (let i = 0; i < NOTE_MAJOR_CODE.length; i++) {
        let noteObject = {
            index: i,
            ring: 0,
            outerCircleStyle: calculateToneColor(0, i),
            innerCircleStyle: calculateNoteColor(0, i),
            text: NOTE_MAJOR_LABEL[i],
            textFont: "15px Arial",
            textStyle: "black",
        }
        drawNoteIndex(noteObject);
    }

    //draw grades
    for (let i = 0; i < NOTE_MAJOR_CODE.length; i++) {
        for (let j = 0; j < keyNoteFormation.length; j++) {
            if (NOTE_MAJOR_LABEL[i] === keyNoteFormation[j]) {
                let noteObject = {
                    index: i,
                    ring: 1,
                    outerCircleStyle: GRADE_COLOR[j],
                    innerCircleStyle: "white",
                    text: GRADE_LABEL[j],
                    textFont: "15px Arial",
                    textStyle: "black",
                }
                drawNoteIndex(noteObject);
            }
        }
    }

    //draw pressed/interval notes
    for (let i = 0; i < NOTE_MAJOR_CODE.length; i++) {
        let innerStyle = "white";
        if ( pressedNotes.some(element => element === i)) {
            innerStyle = "salmon";
        }
        let noteObject = {
            index: i,
            ring: 2,
            outerCircleStyle: intervalStyleRing[i],
            innerCircleStyle: innerStyle,
            text: intervalTextRing[i],
            textFont: "15px Arial",
            textStyle: "black",
        }
        drawNoteIndex(noteObject);

    }
}

function calculateToneColor(i, j) {
    let color = DISABLED_NOTE_COLOR;
    const noteIndex = NOTE_CODE.findIndex((element) => element === NOTE_CIRCLE_CODE[i][j]);
    if (noteIndex > -1) {
        color = NOTE_COLOR[noteIndex];
    }
    return color;
}

function calculateNoteColor(i, j) {
    let color = DISABLED_NOTE_COLOR;
    const noteIndex = NOTE_CODE.findIndex((element) => element === NOTE_CIRCLE_CODE[i][j]);
    if (noteIndex > -1) {
        color = NOTE_NATURAL_ART_COLOR[noteIndex];
    }
    return color;
}

function calculateNoteColorByMidi(midiNote) {
    let color = DISABLED_NOTE_COLOR;
    const noteIndex = NOTE_CODE.findIndex((element) => element === midiNote);
    if (noteIndex > -1) {
        color = NOTE_NATURAL_ART_COLOR[noteIndex];
    }
    return color;
}

function drawNoteWithRing(midiNote, ringLevel, color, chordNoteIndex) {
    const noteDimIndex = findNoteIndex(midiNote, 2);
    const noteMinorIndex = findNoteIndex(midiNote, 1);
    const noteMajorIndex = findNoteIndex(midiNote, 0);
    drawNoteIndex(noteMajorIndex, 0, color);
    drawNoteIndex(noteMinorIndex, 1, color);
    drawNoteIndex(noteDimIndex, 2, color);
}


function calculateCenterWithRing(noteIndex, ringLevel) {
    let noteCenterPoint;
    if (ringLevel === 0) {
        noteCenterPoint = calculateNoteCenter(noteIndex, majorNoteRadius());
    } else {
        if (ringLevel === 1) {
            noteCenterPoint = calculateNoteCenter(noteIndex, innerRingRadius() - NOTE_MINOR_POSITION_DELTA);
        } else {
            noteCenterPoint = calculateNoteCenter(noteIndex, dimRingRadius() - NOTE_DIM_POSITION_DELTA);
        }
    }
    return noteCenterPoint;
}

function drawNoteIndex(noteObject) {

    const ctx = canvas.getContext("2d");
    const noteCenterPoint = calculateCenterWithRing(noteObject.index, noteObject.ring);

    ctx.beginPath();
    ctx.fillStyle = noteObject.outerCircleStyle;
    ctx.arc(noteCenterPoint.x, noteCenterPoint.y, NOTE_CIRCLE_RADIUS[noteObject.ring] + 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = noteObject.innerCircleStyle;
    ctx.arc(noteCenterPoint.x, noteCenterPoint.y, NOTE_CIRCLE_RADIUS[noteObject.ring], 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();



    ctx.fillStyle = 'black';
    ctx.font = "25px Arial";
    //make coordinate correction so text is centered in the circle
    ctx.fillText(noteObject.text, noteCenterPoint.x - 20, noteCenterPoint.y + 10);


}

function playMidiNote(adjustedMidiNote, force) {
    if (outputSelect.value === "0") {
        playOscillatorNote(adjustedMidiNote, force);
    } else {
        playExtMidiNote(adjustedMidiNote, force);
    }
}

function playMidiNoteOff(adjustedMidiNote) {
    if (outputSelect.value === "0") {
        playOscillatorNoteOff(adjustedMidiNote);
    } else {
        playExtMidiNoteOff(adjustedMidiNote);
    }
}


////////////////////// built-in midi OUTPUT //////////////////////

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
        onerror: (e) => {
            window.alert("browser not supported. Use Chrome:" + e.message);
        }
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

function playOscillatorNote(adjustedMidiNote, force) {
    MIDI.noteOn(0, adjustedMidiNote, forceToMidiVelocity(force), 0);
}

function playOscillatorNoteOff(adjustedMidiNote) {
    MIDI.noteOff(0, adjustedMidiNote, 0);
}

/////////////////////////////Ext MIDI OUTPUT///////////1///////////
const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
var extMidiOutput;
var midiOut;
var midiVelocity = 127;
var midiChannel = 0;

function initMidi() {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({sysex: true}).then(onMIDISuccess, onMIDIFailure);
    } else {
        console.log("no midi support");
    }
}

function changeMidiChannel(channel) {
    midiChannel = channel;
}

function onMIDISuccess(midiAccess) {
    console.log(midiAccess);
    extMidiOutput = midiAccess.outputs;
    const midiOutputSelect = document.getElementById('midiOutputSelect');
    for (let output of extMidiOutput.values()) {
        const opt = document.createElement('option');
        opt.value = output.id;
        opt.innerHTML = output.name;
        midiOutputSelect.appendChild(opt);
        midiOut = output;
    }
}

function changeMidiOutput() {
    const midiOutputSelect = document.getElementById('midiOutputSelect');
    for (let output of extMidiOutput.values()) {
        if (output.id === midiOutputSelect.value) {
            midiOut = output;
            break;
        }
    }
}

function playExtMidiNote(midiNote, force) {
    console.log("turn on:" + midiNote);
    midiOut.send([NOTE_ON | midiChannel, midiNote, midiVelocity * force]);
}

function playExtMidiNoteOff(midiNote) {
    console.log("turn off:" + midiNote);
    midiOut.send([NOTE_OFF | midiChannel, midiNote, midiVelocity]);
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}
