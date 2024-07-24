async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureFrame(element, gif) {
    const canvas = await html2canvas(element, { useCORS: true });
    const context = canvas.getContext('2d', { willReadFrequently: true });
    gif.addFrame(context.canvas, { copy: true, delay: 100 });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('capture').addEventListener('click', async () => {
        const element = document.getElementById('animatedContent');
        const gif = new GIF({
            workers: 2,
            quality: 10
        });

        // 假设动画持续 5 秒，每 100 毫秒捕获一帧
        for (let i = 0; i < 50; i++) {
            await captureFrame(element, gif);
            await delay(100);
        }

        gif.on('finished', function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'animation.gif';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });

        gif.render();
    });
});
