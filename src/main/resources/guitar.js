////////////////////////MODEL //////////////////////////////////////
const NUM_NOTES = 12;
const NOTE_LABEL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTE_MIDI_CODE = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const KEYBOARD_GAIN = 0.657;//the gain applied when note is pressed
const FLAT_CHAR = "&flat;";
const SHARP_CHAR = "&sharp;";
const NAT_CHAR = "&natur;";
const NOTE_CHAR = "&sung;";
const STRING_TUNING = ['E', 'A', 'D', 'G', 'B', 'E']


const IONIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 11];
const DORIAN_INTERVAL = [0, 2, 3, 5, 7, 9, 10];
const PRHYGIAN_INTERVAL = [0, 1, 3, 5, 7, 8, 10];
const LYDIAN_INTERVAL = [0, 2, 4, 6, 7, 9, 11];
const MIXOLYDIAN_INTERVAL = [0, 2, 4, 5, 7, 9, 10];
const AEOLIAN_INTERVAL = [0, 2, 3, 5, 7, 8, 10];
const LOCRIAN_INTERVAL = [0, 1, 3, 5, 6, 8, 10];
const KEY_MODE_INTERVAL = [IONIAN_INTERVAL, DORIAN_INTERVAL, PRHYGIAN_INTERVAL, LYDIAN_INTERVAL, MIXOLYDIAN_INTERVAL, AEOLIAN_INTERVAL, LOCRIAN_INTERVAL];


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
const ELEVENTH_FORMULA = [0, 4, 7, 10, 14, 19];
const THIRTEENTH_FORMULA = [0, 4, 7, 10, 14, 19, 21];
const CHORD_MOD_ARR = [MAJOR_FORMULA, MINOR_FORMULA, SUS2_FORMULA, SUS4_FORMULA, DIM_FORMULA, SIXTH_FORMULA, MINOR_SIXTH_FORMULA, MAJOR7_FORMULA, SEVENTH_FORMULA, MINOR7_FORMULA, NINTH_FORMULA, ELEVENTH_FORMULA, THIRTEENTH_FORMULA];


////////DOM CACHING//////////////////
var fretTable;
var keySelect;
var modeSelect;
var rootChordSelect;
var chordSelect;
var visualizationSelect


(function (window, document, undefined) {
    window.onload = init;

    function init() {
        // the code to be called when the dom has loaded
        // #document has its nodes
        console.log("init");
        //cache DOM elements for better performance
        fretTable = document.getElementById('fretTable');
        keySelect = document.getElementById('keySelect');
        modeSelect = document.getElementById('modeSelect');
        rootChordSelect = document.getElementById('rootChordSelect');
        chordSelect = document.getElementById('chordSelect');
        visualizationSelect = document.getElementById('visualizationSelect');

        initFretBoard();
        loadKey();
        loadChord();
        loadVisualization();
    }
})(window, document, undefined);


function calculateFretNoteIndex(stringIndex, fretIndex) {
    let openNote = STRING_TUNING[stringIndex];
    let openNoteOffset = NOTE_LABEL.indexOf(openNote);
    let noteIndex = (fretIndex + openNoteOffset) % NOTE_LABEL.length;
    return noteIndex;
}

function calculateFretNote(stringIndex, fretIndex) {
    let noteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return NOTE_LABEL[noteIndex];
}

const FRET_MARKERS = [3, 5, 7, 9, 10,12];

function initFretBoard() {
    let tBodyRows = fretTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    for (let i = 0; i < tBodyRows.length; i++) {
        for (let j = 0; j < STRING_TUNING.length; j++) {
            let fretButton = document.createElement("input");
            fretButton.type = "radio";
            fretButton.name = "stringRadio" + j;
            fretButton.value = i + "-" + j;
            tBodyRows[i].getElementsByTagName("td")[j].innerHTML = "<span>" + calculateFretNote(j, i) + "</span>";
            //tBodyRows[i].getElementsByTagName("td")[j].appendChild(fretButton);

        }
        if (FRET_MARKERS.indexOf(i) !== -1) {
            tBodyRows[i].getElementsByTagName("td")[6].innerHTML = "<span class='marker'>" + i + "</span>";
        }
    }
}

