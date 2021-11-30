import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/spirals-no-1.ogg";
import midi from "../audio/spirals-no-1.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.maxSpiralSize = 0;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    const noteSet1 = result.tracks[3].notes; // Synth 2 - Init Patch
                    const noteSet2 = result.tracks[4].notes; // Synth 3 - Bass Guitar
                    const noteSet3 = result.tracks[2].notes; // Synth 4 - Solina Strings
                    const noteSet4 = result.tracks[6].notes.filter(note => note.midi === 36 || note.midi === 37); // Redrum 1
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                    p.scheduleCueSet(noteSet3, 'executeCueSet3');
                    p.scheduleCueSet(noteSet4, 'executeCueSet4');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.colorMode(p.HSB, 360, 100, 100);
            p.stroke(255);
            p.noFill();
            p.background(0);
            p.noLoop();
            p.maxSpiralSize = p.width >= p.height ? p.height / 2 : p.width /2;
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.executeCueSet1 = (note) => {
            if(note.currentCue < 90){
                p.background(0);
            }
            const sizeMultiplier  = p.random(0.1, 5);
            p.drawSpiral(p.width/8 * 7, p.height/4 * 3, sizeMultiplier, 3, 1);
        }

        p.executeCueSet2 = (note) => {
            const sizeMultiplier  = 8,
                spiralWidth = p.random(1, 20);
            p.drawSpiral(p.width/4, p.height/2, sizeMultiplier, spiralWidth, 1);
        }

        p.executeCueSet3 = (note) => {
            const sizeMultiplier  = p.random(4, 8),
                spiralWidth = p.random(5, 10),
                angle = p.random(8, 23),
                size = p.maxSpiralSize * (sizeMultiplier / spiralWidth / angle),
                delay = note.duration * 1000 / size;
            p.drawSpiral(p.width/8 * 5, p.height/8 * 3, sizeMultiplier, spiralWidth, angle, delay);
        }

        p.executeCueSet4 = (note) => {
            const { midi } = note,
                sizeMultiplier  = p.random(1, 2);
            if(midi === 36){
                p.drawSpiral(p.width/2, p.height/8 * 7, sizeMultiplier, 3, 1, 1);
            }
            if(midi === 37){
                p.drawSpiral(p.width/16 * 13, p.height/8 * 1.5, sizeMultiplier, 3, 1, 1);
            }
        }

        p.timeouts = [];

        p.drawSpiral = (startX, startY, sizeMultiplier = 1, spiralWidth = 20, angle = 1, delayAmount = 10) => {
            const size = p.maxSpiralSize * (sizeMultiplier / spiralWidth / angle),
                randomHue = p.random(0, 360);

            let oldX = startX,
                oldY = startY;   
            
            if(delayAmount < 0) {
                delayAmount = 1000 / size;
            }

            for (let i = 0; i < size; i++) {
                p.timeouts.push(
                    setTimeout(
                        function () {
                            let newAngle = (angle/10) * i;
                            let x = (startX) + (spiralWidth * newAngle) * Math.sin(newAngle);
                            let  y = (startY) + (spiralWidth * newAngle) * Math.cos(newAngle);
                            p.strokeWeight(12);
                            p.stroke(randomHue, 100 / size * i, 100, 0.15); 
                            p.line(oldX, oldY, x, y);
                            p.strokeWeight(2);
                            p.stroke(randomHue, 100 / size * i, 100); 
                            p.line(oldX, oldY, x, y);
                            oldX = x;
                            oldY = y;
                        },
                        (delayAmount * i)
                    )
                );
            }
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
            p.draw();
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                Math.ceil(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                for (let i = 0; i < p.timeouts.length; i++) {
                    clearTimeout(p.timeouts[i]);
                }
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
