import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

// import audio from "../audio/circles-no-3.ogg";
// import midi from "../audio/circles-no-3.mid";

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
            // Midi.fromUrl(midi).then(
            //     function(result) {
            //         const noteSet1 = result.tracks[5].notes; // Synth 1
            //         p.scheduleCueSet(noteSet1, 'executeCueSet1');
            //         p.audioLoaded = true;
            //         document.getElementById("loader").classList.add("loading--complete");
            //         document.getElementById("play-icon").classList.remove("fade-out");
            //     }
            // );
            
        }

        p.preload = () => {
            // p.song = p.loadSound(audio, p.loadMidi);
            // p.song.onended(p.logCredits);
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
            p.stroke(255);
            p.strokeWeight(2);
            p.noLoop();
            p.frameRate(30);
            p.maxSpiralSize = p.width >= p.height ? p.height / 2 : p.width /2;
            document.getElementById("loader").classList.add("loading--complete");
        }

        p.draw = () => {
            p.background(0);
            p.drawSpiral2();
            p.drawSpiral3();
            p.drawSpiral4();
            
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.drawSpiral2 = () => {
            p.drawSpiral(p.width/4 * 3, p.height/4 * 3, 1, 2, 2);
        }

        p.drawSpiral3 = () => {
            p.drawSpiral(p.width/4, p.height/4 * 3, 5);
        }

        p.drawSpiral4 = () => {
            p.drawSpiral(p.width/2, p.height/4, 100, 5, 10, 8, 24);
        }

        p.drawSpiral = (startX, startY, delayAmount = 10, minWidth = 1, maxWidth = 20, minAngle = 1, maxAngle = 1) => {
            const sizeMultiplier  = p.random(0.1, 5),
                spiralWidth = p.random(minWidth, maxWidth),
                angle = p.random(minAngle, maxAngle),
                size = p.maxSpiralSize * (sizeMultiplier / spiralWidth / angle);
            let oldX = startX,
                oldY = startY;

            for (let i=0; i<size; i++) {
                setTimeout(
                    function () {
                        let newAngle = (angle/10) * i;
                        let x = (startX) + (spiralWidth * newAngle) * Math.sin(newAngle);
                        let  y = (startY) + (spiralWidth * newAngle) * Math.cos(newAngle);
                        p.stroke(p.randomColor()); // Random Color for each line segment
                        p.strokeWeight(p.randomWeight()); // Random Weight (1-5)
                        p.line(oldX, oldY, x, y);
                        oldX = x;
                        oldY = y;
                    },
                    (delayAmount * i)
                );
            }
        }

        p.executeCueSet1 = (note) => {
            p.background(p.random(255), p.random(255), p.random(255));
            p.fill(p.random(255), p.random(255), p.random(255));
            p.noStroke();
            p.ellipse(p.width / 2, p.height / 2, p.width / 4, p.width / 4);
        }

        p.randomColor = () => {
            const r = Math.round(Math.random() * 255);
            const g = Math.round(Math.random() * 255);
            const b = Math.round(Math.random() * 255);
            return `rgb(${r}, ${g}, ${b})`;
        }

        p.randomWeight = () => {
            return Math.random() * 5;
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
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
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
