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
            p.background(255);
            p.maxSpiralSize = p.width >= p.height ? p.height / 2 : p.width /2;
            p.spiralWidth = p.random(1, 39);
            document.getElementById("loader").classList.add("loading--complete");
        }

        p.draw = () => {
            let oldX = p.width/2;
            let oldY = p.height/2;
            const size = p.maxSpiralSize;
            const angle = 0;
            
            for (let i=0; i<size; i++) {
                let newAngle = (angle/10) * i;
                let x = (p.width/2) + (p.spiralWidth * newAngle) * Math.sin(newAngle);
                let  y = (p.height/2) + (p.spiralWidth * newAngle) * Math.cos(newAngle);
                console.log(x);
                console.log(y);
                
                // Random Color for each line segment
                // strokeWeight(randomWeight()); // Random Weight (1-5)
                
                p.line(oldX, oldY, x, y);
                oldX = x;
                oldY = y;
            }
            if(p.audioLoaded && p.song.isPlaying()){

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
