class Particle {

    constructor(fCanvasWidth, fCanvasHeight, iRelativeRadius, strColor) {
        this.x = Math.random() * fCanvasWidth;
        this.y = Math.random() * fCanvasHeight;
        this.vx = -1 + Math.random();
        this.vy = -1 + Math.random();
        this.radius = 0;
        this.relativeRadius = iRelativeRadius;
        this.color = strColor;
    }

    scale(fX, fY) {
        this.x  /= fX;
        this.vx /= fX;
        this.y  /= fY;
        this.vy /= fY;
    }

    update(width, height) {
        this.x += this.vx;
        this.y += this.vy;
        this.radius = width / this.relativeRadius;

        if(this.x + this.radius > width || this.x - this.radius < 0)
            this.vx = -this.vx;

        if(this.y + this.radius > height || this.y - this.radius < 0)
            this.vy = -this.vy;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
    }
}

class BackgroundAnimation {

    constructor(imgFilter, fFilterMin, fFilterMax, iRelativeRadius, strColor, iParticleCount) {
        this.canvas = document.getElementById("canvasBackground");
        this.canvas.width = 1280;
        this.canvas.height = 720;

        this.particles = [];
        for(let i = 0; i < iParticleCount; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height, iRelativeRadius, strColor));
        }

        this.ctx = null;

        this.filter = null;
        this.filterAlpha = fFilterMin;
        this.filterAlphaMin = fFilterMin;
        this.filterAlphaMax = fFilterMax;
        this.filterAlphaDirection = true;
        this.filterReady = false;

        let overlay = new Image();
        overlay.onload = this._initializeFilter.bind(this, overlay);
        overlay.src = imgFilter;

        this.webGL = false;
    }

    enableWebGLSupport() {
        loadHeaderFile("gl-matrix-min-2.8.1.js", "js");
        loadHeaderFile("litegl.min.js", "js");
        loadHeaderFile("Canvas2DtoWebGL.js", "js");
        this.webGL = true;
    }

    enable2dContextSupport() {
        this.ctx = this.canvas.getContext("2d");
        this.webGL = false;
    }

    _initializeFilter(overlay) {
        this.filter = this.ctx.createPattern(overlay, 'repeat');
        this.filterReady = true;
    }

    update() {

        if(this.webGL && this.ctx == null && typeof enableWebGLCanvas === "function") {
            this.ctx = enableWebGLCanvas(this.canvas);
        }

        const bUpdateRequired =
            this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight;

        for (let i = 0; i < this.particles.length; i++) {
            if(bUpdateRequired) {
                this.particles[i].scale(
                    this.canvas.width / document.body.clientWidth,
                    this.canvas.height / document.body.clientHeight);
            }
            this.particles[i].update(this.canvas.width, this.canvas.height);
        }

        if(bUpdateRequired) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
        }

        if (this.filterReady) {
            this.filterAlpha +=  this.filterAlphaDirection? 0.0003 : -0.0003;
            if (this.filterAlphaDirection && this.filterAlpha >= this.filterAlphaMax) {
                    this.filterAlphaDirection = false;
            } else if(!this.filterAlphaDirection && this.filterAlpha <= this.filterAlphaMin) {
                this.filterAlphaDirection = true;
            }
        }
    }

    draw() {
        if(this.ctx == null) return;
        if(this.webGL && this.webGLctx != null) this.ctx.start2D();

        this.ctx.fillStyle = "rgba(0,0,0,0.09)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].draw(this.ctx);
        }

        this.ctx.beginPath();
        this.ctx.strokeStyle = "rgba(255,255,255,0.02)";

        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                if (Math.hypot(p2.x - p1.x, p2.y - p1.y) < this.canvas.width / 3) {
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                }
            }
        }

        this.ctx.stroke();
        this.ctx.closePath();

        if (this.filterReady) {
            let alpha = this.ctx.globalAlpha;
            this.ctx.globalAlpha = this.filterAlpha;
            this.ctx.fillStyle = this.filter;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = alpha;
        }

        if(this.webGL && this.webGLctx != null) this.ctx.finish2D();
    }

    launch() {
        this.draw();
        this.update();
        requestAnimationFrame(this.launch.bind(this));
    }
}