const fs = require('fs');
const path = require('path');
const { solveBasicDampedOscillator } = require('./index');

function runInteractiveDemo() {
  const args = process.argv.slice(2);
  
  let params = {
    mass: 0.0015,
    stiffness: 800,
    damping: 0.03,
    bl: 1.2,
    current: 0.4,
    driveType: 'ac',
    driveDuration: 0.045, // 通电 45ms (约 5 个全周期起振)
    duration: 0.10        // 总时长 100ms (后 55ms 为断电余震衰减)
  };

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, val] = arg.replace('--', '').split('=');
      if (key && val) {
        params[key] = isNaN(parseFloat(val)) ? val : parseFloat(val);
      }
    }
  });

  console.log('----------------------------------------------------');
  console.log('⚡ ANSV-HAPTICS-SIM | 完整通电激励 + 断电刹车余震衰减');
  console.log('----------------------------------------------------');
  console.log(` 1. 振子质量 (m)  : ${(params.mass * 1000).toFixed(2)} g (${params.mass} kg)`);
  console.log(` 2. 弹簧刚度 (k)  : ${params.stiffness} N/m`);
  console.log(` 3. 阻尼系数 (c)  : ${params.damping} Ns/m`);
  console.log(` 4. 力灵敏度 (BL) : ${params.bl} N/A`);
  console.log(` 5. 驱动电流 (I)  : ${params.current} A`);
  console.log(` ⚡ 通电时长 (Drive): ${(params.driveDuration * 1000).toFixed(0)} ms (AC 正弦推力)`);
  console.log(` ⏹️ 断电时长 (Stop) : ${((params.duration - params.driveDuration) * 1000).toFixed(0)} ms (自由阻尼衰减 Ring-down)`);
  console.log('----------------------------------------------------');

  const res = solveBasicDampedOscillator(params, params.duration, 0.0001);

  console.log(`📌 固有谐振频率 (f0) : ${res.f0Hz} Hz`);
  console.log(`📈 通电起振最大位移  : +${Math.max(...res.displacement)} mm`);
  console.log(`📉 断电后 80ms 残余位移: ${res.displacement[800]} mm`);
  console.log('----------------------------------------------------\n');

  // 生成终端 ASCII 对称波形
  generateCLIChart(res, params);

  // 重新渲染包含通电区与断电区的 SVG 图形
  const svgContent = generateSVGAnimation(res, params);
  const docsDir = path.join(__dirname, 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, 'simulation.svg'), svgContent);
  console.log('✨ 已自动生成并更新 docs/simulation.svg 通电+断电完整过程动画！');
}

function generateCLIChart(data, params) {
  console.log('📊 终端位移响应曲线 (0~45ms 通电起振 | 45~100ms 断电自由衰减):');
  const width = 45;
  const maxD = Math.max(...data.displacement.map(Math.abs));
  
  const sampleInterval = Math.floor(data.time.length / 20);
  for (let i = 0; i < data.time.length; i += sampleInterval) {
    const t = data.time[i];
    const d = data.displacement[i];
    const pos = Math.round((d / (maxD || 1)) * (width / 2)) + Math.floor(width / 2);
    let line = Array(width + 1).fill(' ');
    line[Math.floor(width / 2)] = '|';
    line[pos] = '*';
    const status = t <= (params.driveDuration * 1000) ? '⚡[POWER ON]' : '⏹️[POWER OFF]';
    console.log(`${t.toFixed(1).padStart(5)}ms: ${line.join('')} (${d.toFixed(3)}mm) ${status}`);
  }
  console.log('');
}

