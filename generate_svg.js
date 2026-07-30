const fs = require('fs');
const path = require('path');
const { solveBasicDampedOscillator } = require('./index');

function runInteractiveDemo() {
  const args = process.argv.slice(2);
  
  // 基础默认参数 (五大参数与仿真时长)
  let params = {
    mass: 0.0015,
    stiffness: 800,
    damping: 0.03,
    bl: 1.2,
    current: 0.4,
    duration: 0.10 // 默认仿真时长拉长至 100ms (0.1s)，以展示完整多周期阻尼衰减与稳态
  };

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, val] = arg.replace('--', '').split('=');
      if (key && val && !isNaN(parseFloat(val))) {
        params[key] = parseFloat(val);
      }
    }
  });

  console.log('----------------------------------------------------');
  console.log('⚡ ANSV-HAPTICS-SIM | 交互式马达参数物理求解器');
  console.log('----------------------------------------------------');
  console.log(` 1. 振子质量 (m)  : ${(params.mass * 1000).toFixed(2)} g (${params.mass} kg)`);
  console.log(` 2. 弹簧刚度 (k)  : ${params.stiffness} N/m`);
  console.log(` 3. 阻尼系数 (c)  : ${params.damping} Ns/m`);
  console.log(` 4. 力灵敏度 (BL) : ${params.bl} N/A`);
  console.log(` 5. 驱动电流 (I)  : ${params.current} A  (推力 F = ${(params.bl * params.current).toFixed(2)} N)`);
  console.log(` ⏱️ 仿真时长(Time) : ${(params.duration * 1000).toFixed(0)} ms`);
  console.log('----------------------------------------------------');

  const res = solveBasicDampedOscillator(params, params.duration, 0.0001);

  console.log(`📌 固有谐振频率 (f0) : ${res.f0Hz} Hz`);
  console.log(`📈 最大位移 (Peak Disp): ${Math.max(...res.displacement)} mm`);
  console.log(`🚀 最大加速度 (Peak Acc): ${Math.max(...res.acceleration)} G`);
  console.log('----------------------------------------------------\n');

  // 生成终端 ASCII 波形
  generateCLIChart(res);

  // 重新渲染完整周期的 SVG 图形
  const svgContent = generateSVGAnimation(res, params);
  const docsDir = path.join(__dirname, 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, 'simulation.svg'), svgContent);
  console.log('✨ 已自动生成并更新 docs/simulation.svg 100ms 完整周期动画曲线！');
}

function generateCLIChart(data) {
  console.log('📊 终端简易位移响应曲线 (100ms 完整包络预览):');
  const width = 45;
  const maxD = Math.max(...data.displacement.map(Math.abs));
  
  // 抽样 20 个点显示全貌
  const sampleInterval = Math.floor(data.time.length / 20);
  for (let i = 0; i < data.time.length; i += sampleInterval) {
    const t = data.time[i];
    const d = data.displacement[i];
    const pos = Math.round((d / (maxD || 1)) * (width / 2)) + Math.floor(width / 2);
    let line = Array(width + 1).fill(' ');
    line[Math.floor(width / 2)] = '|';
    line[pos] = '*';
    console.log(`${t.toFixed(1).padStart(5)}ms: ${line.join('')} (${d.toFixed(3)}mm)`);
  }
  console.log('');
}

