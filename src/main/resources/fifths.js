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
const NOTE_COLOR = ['#FF3333', '#33FF8D', '#FF8A33', '#3358FF', '#FFFC33', '#FF33C1', '#33FF33', '#FF6133', '#33FCFF', '#FFB233', '#A833FF', '#93FF33'];

const KEY_MODE_ROOT_RING = [0, 1, 1, 0, 0, 1, 2];
const KEY_MODE_ROOT_NOTATION = [MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION];

const IONIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 11];
const IONIAN_CHORD = [MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION];
const DORIAN_INTERVAL = [0, 2, 3, 5, 7, 9, 10];
const DORIAN_CHORD = [MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION, MAJOR_NOTATION];
const PRHYGIAN_INTERVAL = [0, 1, 3, 5, 7, 8, 10];
const PRHYGIAN_CHORD = [MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION, MAJOR_NOTATION, MINOR_NOTATION];
const LYDIAN_INTERVAL = [0, 2, 4, 6, 7, 9, 11];
const LYDIAN_CHORD = [MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION];
const MIXOLYDIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 10];
const MIXOLYDIAN_CHORD = [MAJOR_NOTATION, MINOR_NOTATION, DIM_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION];
const AEOLIAN_INTERVAL = [0, 2, 3, 5, 7, 8, 10];
const AEOLIAN_CHORD = [MINOR_NOTATION, DIM_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION];
const LOCRIAN_INTERVAL = [0, 1, 3, 5, 6, 8, 10];
const LOCRIAN_CHORD = [DIM_NOTATION, MAJOR_NOTATION, MINOR_NOTATION, MINOR_NOTATION, MAJOR_NOTATION, MAJOR_NOTATION, MINOR_NOTATION];

const KEY_MODE_INTERVAL = [IONIAN_INTERVAL, DORIAN_INTERVAL, PRHYGIAN_INTERVAL, LYDIAN_INTERVAL, MIXOLYDIAN_INTERVAL, AEOLIAN_INTERVAL, LOCRIAN_INTERVAL];
const KEY_MODE_CHORD = [IONIAN_CHORD, DORIAN_CHORD, PRHYGIAN_CHORD, LYDIAN_CHORD, MIXOLYDIAN_CHORD, AEOLIAN_CHORD, LOCRIAN_CHORD];


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

const noteLabel = [NOTE_MAJOR_LABEL, NOTE_MINOR_LABEL, NOTE_DIM_LABEL];
const noteCode = [NOTE_MAJOR_CODE, NOTE_MINOR_CODE, NOTE_DIM_CODE];
const NOTE_CIRCLE_RADIUS = [NOTE_MAJOR_CIRCLE_RADIUS, NOTE_MINOR_CIRCLE_RADIUS, NOTE_DIM_CIRCLE_RADIUS];


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
const EXT_11_FORMULA = [0, 0, 0, 15];
const EXT_MAJ11_FORMULA = [0, 0, 0, 16];
const EXT_B13_FORMULA = [0, 0, 0, 17];
const EXT_13_FORMULA = [0, 0, 0, 18];
const CHORD_MOD_ARR = [SUS2_FORMULA, B3_FORMULA, SUS4_FORMULA, B5_FORMULA, AUG_FORMULA, EXT_7_FORMULA, EXT_MAJ7_FORMULA, EXT_B9_FORMULA, EXT_9_FORMULA, EXT_11_FORMULA, EXT_MAJ11_FORMULA, EXT_B13_FORMULA, EXT_13_FORMULA, EXT_6_FORMULA];

const DISABLED_NOTE_COLOR = 'grey';
const TONIC_COLOR = '#FFFFFF';
const DOMINANT_COLOR = '#F6F6F6';
const SUBDOMINANT_COLOR = '#F9F9F9';
const FORTH_COLOR = '#F3F3F3';
const keyLineColor = 'red';
const NOTE_CHORD_COLOR = [TONIC_COLOR, SUBDOMINANT_COLOR, DOMINANT_COLOR, FORTH_COLOR];
var octave = 3;
var notePressGain = 0.8;//the gain applied when note is pressed
var keyFormation = [];
var keyNoteFormation = [];
var chordModifier = [0, 0, 0, 0]

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
    return noteCode[ringLevel].findIndex((element) => element === normalizedMidiNote);
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

