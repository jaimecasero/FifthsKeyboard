////////////////////////MODEL //////////////////////////////////////
const FLAT_CHAR = "&flat;";
const SHARP_CHAR = "&sharp;";
const NAT_CHAR = "&natur;";
const NOTE_CHAR = "&sung;";
const FRET_NUM = 13;
const NUM_NOTES = 12;
const NOTE_LABEL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTE_FIFTHS_COLOR = ['#FF3333', '#33FF8D', '#FF8A33', '#3358FF', '#FFFC33', '#FF33C1', '#33FF33', '#FF6133', '#33FCFF', '#FFB233', '#A833FF', '#93FF33'];

const STD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];
const FOURTHS_TUNING = ['E', 'A', 'D', 'G', 'C', 'F'];
const DROPD_TUNING = ['D', 'A', 'D', 'G', 'C', 'F'];
const DAD_TUNING = ['D', 'A', 'D', 'G', 'A', 'D'];
const OPEND_TUNING = ['D', 'A', 'D', 'Gb', 'A', 'D'];
const OPENE_TUNING = ['E', 'B', 'E', 'Ab', 'B', 'E'];
const OPENG_TUNING = ['D', 'G', 'D', 'G', 'B', 'D'];
const OPENA_TUNING = ['E', 'A', 'E', 'A', 'Db', 'E'];
const OPENC6_TUNING = ['C', 'A', 'C', 'G', 'C', 'E'];
const OPENC_TUNING = ['C', 'G', 'C', 'G', 'C', 'E'];

const TUNING_ARRAY= [STD_TUNING,FOURTHS_TUNING, DROPD_TUNING, DAD_TUNING, OPEND_TUNING, OPENE_TUNING, OPENG_TUNING, OPENA_TUNING, OPENC6_TUNING, OPENC_TUNING];

const CHORD_COLOR=["red", "green", "blue", "orange", "pink", "purple", "brown", "brown", "black", "white"];
const IN_KEY_RADIUS=14;
const IN_KEY_STYLE="bold 10px Arial";

const FRET_MARKERS = [3, 5, 7, 9,12];
const FRET_WIDTH_RATIO= 1.5;
var STRING_SEPARATION;
var STRING_SEPARATION_HALF;
const STRING_OFFSET = [10,5,0,0,-6,-11];
var FRET_SEPARATION;
var FRET_SEPARATION_ARRAY=[];

const LYDIAN_INTERVAL = [0, 2, 4, 6, 7, 9, 11];
const IONIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 11];
const MIXOLYDIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 10];
const DORIAN_INTERVAL = [0, 2, 3, 5, 7, 9, 10];
const AEOLIAN_INTERVAL = [0, 2, 3, 5, 7, 8, 10];
const PRHYGIAN_INTERVAL = [0, 1, 3, 5, 7, 8, 10];
const LOCRIAN_INTERVAL = [0, 1, 3, 5, 6, 8, 10];
const KEY_MODE_INTERVAL = [LYDIAN_INTERVAL, IONIAN_INTERVAL, MIXOLYDIAN_INTERVAL, DORIAN_INTERVAL, AEOLIAN_INTERVAL, PRHYGIAN_INTERVAL, LOCRIAN_INTERVAL];


const MAJOR_FORMULA = [0, 4, 7, 0];
const MINOR_FORMULA = [0, 3, 7, 0];
const SUS2_FORMULA = [0, 2, 7, 0];
const SUS4_FORMULA = [0, 5, 7, 0];
const DIM_FORMULA = [0, 3, 6, 0];
const SIXTH_FORMULA = [0, 4, 7, 9];
const MINOR_SIXTH_FORMULA = [0, 4, 7, 8];
const MAJOR7_FORMULA = [0, 4, 7, 11];
const SEVENTH_FORMULA = [0, 4, 7, 10];
const MINOR7_FORMULA = [0, 3, 7, 10];
const NINTH_FORMULA = [0, 4, 7, 10, 14];
const ELEVENTH_FORMULA = [0, 4, 7, 10, 14, 17];
const THIRTEENTH_FORMULA = [0, 4, 7, 10, 14, 17, 21];
const CHORD_MOD_ARR = [MAJOR_FORMULA, MINOR_FORMULA, SUS2_FORMULA, SUS4_FORMULA, DIM_FORMULA, SIXTH_FORMULA, MINOR_SIXTH_FORMULA, MAJOR7_FORMULA, SEVENTH_FORMULA, MINOR7_FORMULA, NINTH_FORMULA, ELEVENTH_FORMULA, THIRTEENTH_FORMULA];

///// Data Model /////
let CALCULATED_KEY = [];
let CALCULATED_CHORD = [];

////////DOM CACHING//////////////////
var keySelect;
var modeSelect;
var rootChordSelect;
var chordSelect;
var visualizationSelect;
var fretCanvas;
var calculatedKeyInput;
var calculatedChordInput;
var tuningSelect;