function generateSVGAnimation(data, params) {
  const width = 900; // 横向宽度扩展至 900
  const height = 400;
  const padding = 60;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  const times = data.time;
  const displacements = data.displacement;

  const maxT = Math.max(...times);
  const minDisp = Math.min(...displacements);
  const maxDisp = Math.max(...displacements);
  
  const yMin = Math.floor(minDisp * 1.2 * 10) / 10;
  const yMax = Math.ceil(maxDisp * 1.2 * 10) / 10;

  function scaleX(t) { return padding + (t / maxT) * graphWidth; }
  function scaleY(d) { return height - padding - ((d - yMin) / (yMax - yMin)) * graphHeight; }

  const points = times.map((t, i) => `${scaleX(t).toFixed(2)},${scaleY(displacements[i]).toFixed(2)}`).join(' ');
  const zeroY = scaleY(0);

  // 动态生成时间轴刻度标签 (按 20ms 间隔)
  const timeLabels = [];
  const gridLines = [];
  const interval = maxT > 60 ? 20 : 10;
  for (let t = 0; t <= maxT; t += interval) {
    const xPos = scaleX(t);
    gridLines.push(`<line x1="${xPos.toFixed(1)}" y1="${padding}" x2="${xPos.toFixed(1)}" y2="${height - padding}" stroke-dasharray="4 4"/>`);
    timeLabels.push(`<text x="${xPos.toFixed(1)}" y="${height - padding + 20}" text-anchor="middle">${t}ms</text>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  <defs>
    <linearGradient id="polyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#4facfe" stop-opacity="0.0"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f2fe"/>
      <stop offset="50%" stop-color="#4facfe"/>
      <stop offset="100%" stop-color="#0066ff"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Title Header -->
  <text x="${padding}" y="36" fill="#f0f6fc" font-size="17" font-weight="700">⚡ ANSV-HAPTICS-SIM | 2nd-Order Transient & Damped Response</text>
  <text x="${width - padding}" y="36" fill="#8b949e" font-size="12" text-anchor="end">m=${(params.mass*1000).toFixed(1)}g | k=${params.stiffness}N/m | c=${params.damping} | f0=${data.f0Hz}Hz</text>

  <!-- 网格背景 -->
  <g stroke="#21262d" stroke-width="1">
    <line x1="${padding}" y1="${scaleY(0.6)}" x2="${width - padding}" y2="${scaleY(0.6)}" stroke-dasharray="4 4" />
    <line x1="${padding}" y1="${scaleY(0.3)}" x2="${width - padding}" y2="${scaleY(0.3)}" stroke-dasharray="4 4" />
    <line x1="${padding}" y1="${scaleY(-0.3)}" x2="${width - padding}" y2="${scaleY(-0.3)}" stroke-dasharray="4 4" />
    ${gridLines.join('\n    ')}
  </g>

  <!-- 0 位移基准线 -->
  <line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="#30363d" stroke-width="1.5" />

  <!-- 坐标轴刻度文本 -->
  <g fill="#8b949e" font-size="11">
    ${timeLabels.join('\n    ')}
    <text x="${padding - 10}" y="${scaleY(0.6) + 4}" text-anchor="end">+0.6mm</text>
    <text x="${padding - 10}" y="${scaleY(0.3) + 4}" text-anchor="end">+0.3mm</text>
    <text x="${padding - 10}" y="${zeroY + 4}" text-anchor="end">0.0mm</text>
    <text x="${padding - 10}" y="${scaleY(-0.3) + 4}" text-anchor="end">-0.3mm</text>
  </g>

  <!-- 静态渐变填充区域 -->
  <polygon points="${padding},${zeroY} ${points} ${width - padding},${zeroY}" fill="url(#polyGrad)" />

  <!-- 动态描边动画曲线 -->
  <polyline points="${points}" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
    <animate attributeName="stroke-dasharray" from="0 3500" to="3500 0" dur="3.5s" repeatCount="indefinite" />
  </polyline>

  <!-- 扫描前沿发光粒子 -->
  <circle r="6" fill="#00f2fe" filter="url(#glow)"><animateMotion path="M ${points}" dur="3.5s" repeatCount="indefinite" /></circle>
  <circle r="2.5" fill="#ffffff"><animateMotion path="M ${points}" dur="3.5s" repeatCount="indefinite" /></circle>

  <!-- 底部导流卡片提示 -->
  <rect x="${width - 310}" y="${height - 35}" width="250" height="22" rx="11" fill="#161b22" stroke="#30363d"/>
  <text x="${width - 185}" y="${height - 20}" fill="#58a6ff" font-size="11" text-anchor="middle" font-weight="600">⚡ Commercial Multi-Physics @ ansv.net</text>
</svg>`;
}

runInteractiveDemo();
