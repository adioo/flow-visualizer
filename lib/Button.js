'use strict';

class Button {

    constructor(ctx, text, options = {}) {

        // save canvas context for later use
        this.ctx = ctx;

        // set 
        this.color = options.color || '#0078e7';
        this.fontColor = options.fontColor || 'White';
        this.hoverColor = options.hoverColor || this.color;
        this.fontSize = options.fontSize || 13;
        this.text = text || 'Click!';
        this.isMouseOver = false;
        this.isPressed = false;

        // compute width and height based on text
        this.ctx.font = this.fontSize + "px sans-serif";
        this.width = Math.round(this.ctx.measureText(this.text).width) + 25;
        this.height = this.fontSize + 16;
    }

    draw (x, y) {

        if (typeof x !== 'undefined') {
            this.x = x;
            this.y = y;
        }

        this.ctx.clearRect(this.x, this.y, this.wdidth, this.height);

        // draw the button
        let radius = { tl: 2, tr: 2, br: 2, bl: 2 };
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + radius.tl, this.y);
        this.ctx.lineTo(this.x + this.width - radius.tr, this.y);
        this.ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + radius.tr);
        this.ctx.lineTo(this.x + this.width, this.y + this.height - radius.br);
        this.ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - radius.br, this.y + this.height);
        this.ctx.lineTo(this.x + radius.bl, this.y + this.height);
        this.ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - radius.bl);
        this.ctx.lineTo(this.x, this.y + radius.tl);
        this.ctx.quadraticCurveTo(this.x, this.y, this.x + radius.tl, this.y);
        this.ctx.fillStyle = this.isMouseOver ? this.hoverColor : this.color;
        this.ctx.fill();

        // add stroke if button is pressed
        if (this.isPressed) {
            this.ctx.strokeStyle = this.color;
            this.ctx.stroke();
        }

        // add text
        this.ctx.font = this.fontSize + "px sans-serif";
        this.ctx.fillStyle = this.fontColor;
        this.ctx.textBaseline = 'middle'; 
        let textX = this.x + this.width / 2;
        let textY = this.y + this.height / 2;
        this.ctx.fillText(this.text, textX, textY);
    }

    mouseAway () {
        if (this.isMouseOver) {
            document.body.style.cursor = "";
            this.isMouseOver = false;
            this.draw();
        }
    }

    mouseOver () {
        if (!this.isMouseOver) {
            document.body.style.cursor = "pointer";
            this.isMouseOver = true;
            this.draw();
        }
    }

    mouseDown () {
        if (!this.isPressed) {
            this.isPressed = true;
            this.draw();
        }
    }

    mouseUp () {
        if (this.isPressed) {
            this.isPressed = false;
            this.draw();
        }
    }
}

module.exports = Button;