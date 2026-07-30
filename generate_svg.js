const fs = require('fs');
const path = require('path');
const { solveBasicDampedOscillator } = require('./index');

function runInteractiveDemo() {
  const args = process.argv.slice(2);
  
  let params = {
    mass: 0.0015,
    stiffness: 800,
    damping: 0.10,
    bl: 1.2,
    current: 0.4,
    driveType: 'ac',
    driveDuration: 0.200,
    duration: 0.260,
    lang: 'en' // 默认英文输出，可使用 --lang=zh 或 --lang=en 自由切换
  };

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, val] = arg.replace('--', '').split('=');
      if (key && val) {
        params[key] = isNaN(parseFloat(val)) ? val : parseFloat(val);
      }
    }
  });

  const isZh = params.lang === 'zh' || params.lang === 'cn';

  if (isZh) {
    console.log('----------------------------------------------------');
    console.log('⚡ ANSV-HAPTICS-SIM | 按序单向从左向右实时扫频生成');
    console.log('----------------------------------------------------');
    console.log(` 1. 振子质量 (m)  : ${(params.mass * 1000).toFixed(2)} g (${params.mass} kg)`);
    console.log(` 2. 弹簧刚度 (k)  : ${params.stiffness} N/m`);
    console.log(` 3. 阻尼系数 (c)  : ${params.damping} Ns/m`);
    console.log(` 4. 力灵敏度 (BL) : ${params.bl} N/A`);
    console.log(` 5. 驱动电流 (I)  : ${params.current} A`);
    console.log(` 🚀 1. 起振段     : 0 ~ 45 ms (Transient Rise-time)`);
    console.log(` ⚡ 2. 稳态长振动 : 45 ~ 200 ms (Extended Steady-State 155ms)`);
    console.log(` ⏹️ 3. 断电衰减   : 200 ~ 260 ms (Ring-down Decay 60ms)`);
    console.log('----------------------------------------------------');
  } else {
    console.log('----------------------------------------------------');
    console.log('⚡ ANSV-HAPTICS-SIM | Sequential Sweep Simulation CLI');
    console.log('----------------------------------------------------');
    console.log(` 1. Moving Mass (m)  : ${(params.mass * 1000).toFixed(2)} g (${params.mass} kg)`);
    console.log(` 2. Stiffness (k)    : ${params.stiffness} N/m`);
    console.log(` 3. Damping (c)      : ${params.damping} Ns/m`);
    console.log(` 4. Force Factor(BL) : ${params.bl} N/A`);
    console.log(` 5. Drive Current(I) : ${params.current} A`);
    console.log(` 🚀 1. Rise Time     : 0 ~ 45 ms`);
    console.log(` ⚡ 2. Steady State  : 45 ~ 200 ms (155ms Extended Vibration)`);
    console.log(` ⏹️ 3. Ring-down     : 200 ~ 260 ms (60ms Cutoff Decay)`);
    console.log('----------------------------------------------------');
  }

  const res = solveBasicDampedOscillator(params, params.duration, 0.0001);

  if (isZh) {
    console.log(`📌 固有谐振频率 (f0) : ${res.f0Hz} Hz`);
    console.log(`📈 稳态长振动幅值: ±${Math.max(...res.displacement.slice(600, 1800)).toFixed(2)} mm`);
  } else {
    console.log(`📌 Resonant Frequency (f0) : ${res.f0Hz} Hz`);
    console.log(`📈 Steady-State Amplitude : ±${Math.max(...res.displacement.slice(600, 1800)).toFixed(2)} mm`);
  }
  console.log('----------------------------------------------------\n');

  const svgContent = generateSVGAnimation(res, params);
  const docsDir = path.join(__dirname, 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, 'simulation.svg'), svgContent);
  console.log(isZh ? '✨ 已更新生成 SVG 动态图表！' : '✨ Generated SVG simulation animation successfully!');
}

