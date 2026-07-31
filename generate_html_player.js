const fs = require('fs');
const path = require('path');
const { solveBasicDampedOscillator } = require('./index');

function generateHTMLAnimation() {
  console.log('🎬 正在生成纯 HTML5 Canvas 动画录制页面...');

  const params = {
    mass: 0.0015,
    stiffness: 800,
    damping: 0.10,
    bl: 1.2,
    current: 0.4,
    driveType: 'ac',
    driveDuration: 0.200,
    duration: 0.260
  };

  const res = solveBasicDampedOscillator(params, params.duration, 0.0001);

  const htmlContent = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>ANSV-HAPTICS-SIM 波形动画导出页</title>
  <style>
    body {
      background-color: #0d1117;
      color: #f0f6fc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background-color: #161b22;
      border: 1px solid #30363d;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      text-align: center;
    }
    canvas {
      border-radius: 12px;
      background-color: #0d1117;
    }
    .info {
      margin-top: 16px;
      color: #8b949e;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="card">
    <canvas id="animCanvas" width="900" height="420"></canvas>
    <div class="info">
      ⚡ ANSV-HAPTICS-SIM 触觉马达物理动画页面（在浏览器中打开即可自动高流畅度播放）
    </div>
  </div>

  <script>
    const res = ${JSON.stringify(res)};
    const params = ${JSON.stringify(params)};

    const canvas = document.getElementById('animCanvas');
    const ctx = canvas.getContext('2d');

    const width = 900;
    const height = 420;
    const padding = 60;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    const times = res.time;
    const displacements = res.displacement;
    const maxT = Math.max(...times);
    const maxAbsDisp = Math.max(...displacements.map(Math.abs));
    const yBound = Math.ceil(maxAbsDisp * 1.2 * 10) / 10 || 8.0;

    function scaleX(t) { return padding + (t / maxT) * graphWidth; }
    function scaleY(d) { return height - padding - ((d - (-yBound)) / (yBound - (-yBound))) * graphHeight; }

    const riseX = scaleX(45);
    const stopX = scaleX(params.driveDuration * 1000);

    let frame = 0;
    const totalFrames = 180; // 3秒播放一轮

    function draw() {
      const progress = (frame % totalFrames) / totalFrames;
      const currentMaxIndex = Math.floor(progress * (displacements.length - 1));

      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, width, height);

      // 三阶段背景
      ctx.fillStyle = 'rgba(0, 242, 254, 0.04)';
      ctx.fillRect(padding, padding, riseX - padding, graphHeight);
      ctx.fillStyle = 'rgba(0, 255, 135, 0.04)';
      ctx.fillRect(riseX, padding, stopX - riseX, graphHeight);
      ctx.fillStyle = 'rgba(255, 0, 85, 0.03)';
      ctx.fillRect(stopX, padding, width - padding - stopX, graphHeight);

      // 网格
      ctx.strokeStyle = '#21262d';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      [yBound, yBound / 2, 0, -yBound / 2, -yBound].forEach(val => {
        const y = scaleY(val);
        ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
      });

      // 零位线
      ctx.strokeStyle = '#58a6ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]);
      ctx.beginPath(); ctx.moveTo(padding, scaleY(0)); ctx.lineTo(width - padding, scaleY(0)); ctx.stroke();
      ctx.setLineDash([]);

      // 阶段分割线
      ctx.strokeStyle = '#00ff87'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(riseX, padding); ctx.lineTo(riseX, height - padding); ctx.stroke();

      ctx.strokeStyle = '#ff4d4d'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(stopX, padding); ctx.lineTo(stopX, height - padding); ctx.stroke();
      ctx.setLineDash([]);

      // 标题
      ctx.fillStyle = '#f0f6fc';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('⚡ ANSV-HAPTICS-SIM | Full Cycle Haptic Lifecycle', padding, 34);

      ctx.fillStyle = '#8b949e';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(\`m=1.5g | k=800N/m | f0=\${res.f0Hz}Hz\`, width - padding, 34);
      ctx.textAlign = 'left';

      // 阶段标识
      ctx.fillStyle = '#00f2fe'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('🚀 1. 起振段 (0~45ms)', padding + 5, padding + 20);
      ctx.fillStyle = '#00ff87';
      ctx.fillText('⚡ 2. 持续平稳长振动段 (45~200ms)', riseX + 15, padding + 20);
      ctx.fillStyle = '#ff4d4d';
      ctx.fillText('⏹️ 3. 断电衰减 (200~260ms)', stopX + 10, padding + 20);

      // 刻度
      ctx.fillStyle = '#8b949e'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(\`+\${yBound}mm\`, padding - 10, scaleY(yBound) + 4);
      ctx.fillText(\`0.0mm\`, padding - 10, scaleY(0) + 4);
      ctx.fillText(\`-\${yBound}mm\`, padding - 10, scaleY(-yBound) + 4);

      // 绘制波形
      if (currentMaxIndex > 0) {
        ctx.beginPath();
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let i = 0; i <= currentMaxIndex; i++) {
          const x = scaleX(times[i]);
          const y = scaleY(displacements[i]);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const headX = scaleX(times[currentMaxIndex]);
        const headY = scaleY(displacements[currentMaxIndex]);

        ctx.fillStyle = '#00f2fe';
        ctx.beginPath(); ctx.arc(headX, headY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(headX, headY, 2.5, 0, Math.PI * 2); ctx.fill();
      }

      ctx.fillStyle = '#161b22';
      ctx.fillRect(width - 310, height - 35, 250, 22);
      ctx.fillStyle = '#58a6ff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ Advanced Transient Algo @ ansv.net', width - 185, height - 20);

      frame++;
      requestAnimationFrame(draw);
    }

    draw();
  </script>
</body>
</html>`;

  const htmlPath = path.join(__dirname, 'docs', 'animation_preview.html');
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`✅ 已生成交互式 HTML5 物理波形播放页面: ${htmlPath}`);
}

generateHTMLAnimation();