let CALCULATED_KEY = [];
let CALCULATED_CHORD = [];

function calculateKey() {
    CALCULATED_KEY = [];
    let keyNoteOffset = parseInt(keySelect.value, 10);
    for (let i = 0; i < KEY_MODE_INTERVAL[modeSelect.value].length; i++) {
        let keyDegreeIndex = (keyNoteOffset + KEY_MODE_INTERVAL[modeSelect.value][i]) % NOTE_LABEL.length;
        CALCULATED_KEY.push(keyDegreeIndex);
    }
    console.log("calculated key:" + CALCULATED_KEY);
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
    console.log("calculated chord:" + CALCULATED_CHORD);
}


function isFretOnKey(stringIndex, fretIndex) {
    let fretNoteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return CALCULATED_KEY.indexOf(fretNoteIndex);
}

function isFretOnChord(stringIndex, fretIndex) {
    let fretNoteIndex = calculateFretNoteIndex(stringIndex, fretIndex);
    return CALCULATED_CHORD.indexOf(fretNoteIndex);
}


//////////////////////////// CONFIGURATION ////////////////////////////



function loadVisualization() {
    let tBodyRows = fretTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    for (let i = 0; i < tBodyRows.length; i++) {
        for (let j = 0; j < STRING_TUNING.length; j++) {
            for (let z = 0; z  < tBodyRows[i].getElementsByTagName("td")[j].classList.length; z++) {
                if (tBodyRows[i].getElementsByTagName("td")[j].classList[z].startsWith("Vis")) {
                    tBodyRows[i].getElementsByTagName("td")[j].classList.remove(tBodyRows[i].getElementsByTagName("td")[j].classList[z]);
                }
            }
            let tdClass = "";
            let note = calculateFretNote(j, i);
            switch (visualizationSelect.value) {
                case "Chord":
                    break;
                case "Natural":
                    if (!note.endsWith("b")) {
                        tdClass = "Vis" + note + visualizationSelect.value + "Class";
                    }
                    break;
                case "Artificial":
                    if (note.endsWith("b")) {
                        tdClass = "Vis" + note + visualizationSelect.value + "Class";
                    }
                    break;
                case "Fifths":
                    tdClass = "Vis" + note + visualizationSelect.value + "Class";

                    break;
            }

            //tBodyRows[i].getElementsByTagName("td")[j].classList.remove();
            if (tdClass.length > 0) {
                tBodyRows[i].getElementsByTagName("td")[j].classList.add(tdClass);
            }
        }
    }
}

function loadKey() {
    calculateKey();
    let tBodyRows = fretTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    for (let i = 0; i < tBodyRows.length; i++) {
        for (let j = 0; j < STRING_TUNING.length; j++) {
            let tdClass = "OnKey" + isFretOnKey(j, i) + "Class";
            for (let z = 0; z  < tBodyRows[i].getElementsByTagName("td")[j].classList.length; z++) {
                if (tBodyRows[i].getElementsByTagName("td")[j].classList[z].startsWith("OnKey")) {
                    tBodyRows[i].getElementsByTagName("td")[j].classList.remove(tBodyRows[i].getElementsByTagName("td")[j].classList[z]);
                }
            }
            tBodyRows[i].getElementsByTagName("td")[j].classList.add(tdClass);
        }
    }
}

function loadChord(event) {
    calculateChord();
    let tBodyRows = fretTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    for (let i = 0; i < tBodyRows.length; i++) {
        for (let j = 0; j < STRING_TUNING.length; j++) {
            let tdClass = "OnChord" + isFretOnChord(j, i) + "Class";
            tBodyRows[i].getElementsByTagName("td")[j].getElementsByTagName("span")[0].className = tdClass;
        }
    }
}