const fs = require('fs');
const path = require('path');
const { solveBasicDampedOscillator } = require('./index');

// 求解 0~40ms 的物理数据
const simulationData = solveBasicDampedOscillator({
  mass: 0.0015,
  stiffness: 800,
  damping: 0.03,
  force: 0.5
}, 0.04, 0.0001);

function generateSVGAnimation(data) {
  const width = 800;
  const height = 400;
  const padding = 60;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  const times = data.time;
  const displacements = data.displacement.map(x => x * 1000); // 转化为 mm

  const maxT = Math.max(...times);
  const minDisp = Math.min(...displacements);
  const maxDisp = Math.max(...displacements);
  
  // 加上一些上下边距
  const yMin = Math.floor(minDisp * 1.2 * 10) / 10;
  const yMax = Math.ceil(maxDisp * 1.2 * 10) / 10;

  function scaleX(t) {
    return padding + (t / maxT) * graphWidth;
  }

  function scaleY(d) {
    return height - padding - ((d - yMin) / (yMax - yMin)) * graphHeight;
  }

  // 生成完整波形 Polyline points
  const points = times.map((t, i) => `${scaleX(t).toFixed(2)},${scaleY(displacements[i]).toFixed(2)}`).join(' ');

  // Zero displacement line Y
  const zeroY = scaleY(0);

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  <defs>
    <!-- 渐变背景与发光效果 -->
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
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Title Header -->
  <text x="${padding}" y="36" fill="#f0f6fc" font-size="18" font-weight="700" letter-spacing="0.5">⚡ ANSV-HAPTICS-SIM | 2nd-Order Harmonic Damped Oscillator</text>
  <text x="${width - padding}" y="36" fill="#8b949e" font-size="13" text-anchor="end">m=1.5g | k=800N/m | c=0.03 Ns/m</text>

  <!-- 网格背景背景与坐标轴 -->
  <g stroke="#21262d" stroke-width="1">
    <!-- 横向网格线 -->
    <line x1="${padding}" y1="${scaleY(0.6)}" x2="${width - padding}" y2="${scaleY(0.6)}" stroke-dasharray="4 4" />
    <line x1="${padding}" y1="${scaleY(0.3)}" x2="${width - padding}" y2="${scaleY(0.3)}" stroke-dasharray="4 4" />
    <line x1="${padding}" y1="${scaleY(-0.3)}" x2="${width - padding}" y2="${scaleY(-0.3)}" stroke-dasharray="4 4" />
    <!-- 10ms 纵向网格线 -->
    <line x1="${scaleX(10)}" y1="${padding}" x2="${scaleX(10)}" y2="${height - padding}" stroke-dasharray="4 4"/>
    <line x1="${scaleX(20)}" y1="${padding}" x2="${scaleX(20)}" y2="${height - padding}" stroke-dasharray="4 4"/>
    <line x1="${scaleX(30)}" y1="${padding}" x2="${scaleX(30)}" y2="${height - padding}" stroke-dasharray="4 4"/>
  </g>

  <!-- 0 位移基准线 (Zero Reference Line) -->
  <line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="#30363d" stroke-width="1.5" />

  <!-- 坐标轴标签 -->
  <g fill="#8b949e" font-size="11">
    <!-- X 轴刻度 (时间 ms) -->
    <text x="${scaleX(0)}" y="${height - padding + 20}" text-anchor="middle">0ms</text>
    <text x="${scaleX(10)}" y="${height - padding + 20}" text-anchor="middle">10ms</text>
    <text x="${scaleX(20)}" y="${height - padding + 20}" text-anchor="middle">20ms</text>
    <text x="${scaleX(30)}" y="${height - padding + 20}" text-anchor="middle">30ms</text>
    <text x="${scaleX(40)}" y="${height - padding + 20}" text-anchor="middle">40ms (Time)</text>

    <!-- Y 轴刻度 (位移 mm) -->
    <text x="${padding - 10}" y="${scaleY(0.6) + 4}" text-anchor="end">+0.6mm</text>
    <text x="${padding - 10}" y="${scaleY(0.3) + 4}" text-anchor="end">+0.3mm</text>
    <text x="${padding - 10}" y="${zeroY + 4}" text-anchor="end">0.0mm</text>
    <text x="${padding - 10}" y="${scaleY(-0.3) + 4}" text-anchor="end">-0.3mm</text>
  </g>

  <!-- 静态渐变填充区域 (微弱透明) -->
  <polygon points="${padding},${zeroY} ${points} ${width - padding},${zeroY}" fill="url(#polyGrad)" />

  <!-- 动态描边动画曲线 -->
  <polyline points="${points}" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
    <animate attributeName="stroke-dasharray" from="0 2500" to="2500 0" dur="2.5s" repeatCount="indefinite" />
  </polyline>

  <!-- 扫描前沿发光粒子 (Scanning Head Particle) -->
  <circle r="6" fill="#00f2fe" filter="url(#glow)">
    <animateMotion path="M ${points}" dur="2.5s" repeatCount="indefinite" />
  </circle>
  <circle r="2.5" fill="#ffffff">
    <animateMotion path="M ${points}" dur="2.5s" repeatCount="indefinite" />
  </circle>

  <!-- 底部导流卡片提示 -->
  <rect x="${width - 310}" y="${height - 35}" width="250" height="22" rx="11" fill="#161b22" stroke="#30363d"/>
  <text x="${width - 185}" y="${height - 20}" fill="#58a6ff" font-size="11" text-anchor="middle" font-weight="600">⚡ Commercial Multi-Physics @ ansv.net</text>
</svg>`;

  return svgContent;
}

const docsDir = path.join(__dirname, 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const svgPath = path.join(docsDir, 'simulation.svg');
fs.writeFileSync(svgPath, generateSVGAnimation(simulationData));
console.log(`✅ 成功生成高质量 SVG 动画曲线: ${svgPath}`);