function keyDownHandler(event) {
    let keyPressed = String.fromCharCode(event.keyCode);
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

        down(NOTE_MAJOR_CODE[noteIndex], ring, notePressGain);
    } else {
    }
}

function keyUpHandler(event) {
    let keyPressed = String.fromCharCode(event.keyCode);
    if (event.keyCode === 16) {
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
        up(NOTE_MAJOR_CODE[noteIndex], ring);
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
    //find grade in current key, and search note code.
    const notePressed = keyFormation[grade];
    const pressure = ((event.pressure == null) ? 0.5 : event.pressure);
    for (let i = 0; i < noteLabel.length; i++) {
        const noteIndex = noteLabel[i].findIndex((element) => element === notePressed);
        if (noteIndex > -1) {
            console.log("root note:" + noteCode[i][noteIndex]);
            down(noteCode[i][noteIndex], i, pressure);
            break;
        }
    }
    const selectedChordMod = document.querySelector('input[type="radio"][name="chordModifierRadio"]:checked');
    chordText.value = notePressed + (selectedChordMod === null ? "" : selectedChordMod.value);

}

function chordUp(event, grade) {
    //calculate chord notes
    const notePressed = keyFormation[grade];

    console.log("chordup:" + notePressed);
    for (let i = 0; i < noteLabel.length; i++) {
        const noteIndex = noteLabel[i].findIndex((element) => element === notePressed);
        if (noteIndex > -1) {
            console.log("chordup:" + noteCode[i][noteIndex]);
            up(noteCode[i][noteIndex], i);
        }
    }
}

function canvasDown(e) {
    //resume audiocontext on canvas mousedown
    audioCtx.resume();
    canvasDownXY(e.offsetX, e.offsetY, 1.0);
}

function canvasDownXY(x, y, force) {
    console.log("down:" + x + "," + y);
    for (let i = 0; i < noteCode.length; i++) {
        for (let j = 0; j < noteCode[i].length; j++) {
            const noteCenterPoint = calculateCenterWithRing(j, i);
            if (intersects(x, y, noteCenterPoint.x, noteCenterPoint.y, NOTE_CIRCLE_RADIUS[i])) {
                down(noteCode[i][j], i, force);
                break;//note found no need to go on
            }
        }
    }
}

function canvasUp(e) {
    canvasUpXY(e.offsetX, e.offsetY);
}

function canvasUpXY(x, y) {
    for (let i = 0; i < noteCode.length; i++) {
        for (let j = 0; j < noteCode[i].length; j++) {
            const noteCenterPoint = calculateCenterWithRing(j, i);
            if (intersects(x, y, noteCenterPoint.x, noteCenterPoint.y, NOTE_CIRCLE_RADIUS[i])) {
                up(noteCode[i][j], i);
                break;
            }
        }
    }
}


function isDiatonic(chordArray) {
    console.log("isDiatonic:" + chordArray)
    let diatonic = true;
    for (let i = 0; i < chordArray.length; i++) {
        diatonic = diatonic && keyNoteFormation.indexOf(chordArray[i]) > -1;
    }
    return diatonic;
}

function resetMods(midiNote, ringLevel) {
    for (let i = 0; i < CHORD_MOD_ARR.length; i++) {
        const chordModRadio = document.getElementById('chordMod' + i);
        chordModRadio.className = 'noDiatonicClass';
    }
}

function highlightDiatonicMods(midiNote, ringLevel) {
    for (let i = 0; i < CHORD_MOD_ARR.length; i++) {
        const chordModRadio = document.getElementById('chordMod' + i);
        let chordArray = [];
        for (let j = 0; j < 4; j++) {
            const midiNoteDelta = calculateNoteDeltaNoMod(midiNote, ringLevel, j) + CHORD_MOD_ARR[i][j];
            const adjustedMidiNote = midiNote + midiNoteDelta;
            const normNote = normalizeMidiNote(adjustedMidiNote)
            const noteIndex = NOTE_CODE.findIndex((element) => element === normNote);
            chordArray.push(NOTE_LABEL[noteIndex]);

        }
        if (isDiatonic(chordArray)) {
            chordModRadio.className = 'diatonicClass';
        }
    }
}

function down(midiNote, ringLevel, force) {
    clearNoteLabels();
    const octaveSelectVal = octave;

    let midiNoteDelta = 0;
    let chordArray = [];
    for (let i = 0; i < 4; i++) {
        const separator = (i === 3) ? "" : CHORD_SEPARATOR;

        //calculate note delta depending on ringlevel
        midiNoteDelta = calculateNoteDelta(midiNote, ringLevel, i);
        const adjustedMidiNote = midiNote + midiNoteDelta;
        const actualMidiNote = adjustedMidiNote + octaveSelectVal * 12;

        if (outputSelect.value === "0") {
            playOscillatorNote(actualMidiNote, force);
        } else {
            playMidiNote(actualMidiNote, force);
        }

        //update all UI elements

        integerNotationText.value = integerNotationText.value + midiNoteDelta + separator;
        intervalNotationText.value = intervalNotationText.value + INTEGER_2_INTERVAL[midiNoteDelta] + separator;
        const normNote = normalizeMidiNote(adjustedMidiNote)
        const noteIndex = NOTE_CODE.findIndex((element) => element === normNote);
        noteText.value = noteText.value + NOTE_LABEL[noteIndex] + separator;
        chordArray.push(NOTE_LABEL[noteIndex]);

        drawNoteWithRing(adjustedMidiNote, ringLevel, NOTE_CHORD_COLOR[i], i);

    }
    highlightDiatonicMods(midiNote, ringLevel);
    diatonicCheck.checked = isDiatonic(chordArray);

}


function calculateNoteDeltaNoMod(midiNote, ringLevel, i) {
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

function calculateNoteDelta(midiNote, ringLevel, i) {
    return calculateNoteDeltaNoMod(midiNote,ringLevel,i) +  chordModifier[i];
}

function up(midiNote, ringLevel) {
    console.log("UP.midiNote:" + midiNote);
    let midiNoteDelta = 0;

    for (let i = 0; i < 4; i++) {
        midiNoteDelta = calculateNoteDelta(midiNote, ringLevel, i);
        const color = calculateNoteColorByMidi(normalizeMidiNote(midiNote + midiNoteDelta));
        drawNoteWithRing(midiNote + midiNoteDelta, ringLevel, color, i);
        midiNoteDelta = midiNote + midiNoteDelta + octave * 12;
        if (outputSelect.value === "0") {
            playOscillatorNoteOff(midiNoteDelta);
        }
        if (outputSelect.value === "1") {
            playMidiNoteOff(midiNoteDelta);
        }
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
    const ctx = canvas.getContext("2d");
    const ringLevel = KEY_MODE_ROOT_RING[keyMode];
    //clear all canvas to remove previous key lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rootCircleIndex = noteLabel[ringLevel].findIndex((element) => element === (selectedKey + KEY_MODE_ROOT_NOTATION[keyMode]));
    const rootIndex = NOTE_LABEL.findIndex((element) => element === selectedKey);
    keyFormation = generateKeyChordArray(rootIndex, keyMode);
    keyNoteFormation = generateKeyNoteArray(rootIndex, keyMode);
    console.log("selectedKey:" + keyFormation);
    ctx.strokeStyle = keyLineColor;
    const tonicPoint = calculateCenterWithRing(rootCircleIndex, ringLevel);
    for (let i = 0; i < keyFormation.length; i++) {
        document.getElementById('GradeButton' + i).value = document.getElementById('GradeButton' + i).value.replace(DIM_NOTATION, '');
        ctx.beginPath();
        ctx.moveTo(tonicPoint.x, tonicPoint.y);
        if (keyFormation[i].includes(DIM_NOTATION)) {
            const nextNoteIndex = NOTE_DIM_LABEL.findIndex((element) => element === keyFormation[i]);
            const nextDimNotePoint = calculateNoteCenter(nextNoteIndex, dimRingRadius(canvas.width) - NOTE_DIM_POSITION_DELTA);
            ctx.lineTo(nextDimNotePoint.x, nextDimNotePoint.y);
            document.getElementById('GradeButton' + i).value = document.getElementById('GradeButton' + i).value.toLowerCase() + DIM_NOTATION;
        } else {
            if (keyFormation[i].includes(MINOR_NOTATION)) {
                const nextNoteIndex = NOTE_MINOR_LABEL.findIndex((element) => element === keyFormation[i]);
                const nextMinorNotePoint = calculateNoteCenter(nextNoteIndex, innerRingRadius(canvas.width) - NOTE_MINOR_POSITION_DELTA);
                ctx.lineTo(nextMinorNotePoint.x, nextMinorNotePoint.y);
                document.getElementById('GradeButton' + i).value = document.getElementById('GradeButton' + i).value.toLowerCase();
            } else {
                const nextNoteIndex = NOTE_MAJOR_LABEL.findIndex((element) => element === keyFormation[i]);
                const nextMajorNotePoint = calculateNoteCenter(nextNoteIndex, majorNoteRadius());
                ctx.lineTo(nextMajorNotePoint.x, nextMajorNotePoint.y);
                document.getElementById('GradeButton' + i).value = document.getElementById('GradeButton' + i).value.toUpperCase();
            }
        }
        ctx.stroke();
    }
    //revert back stroke style
    ctx.strokeStyle = 'black';
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
    console.log("divDelta:" + thirdDivisionDelta);
    //apply delta to the square center
    const point1 = canvas.width / 2 - thirdDivisionDelta;
    const point2 = canvas.width / 2 + thirdDivisionDelta;
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
    for (let i = 0; i < noteCode.length; i++) {
        for (let j = 0; j < noteCode[i].length; j++) {
            drawNoteIndex(j, i, calculateNoteColor(i, j));
        }
    }
}

function calculateNoteColor(i, j) {
    let color = DISABLED_NOTE_COLOR;
    const noteIndex = NOTE_CODE.findIndex((element) => element === noteCode[i][j]);
    if (noteIndex > -1) {
        color = NOTE_COLOR[noteIndex];
    }
    return color;
}

function calculateNoteColorByMidi(midiNote) {
    let color = DISABLED_NOTE_COLOR;
    const noteIndex = NOTE_CODE.findIndex((element) => element === midiNote);
    if (noteIndex > -1) {
        color = NOTE_COLOR[noteIndex];
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

function drawNoteIndex(noteIndex, ringLevel, style) {
    const ctx = canvas.getContext("2d");
    const noteCenterPoint = calculateCenterWithRing(noteIndex, ringLevel);
    ctx.beginPath();
    ctx.fillStyle = style;
    ctx.arc(noteCenterPoint.x, noteCenterPoint.y, NOTE_CIRCLE_RADIUS[ringLevel], 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.font = "25px Arial";
    //make coordinate correction so text is centered in the circle
    ctx.fillText(noteLabel[ringLevel][noteIndex], noteCenterPoint.x - 20, noteCenterPoint.y + 10);


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

function playMidiNote(midiNote, force) {
    console.log("turn on:" + midiNote);
    midiOut.send([NOTE_ON | midiChannel, midiNote, midiVelocity * force]);
}

function playMidiNoteOff(midiNote) {
    console.log("turn off:" + midiNote);
    midiOut.send([NOTE_OFF | midiChannel, midiNote, midiVelocity]);
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}
