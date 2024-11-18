// my-paint-worklet.js

// Registrace třídy kresby
class MyPainter {
    static get inputProperties() {
        return ['--primary-color', '--secondary-color']; // Vlastní CSS vlastnosti
    }

    paint(ctx, size, properties) {
        const primaryColor = properties.get('--primary-color').toString() || 'black';
        const secondaryColor = properties.get('--secondary-color').toString() || 'white';

        // Vyplnění pozadí hlavní barvou
        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, 0, size.width, size.height);

        // Nakreslení kruhu sekundární barvou
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(size.width / 2, size.height / 2, Math.min(size.width, size.height) / 4, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Registrace workletu
registerPaint('my-painter', MyPainter);
