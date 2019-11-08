import { Draw } from "./draw";
import { Point } from "./ball";
import { expect } from 'chai';
import { JSDOM } from "jsdom";

describe('Draw', () => {
    const minBalls = 2;
    const maxBalls = 10;
    const jsdom = (new JSDOM(``, { pretendToBeVisual: true }))
    
    let d: Draw;
    let canvas;
    before(() => {
        // setup some browser specific animation functions, elements, etc.
        window.requestAnimationFrame = jsdom.window.requestAnimationFrame;
        window.cancelAnimationFrame = jsdom.window.cancelAnimationFrame;

        canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        canvas.width = 1000;
        canvas.height = 1000;
        document.body.appendChild(canvas);

        let button = document.createElement('button');
        button.id = 'toggle';
        document.body.appendChild(button);
        let restart = document.createElement('button');
        restart.id = 'restart';
        document.body.appendChild(restart);
        let label = document.createElement('label');
        label.id = 'info';
        document.body.appendChild(label)

        d = new Draw(100, minBalls, maxBalls)        
    })

    after(() => {
        d.restart()
    })

    afterEach(() => {
        if (d.service.running) d.toggle() // otherwise the test will hang 
    })

    it('should restart the app', () => {
        d.main(new Point(10, 10));
        d.restart();
        expect(d.service.items.length).to.eql(0)
    })

    it('should start the app', () => {
        d.main(new Point(10, 10))
        expect(d.service.items.length).to.be.at.least(2)
        expect(d.service.items.length).to.be.at.most(10)
        expect(d.service.running).to.eql(true)
    })
})