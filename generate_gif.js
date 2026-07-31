const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');
const { solveBasicDampedOscillator } = require('./index');

function generateGIF() {
  console.log('🎬 正在生成极客黑科技风格动画 GIF...');

  const params = {
    mass: 0.0015,
    stiffness: 800,
    damping: 0.10,
    bl: 1.2,
    current: 0.4,
    driveType: 'ac',
    driveDuration: 0.200, // 200ms 通电
    duration: 0.260       // 260ms 总时长
  };

  const res = solveBasicDampedOscillator(params, params.duration, 0.0001);

  const width = 800;
  const height = 400;
  const padding = 60;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  const encoder = new GIFEncoder(width, height);
  const gifPath = path.join(__dirname, 'docs', 'simulation.gif');
  const stream = encoder.createReadStream().pipe(fs.createWriteStream(gifPath));

  encoder.start();
  encoder.setRepeat(0);   // 0 即无限循环播放
  encoder.setDelay(60);   // 每帧 60ms 延迟
  encoder.setQuality(10); // 图像质量

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const times = res.time;
  const displacements = res.displacement;
  const maxT = Math.max(...times);
  const maxAbsDisp = Math.max(...displacements.map(Math.abs));
  const yBound = Math.ceil(maxAbsDisp * 1.2 * 10) / 10 || 8.0;

  function scaleX(t) { return padding + (t / maxT) * graphWidth; }
  function scaleY(d) { return height - padding - ((d - (-yBound)) / (yBound - (-yBound))) * graphHeight; }

  const riseX = scaleX(45);
  const stopX = scaleX(params.driveDuration * 1000);

  const totalFrames = 30;

  for (let f = 0; f <= totalFrames; f++) {
    // 渐进画出的比例 ratio (0 -> 1)
    const ratio = f / totalFrames;
    const currentMaxIndex = Math.floor(ratio * (displacements.length - 1));

    // 背景背景
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // 三阶段半透明区域
    // 1. 起振段 (0~45ms)
    ctx.fillStyle = 'rgba(0, 242, 254, 0.04)';
    ctx.fillRect(padding, padding, riseX - padding, graphHeight);
    // 2. 稳态长振动段 (45~200ms)
    ctx.fillStyle = 'rgba(0, 255, 135, 0.04)';
    ctx.fillRect(riseX, padding, stopX - riseX, graphHeight);
    // 3. 断电衰减段 (200~260ms)
    ctx.fillStyle = 'rgba(255, 0, 85, 0.03)';
    ctx.fillRect(stopX, padding, width - padding - stopX, graphHeight);

    // 标尺虚线
    ctx.strokeStyle = '#21262d';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // 网格横线
    [yBound, yBound / 2, 0, -yBound / 2, -yBound].forEach(val => {
      const y = scaleY(val);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    });

    // 0 位移基准线
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(padding, scaleY(0));
    ctx.lineTo(width - padding, scaleY(0));
    ctx.stroke();

    ctx.setLineDash([]); // 还原实线

    // 阶段分割虚线
    ctx.strokeStyle = '#00ff87';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(riseX, padding); ctx.lineTo(riseX, height - padding); ctx.stroke();

    ctx.strokeStyle = '#ff4d4d';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(stopX, padding); ctx.lineTo(stopX, height - padding); ctx.stroke();
    ctx.setLineDash([]);

    // 标题文字
    ctx.fillStyle = '#f0f6fc';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('⚡ ANSV-HAPTICS-SIM | Full Cycle Simulation', padding, 34);

    ctx.fillStyle = '#8b949e';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`m=1.5g | k=800N/m | f0=${res.f0Hz}Hz`, width - padding, 34);
    ctx.textAlign = 'left';

    // 阶段标注
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('🚀 1. 起振段 (0~45ms)', padding + 5, padding + 20);

    ctx.fillStyle = '#00ff87';
    ctx.fillText('⚡ 2. 持续平稳长振动段 (45~200ms)', riseX + 15, padding + 20);

    ctx.fillStyle = '#ff4d4d';
    ctx.fillText('⏹️ 3. 断电衰减 (200~260ms)', stopX + 10, padding + 20);

    // 刻度
    ctx.fillStyle = '#8b949e';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`+${yBound}mm`, padding - 10, scaleY(yBound) + 4);
    ctx.fillText(`0.0mm`, padding - 10, scaleY(0) + 4);
    ctx.fillText(`-${yBound}mm`, padding - 10, scaleY(-yBound) + 4);

    // 绘制波形渐进动画
    if (currentMaxIndex > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i <= currentMaxIndex; i++) {
        const x = scaleX(times[i]);
        const y = scaleY(displacements[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 笔头发光的发光粒子
      const headX = scaleX(times[currentMaxIndex]);
      const headY = scaleY(displacements[currentMaxIndex]);

      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.arc(headX, headY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 底部水印
    ctx.fillStyle = '#161b22';
    ctx.fillRect(width - 310, height - 35, 250, 22);
    ctx.fillStyle = '#58a6ff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ Advanced Transient Algo @ ansv.net', width - 185, height - 20);

    encoder.addFrame(ctx);
  }

  encoder.finish();
  console.log(`✅ 成功生成物理波形动画 GIF 文件: ${gifPath}`);
}

generateGIF();