function generateSVGAnimation(data, params) {
  const width = 900;
  const height = 420;
  const padding = 60;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  const times = data.time;
  const displacements = data.displacement;

  const maxT = Math.max(...times);
  const maxAbsDisp = Math.max(...displacements.map(Math.abs));
  
  const yBound = Math.ceil(maxAbsDisp * 1.25 * 10) / 10 || 1.0;
  const yMin = -yBound;
  const yMax = yBound;

  function scaleX(t) { return padding + (t / maxT) * graphWidth; }
  function scaleY(d) { return height - padding - ((d - yMin) / (yMax - yMin)) * graphHeight; }

  const points = times.map((t, i) => `${scaleX(t).toFixed(2)},${scaleY(displacements[i]).toFixed(2)}`).join(' ');
  const zeroY = scaleY(0);

  // 通电截止线 X 坐标
  const stopX = scaleX(params.driveDuration * 1000);

  const timeLabels = [];
  const gridLines = [];
  const interval = maxT > 60 ? 20 : 10;
  for (let t = 0; t <= maxT; t += interval) {
    const xPos = scaleX(t);
    gridLines.push(`<line x1="${xPos.toFixed(1)}" y1="${padding}" x2="${xPos.toFixed(1)}" y2="${height - padding}" stroke-dasharray="4 4"/>`);
    timeLabels.push(`<text x="${xPos.toFixed(1)}" y="${height - padding + 20}" text-anchor="middle">${t}ms</text>`);
  }

  const yStep = (yBound / 2).toFixed(1);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  <defs>
    <linearGradient id="polyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#4facfe" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#0066ff" stop-opacity="0.35"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f2fe"/>
      <stop offset="45%" stop-color="#00ff87"/>
      <stop offset="100%" stop-color="#ff0055"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- 通电区与断电背景遮罩 -->
  <rect x="${padding}" y="${padding}" width="${stopX - padding}" height="${graphHeight}" fill="#00f2fe" fill-opacity="0.05" />
  <rect x="${stopX}" y="${padding}" width="${width - padding - stopX}" height="${graphHeight}" fill="#ff0055" fill-opacity="0.03" />

  <!-- Title Header -->
  <text x="${padding}" y="34" fill="#f0f6fc" font-size="16" font-weight="700">⚡ ANSV-HAPTICS-SIM | Full Cycle: Power-On Drive & Stop Ring-down</text>
  <text x="${width - padding}" y="34" fill="#8b949e" font-size="12" text-anchor="end">m=${(params.mass*1000).toFixed(1)}g | k=${params.stiffness}N/m | f0=${data.f0Hz}Hz</text>

  <!-- 状态标识区 (Power-on vs Power-off) -->
  <text x="${padding + 10}" y="${padding + 20}" fill="#00f2fe" font-size="12" font-weight="bold">⚡ 通电激励段 (0~45ms)</text>
  <text x="${stopX + 10}" y="${padding + 20}" fill="#ff4d4d" font-size="12" font-weight="bold">⏹️ 断电余震衰减段 (45~100ms)</text>

  <!-- 断电分割点垂直虚线 -->
  <line x1="${stopX}" y1="${padding}" x2="${stopX}" y2="${height - padding}" stroke="#ff4d4d" stroke-width="2" stroke-dasharray="6 4" />

  <!-- 网格背景 -->
  <g stroke="#21262d" stroke-width="1">
    <line x1="${padding}" y1="${scaleY(yBound)}" x2="${width - padding}" y2="${scaleY(yBound)}" stroke-dasharray="4 4" />
    <line x1="${padding}" y1="${scaleY(yBound/2)}" x2="${width - padding}" y2="${scaleY(yBound/2)}" stroke-dasharray="4 4" />
    <line x1="${padding}" y1="${scaleY(-yBound/2)}" x2="${width - padding}" y2="${scaleY(-yBound/2)}" stroke-dasharray="4 4" />
    <line x1="${padding}" y1="${scaleY(-yBound)}" x2="${width - padding}" y2="${scaleY(-yBound)}" stroke-dasharray="4 4" />
    ${gridLines.join('\n    ')}
  </g>

  <!-- 0 位移中心基准线 -->
  <line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="#58a6ff" stroke-width="1.5" stroke-dasharray="6 3"/>

  <!-- 坐标轴刻度文本 -->
  <g fill="#8b949e" font-size="11">
    ${timeLabels.join('\n    ')}
    <text x="${padding - 10}" y="${scaleY(yBound) + 4}" text-anchor="end">+${yBound}mm</text>
    <text x="${padding - 10}" y="${scaleY(yBound/2) + 4}" text-anchor="end">+${yStep}mm</text>
    <text x="${padding - 10}" y="${zeroY + 4}" text-anchor="end" fill="#58a6ff" font-weight="bold">0.0mm</text>
    <text x="${padding - 10}" y="${scaleY(-yBound/2) + 4}" text-anchor="end">-${yStep}mm</text>
    <text x="${padding - 10}" y="${scaleY(-yBound) + 4}" text-anchor="end">-${yBound}mm</text>
  </g>

  <!-- 静态渐变填充区域 -->
  <polygon points="${padding},${zeroY} ${points} ${width - padding},${zeroY}" fill="url(#polyGrad)" />

  <!-- 动态描边动画曲线 -->
  <polyline points="${points}" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
    <animate attributeName="stroke-dasharray" from="0 3500" to="3500 0" dur="3.5s" repeatCount="indefinite" />
  </polyline>

  <!-- 扫描前沿发光粒子 -->
  <circle r="6" fill="#00f2fe" filter="url(#glow)"><animateMotion path="M ${points}" dur="3.5s" repeatCount="indefinite" /></circle>
  <circle r="2.5" fill="#ffffff"><animateMotion path="M ${points}" dur="2.5s" repeatCount="indefinite" /></circle>

  <!-- 底部导流卡片提示 -->
  <rect x="${width - 310}" y="${height - 35}" width="250" height="22" rx="11" fill="#161b22" stroke="#30363d"/>
  <text x="${width - 185}" y="${height - 20}" fill="#58a6ff" font-size="11" text-anchor="middle" font-weight="600">⚡ Active Braking Algo @ ansv.net</text>
</svg>`;
}

runInteractiveDemo();