(function (window, document, undefined) {
    window.onload = init;

    function init() {
        // the code to be called when the dom has loaded
        // #document has its nodes
        console.log("init");
        //cache DOM elements for better performance
        keySelect = document.getElementById('keySelect');
        modeSelect = document.getElementById('modeSelect');
        rootChordSelect = document.getElementById('rootChordSelect');
        chordSelect = document.getElementById('chordSelect');
        visualizationSelect = document.getElementById('visualizationSelect');
        fretCanvas = document.getElementById('fretCanvas');
        calculatedKeyInput = document.getElementById('calculatedKeyInput');
        calculatedChordInput = document.getElementById('calculatedChordInput');
        tuningSelect = document.getElementById('tuningSelect');

        for (let i=0; i <= FRET_NUM; i++) {
            let sep = calculateFretHeight(i);
            console.log("sep:" + sep);
            FRET_SEPARATION_ARRAY.push(sep);
        }
        STRING_SEPARATION = fretCanvas.width / STD_TUNING.length;
        STRING_SEPARATION_HALF = STRING_SEPARATION/2;
        renderFretboard();
    }
})(window, document, undefined);



function calculateKey() {
    CALCULATED_KEY = [];
    let keyNoteOffset = parseInt(keySelect.value, 10);
    for (let i = 0; i < KEY_MODE_INTERVAL[modeSelect.value].length; i++) {
        let keyDegreeIndex = (keyNoteOffset + KEY_MODE_INTERVAL[modeSelect.value][i]) % NOTE_LABEL.length;
        CALCULATED_KEY.push(keyDegreeIndex);
    }
    calculatedKeyInput.value = CALCULATED_KEY.map(index => NOTE_LABEL[index]).join(",");
}

function calculateChord() {
    CALCULATED_CHORD = [];
    let keyNoteOffset = parseInt(rootChordSelect.value, 10);
    console.log("root chord:" + rootChordSelect.value);
    for (let i = 0; i < CHORD_MOD_ARR[chordSelect.value].length; i++) {
        let noteIndex = (keyNoteOffset + CHORD_MOD_ARR[chordSelect.value][i]) % NOTE_LABEL.length;
        console.log("noteIndex:" + noteIndex);
        CALCULATED_CHORD.push(noteIndex);
    }
    calculatedChordInput.value = CALCULATED_CHORD.map(index => NOTE_LABEL[index]).join(",");
}

function retrieveTuning() {
    return TUNING_ARRAY[parseInt(tuningSelect.value, 10)];
}

function calculateFretNoteIndex(stringIndex, fretIndex) {
    let openNote = retrieveTuning()[stringIndex];

    let openNoteOffset = NOTE_LABEL.indexOf(openNote);
    return (fretIndex + openNoteOffset - 1) % NOTE_LABEL.length;
}

function calculateFretNote(stringIndex, fretIndex) {
    let noteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return NOTE_LABEL[noteIndex];
}
function isFretOnKey(stringIndex, fretIndex) {
    let fretNoteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return CALCULATED_KEY.indexOf(fretNoteIndex);
}

function isFretOnChord(stringIndex, fretIndex) {
    let fretNoteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return CALCULATED_CHORD.indexOf(fretNoteIndex);
}

function calculateFretHeight(fretIndex) {
    let wholeFret = (fretCanvas.height * 2) - 150; //150 gives some space to reach 12 fret in canvas
    return wholeFret - (wholeFret / (2 ** (fretIndex /12)));
}


