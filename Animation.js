(function() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1'; // Behind everything

    const ctx = canvas.getContext('2d');
    let isMobile = window.innerWidth < 768;
    let particles = [];
    let textImageData = null;
    let image = new Image();
    image.src = 'SPa.png';

    const mouse = { x: 0, y: 0 };
    let isTouching = false;

    image.onload = () => {
        updateCanvasSize();
        const scale = createTextImage();
        createInitialParticles(scale);
        animate(scale);
    };

    function updateCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        isMobile = window.innerWidth < 768;
    }

    function createTextImage() {
        const scaleFactor = 2.5;
        const logoHeight = (isMobile ? 60 : 120) * scaleFactor;
        const customLogoWidth = logoHeight * (image.width / image.height);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2 - customLogoWidth / 2, canvas.height / 2 - logoHeight / 2);
        ctx.drawImage(image, 0, 0, customLogoWidth, logoHeight);
        ctx.restore();

        textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        return logoHeight / image.height;
    }

    function createParticle(scale) {
        if (!textImageData) return null;
        const data = textImageData.data;

        for (let attempt = 0; attempt < 100; attempt++) {
            const x = Math.floor(Math.random() * canvas.width);
            const y = Math.floor(Math.random() * canvas.height);
            if (data[(y * canvas.width + x) * 4 + 3] > 128) {
                return { x, y, baseX: x, baseY: y, size: Math.random() + 0.5, color: 'white', scatteredColor: '#4B9CD3', life: Math.random() * 100 + 50 };
            }
        }
        return null;
    }

    function createInitialParticles(scale) {
        const baseParticleCount = 8000;
        const count = Math.floor(baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)));
        for (let i = 0; i < count; i++) {
            const p = createParticle(scale);
            if (p) particles.push(p);
        }
    }

    function animate(scale) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 400;

            if (dist < maxDist && (isTouching || !('ontouchstart' in window))) {
                const force = (maxDist - dist) / maxDist;
                const angle = Math.atan2(dy, dx);
                p.x = p.baseX - Math.cos(angle) * force * 5;
                p.y = p.baseY - Math.sin(angle) * force * 5;

                ctx.fillStyle = p.scatteredColor;
            } else {
                p.x += (p.baseX - p.x) * 0.1;
                p.y += (p.baseY - p.y) * 0.1;
                ctx.fillStyle = 'white';
            }

            ctx.fillRect(p.x, p.y, p.size, p.size);
            p.life--;
            if (p.life <= 0) {
                const newP = createParticle(scale);
                particles[i] = newP ? newP : particles.splice(i, 1);
            }
        }

        requestAnimationFrame(() => animate(scale));
    }

    window.addEventListener('resize', () => {
        updateCanvasSize();
        const scale = createTextImage();
        particles = [];
        createInitialParticles(scale);
    });

    canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    canvas.addEventListener('touchmove', e => {
        if (e.touches.length > 0) {
            e.preventDefault();
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    }, { passive: false });

    canvas.addEventListener('touchstart', () => { isTouching = true; });
    canvas.addEventListener('touchend', () => { isTouching = false; mouse.x = 0; mouse.y = 0; });
})();