function generateSVGAnimation(data, params) {
  const width = 1000;
  const height = 440;
  const padding = 65;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  const times = data.time;
  const displacements = data.displacement;

  const maxT = Math.max(...times);
  const maxAbsDisp = Math.max(...displacements.map(Math.abs));
  
  const yBound = Math.ceil(maxAbsDisp * 1.2 * 10) / 10 || 8.0;
  const yMin = -yBound;
  const yMax = yBound;

  function scaleX(t) { return padding + (t / maxT) * graphWidth; }
  function scaleY(d) { return height - padding - ((d - yMin) / (yMax - yMin)) * graphHeight; }

  const points = times.map((t, i) => `${scaleX(t).toFixed(2)},${scaleY(displacements[i]).toFixed(2)}`).join(' ');
  const zeroY = scaleY(0);

  const riseX = scaleX(45);
  const stopX = scaleX(params.driveDuration * 1000);

  const timeLabels = [];
  const gridLines = [];
  for (let t = 0; t <= maxT; t += 40) {
    const xPos = scaleX(t);
    gridLines.push(`<line x1="${xPos.toFixed(1)}" y1="${padding}" x2="${xPos.toFixed(1)}" y2="${height - padding}" stroke-dasharray="4 4"/>`);
    timeLabels.push(`<text x="${xPos.toFixed(1)}" y="${height - padding + 22}" text-anchor="middle">${t}ms</text>`);
  }

  const yStep = (yBound / 2).toFixed(1);
  const totalAnimDuration = 6.0;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  <defs>
    <linearGradient id="polyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.30"/>
      <stop offset="50%" stop-color="#4facfe" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#0066ff" stop-opacity="0.30"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f2fe"/>
      <stop offset="20%" stop-color="#00ff87"/>
      <stop offset="75%" stop-color="#00ff87"/>
      <stop offset="100%" stop-color="#ff0055"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <clipPath id="waveClip">
      <rect x="0" y="0" width="0" height="${height}">
        <animate attributeName="width" values="${padding};${width - padding};${width - padding}" keyTimes="0; 0.85; 1" dur="${totalAnimDuration}s" repeatCount="indefinite" />
      </rect>
    </clipPath>
  </defs>

  <rect x="${padding}" y="${padding}" width="${riseX - padding}" height="${graphHeight}" fill="#00f2fe" fill-opacity="0.04" />
  <rect x="${riseX}" y="${padding}" width="${stopX - riseX}" height="${graphHeight}" fill="#00ff87" fill-opacity="0.04" />
  <rect x="${stopX}" y="${padding}" width="${width - padding - stopX}" height="${graphHeight}" fill="#ff0055" fill-opacity="0.03" />

  <text x="${padding}" y="34" fill="#f0f6fc" font-size="16" font-weight="700">⚡ ANSV-HAPTICS-SIM | Sequential Lifecycle (Rise -&gt; Extended Steady State -&gt; Ring-down)</text>
  <text x="${width - padding}" y="34" fill="#8b949e" font-size="12" text-anchor="end">m=${(params.mass*1000).toFixed(1)}g | k=${params.stiffness}N/m | f0=${data.f0Hz}Hz</text>

  <text x="${padding + 5}" y="${padding + 20}" fill="#00f2fe" font-size="11" font-weight="bold">🚀 1. Rise Time (0~45ms)</text>
  <text x="${riseX + 20}" y="${padding + 20}" fill="#00ff87" font-size="11" font-weight="bold">⚡ 2. Extended Steady State (45~200ms)</text>
  <text x="${stopX + 10}" y="${padding + 20}" fill="#ff4d4d" font-size="11" font-weight="bold">⏹️ 3. Ring-down (200~260ms)</text>

  <line x1="${riseX}" y1="${padding}" x2="${riseX}" y2="${height - padding}" stroke="#00ff87" stroke-width="1.5" stroke-dasharray="4 4" />
  <line x1="${stopX}" y1="${padding}" x2="${stopX}" y2="${height - padding}" stroke="#ff4d4d" stroke-width="2" stroke-dasharray="6 4" />

  <g stroke="#21262d" stroke-width="1">
    <line x1="${padding}" y1="${scaleY(yBound)}" x2="${width - padding}" y2="${scaleY(yBound)}" stroke-dasharray="4 4" />
    <line x1="${padding}" y1="${scaleY(yBound/2)}" x2="${width - padding}" y2="${scaleY(yBound/2)}" stroke-dasharray="4 4" />
    <line x1="${padding}" y1="${scaleY(-yBound/2)}" x2="${width - padding}" y2="${scaleY(-yBound/2)}" stroke-dasharray="4 4" />
    <line x1="${padding}" y1="${scaleY(-yBound)}" x2="${width - padding}" y2="${scaleY(-yBound)}" stroke-dasharray="4 4" />
    ${gridLines.join('\n    ')}
  </g>

  <line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="#58a6ff" stroke-width="1.5" stroke-dasharray="6 3"/>

  <g fill="#8b949e" font-size="11">
    ${timeLabels.join('\n    ')}
    <text x="${padding - 10}" y="${scaleY(yBound) + 4}" text-anchor="end">+${yBound}mm</text>
    <text x="${padding - 10}" y="${scaleY(yBound/2) + 4}" text-anchor="end">+${yStep}mm</text>
    <text x="${padding - 10}" y="${zeroY + 4}" text-anchor="end" fill="#58a6ff" font-weight="bold">0.0mm</text>
    <text x="${padding - 10}" y="${scaleY(-yBound/2) + 4}" text-anchor="end">-${yStep}mm</text>
    <text x="${padding - 10}" y="${scaleY(-yBound) + 4}" text-anchor="end">-${yBound}mm</text>
  </g>

  <g clip-path="url(#waveClip)">
    <polygon points="${padding},${zeroY} ${points} ${width - padding},${zeroY}" fill="url(#polyGrad)" />
    <polyline points="${points}" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />
  </g>

  <circle r="6" fill="#00f2fe" filter="url(#glow)">
    <animateMotion path="M ${points}" values="0; 1; 1" keyTimes="0; 0.85; 1" dur="${totalAnimDuration}s" repeatCount="indefinite" />
  </circle>
  <circle r="2.5" fill="#ffffff">
    <animateMotion path="M ${points}" values="0; 1; 1" keyTimes="0; 0.85; 1" dur="${totalAnimDuration}s" repeatCount="indefinite" />
  </circle>

  <rect x="${width - 310}" y="${height - 35}" width="250" height="22" rx="11" fill="#161b22" stroke="#30363d"/>
  <text x="${width - 185}" y="${height - 20}" fill="#58a6ff" font-size="11" text-anchor="middle" font-weight="600">⚡ Advanced Transient Algo @ ansv.net</text>
</svg>`;
}

runInteractiveDemo();