function renderFretboard() {
    calculateKey();
    calculateChord();
    const ctx = fretCanvas.getContext("2d");
    // Clear the entire canvas
    ctx.clearRect(0, 0, fretCanvas.width, fretCanvas.height);


    //draw strings
    for (let i=0; i < STD_TUNING.length ; i++) {
        ctx.beginPath();
        ctx.moveTo(STRING_SEPARATION * i + STRING_OFFSET[i] + STRING_SEPARATION_HALF, 0);
        ctx.lineTo(STRING_SEPARATION * i + STRING_SEPARATION_HALF, fretCanvas.height);
        ctx.stroke();
    }

    //draw frets & markers
    for (let i=0; i <= FRET_NUM ; i++){

        if (i === 1 ) {
            //draw nut line thicker
            ctx.lineWidth = 5;
        }
        ctx.beginPath();
        const FRET_Y = FRET_SEPARATION_ARRAY[i];
        const FRET_OFFSET=FRET_Y - calculateFretHeight(i -1);
        FRET_SEPARATION = FRET_OFFSET;
        console.log("fret:" + FRET_Y);
        ctx.moveTo(STRING_SEPARATION_HALF, FRET_Y );
        ctx.lineTo(fretCanvas.width - STRING_SEPARATION + STRING_SEPARATION_HALF, FRET_Y);
        ctx.stroke();
        ctx.lineWidth = 1;

        //draw fret markers if appropriate
        if (FRET_MARKERS.indexOf(i - 1 ) > -1) {
            let markerHeight = FRET_Y - ( FRET_OFFSET ) / 2;
            if ((i - 1)  % 2 === 0) {
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.arc(STRING_SEPARATION , markerHeight, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.arc(STRING_SEPARATION * 5, markerHeight, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.arc(STRING_SEPARATION * 3, markerHeight, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        }

        for (let j=0; j < STD_TUNING.length ; j++) {
            drawNoteIndex(i+1, j);
        }
    }

}


function drawNoteIndex(fret, string) {
    let noteIndex = calculateFretNoteIndex(string, fret);
    let note = NOTE_LABEL[noteIndex];
    let chordIndex = isFretOnChord(string,fret);
    let noteDegree =CALCULATED_KEY.indexOf(noteIndex);
    let keyIndex = isFretOnKey(string,fret);
    let modeIndex = parseInt(modeSelect.value, 10);
    const ctx = fretCanvas.getContext("2d");
    const NOTE_CENTER_X=STRING_SEPARATION * string + STRING_OFFSET[string] * (1 - fret / 12)  + STRING_SEPARATION_HALF;
    let currentFretHeight = calculateFretHeight(fret);
    const FRET_OFFSET= FRET_SEPARATION / 2;
    const NOTE_CENTER_Y= currentFretHeight - FRET_OFFSET;
    let radius = IN_KEY_RADIUS - 3 ;

    //stack/rectangle lines
    if (visualizationSelect.value === "Stack") {
        if ( (modeIndex<3 && (noteDegree === 0 || noteDegree === 1)) ||
            (modeIndex>2 && ( noteDegree === 2 || noteDegree === 3))) {
            //if root note draw bottom/top stack
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 6;
            ctx.moveTo(NOTE_CENTER_X, NOTE_CENTER_Y);
            ctx.lineTo(NOTE_CENTER_X, NOTE_CENTER_Y + FRET_SEPARATION * 2 - FRET_OFFSET);
            ctx.stroke()
        }
        if ((modeIndex<3 && (noteDegree === 5 || noteDegree === 2)) ||
            (modeIndex>2 && (noteDegree === 0 || noteDegree === 4))) {
            //top/bottom rectagle
            ctx.beginPath();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 6;
            ctx.moveTo(NOTE_CENTER_X, NOTE_CENTER_Y);
            ctx.lineTo(NOTE_CENTER_X, NOTE_CENTER_Y + FRET_SEPARATION * 3 - FRET_OFFSET);
            ctx.stroke()
        }

        if ( (modeIndex<3 && (noteDegree ===1 || noteDegree === 4 || noteDegree === 2 || noteDegree === 5 )) ||
            ( modeIndex>2 && (noteDegree === 6 || noteDegree === 3 || noteDegree === 0 || noteDegree === 4 ))) {
            //stack line
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 6;
            ctx.moveTo(NOTE_CENTER_X, NOTE_CENTER_Y);
            let targetY = NOTE_CENTER_Y;
            if (tuningSelect.value === "0" && string === 3) {
                targetY = NOTE_CENTER_Y + FRET_SEPARATION;
            }
            ctx.lineTo(NOTE_CENTER_X + STRING_SEPARATION, targetY);
            ctx.stroke()

        }
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
    }


    if (keyIndex > - 1) {
        radius = IN_KEY_RADIUS - 3;

        ctx.beginPath();
        ctx.fillStyle = "white";
        if (keyIndex > -1) {
            radius = IN_KEY_RADIUS;
        }
        console.log("vis:" + visualizationSelect.value);
        switch (visualizationSelect.value) {
            case "Natural":
                if (note.endsWith("b")) {
                    ctx.fillStyle = "grey";
                } else {
                    ctx.fillStyle = "white";
                }
                break;
            case "Fifths":
                ctx.fillStyle = NOTE_FIFTHS_COLOR[noteIndex];
                console.log("color:" + ctx.fillStyle);
                break;
        }
        ctx.arc(NOTE_CENTER_X, NOTE_CENTER_Y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "white";
        if (chordIndex > -1) {
            ctx.fillStyle = CHORD_COLOR[chordIndex];
        }
        ctx.arc(NOTE_CENTER_X, NOTE_CENTER_Y, radius - 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();


        // text inside circle
        ctx.fillStyle = 'black';
        if (chordIndex > -1) {
            ctx.fillStyle = "white";
        }

        ctx.font = "10px Arial";
        if (keyIndex > -1) {
            note = note + (keyIndex + 1);
            ctx.font = IN_KEY_STYLE;

        }
        //make coordinate correction so text is centered in the circle
        ctx.fillText(note, NOTE_CENTER_X - 7, NOTE_CENTER_Y + 5);
    }

}








//////////////////////////// CONFIGURATION ////////////////////////////


