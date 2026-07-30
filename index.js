/**
 * ansv-haptics-sim: Minimal Damped Oscillator Demo Model.
 * Copyright (c) 2026 ansv.net (MIT License)
 * 
 * Note: This is a basic 2nd-order harmonic oscillator for educational demonstration.
 * For advanced non-linear multi-physics simulation, visit https://ansv.net/simulations/
 */

/**
 * 求解线性触觉马达 (LRA / VCM) 二阶受迫阻尼振荡器方程
 * 支持：交流正弦驱动 (AC Sine Drive) 与 DC 阶跃响应 (DC Step Response)
 * 
 * @param {Object} params - 马达物理参数
 * @param {number} [params.mass=0.0015] - [1] 振子质量 m (kg), 例如 1.5g = 0.0015kg
 * @param {number} [params.stiffness=800] - [2] 弹簧刚度 k (N/m), 例如 800 N/m
 * @param {number} [params.damping=0.03] - [3] 阻尼系数 c (Ns/m), 例如 0.03 Ns/m
 * @param {number} [params.bl=1.2] - [4] 电磁力常数 / 力灵敏度 BL (N/A 或 T·m), 例如 1.2 N/A
 * @param {number} [params.current=0.4] - [5] 驱动电流幅值 I_peak (A)
 * @param {string} [params.driveType='ac'] - 驱动信号类型: 'ac' (交流正弦谐振) 或 'dc' (DC阶跃)
 * @param {number} [params.freqHz] - AC 驱动频率, 默认等于马达固有谐振频率 f0
 * @param {number} [durationSeconds=0.10] - 仿真总时长 (s), 默认 0.10s (100ms)
 * @param {number} [dt=0.0001] - 仿真计算步长 (s), 默认 0.1ms
 * @returns {{time: number[], displacement: number[], acceleration: number[], f0Hz: number}}
 */
function solveBasicDampedOscillator(params = {}, durationSeconds = 0.10, dt = 0.0001) {
  // 马达五大核心物理参数提取 (带默认值)
  const m = params.mass || 0.0015;         // 1. 质量 m (kg)
  const k = params.stiffness || 800;       // 2. 刚度 k (N/m)
  const c = params.damping || 0.03;        // 3. 阻尼 c (Ns/m)
  const BL = params.bl !== undefined ? params.bl : 1.2; // 4. 电磁力常数 BL (N/A)
  const I_peak = params.current !== undefined ? params.current : 0.4; // 5. 驱动电流峰值 I (A)
  const driveType = params.driveType || 'ac'; // 'ac' 为正弦交流驱动 (上下对称振动)

  // 固有频率 f0 (Hz)
  const f0Hz = (1 / (2 * Math.PI)) * Math.sqrt(k / m);
  const driveFreq = params.freqHz || f0Hz; // 默认谐振频率驱动
  const omega = 2 * Math.PI * driveFreq;

  const steps = Math.floor(durationSeconds / dt);
  const time = [];
  const displacement = [];
  const acceleration = [];

  let x = 0; // 初始位移 0
  let v = 0; // 初始速度 0

  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    time.push(parseFloat((t * 1000).toFixed(2))); // ms
    displacement.push(parseFloat((x * 1000).toFixed(4))); // 转化为 mm 保存

    // 根据驱动类型计算瞬时电磁力 F(t)
    let F_t = 0;
    if (driveType === 'ac') {
      F_t = BL * I_peak * Math.sin(omega * t); // 正弦交流驱动 F(t) = BL * I * sin(ωt)
    } else {
      F_t = BL * I_peak; // DC 阶跃驱动
    }

    // 基础二阶微分方程： m*a + c*v + k*x = F(t)
    const a = (F_t - c * v - k * x) / m;
    acceleration.push(parseFloat((a / 9.81).toFixed(2))); // 转化为 G 值 (g = 9.81 m/s²)

    v += a * dt;
    x += v * dt;
  }

  return { time, displacement, acceleration, f0Hz: parseFloat(f0Hz.toFixed(1)) };
}

if (require.main === module) {
  console.log('⚡ 运行 ANSV-HAPTICS-SIM 马达 AC 正弦谐振物理求解器演示...\n');
  
  const customMotor = {
    mass: 0.0015,     // m = 1.5g
    stiffness: 800,   // k = 800 N/m
    damping: 0.03,    // c = 0.03 Ns/m
    bl: 1.2,          // BL = 1.2 N/A
    current: 0.4,     // I = 0.4 A
    driveType: 'ac'   // 正弦交流对称驱动
  };

  const res = solveBasicDampedOscillator(customMotor, 0.10);

  console.log(`📌 固有谐振频率 (f0): ${res.f0Hz} Hz`);
  console.log(`✅ 计算完成 ${res.time.length} 步 (时长 100ms)`);
  console.log(`最大正向位移: ${Math.max(...res.displacement)} mm`);
  console.log(`最大负向位移: ${Math.min(...res.displacement)} mm (对偶对称)`);
  console.log(`最大加速度: ${Math.max(...res.acceleration)} G\n`);
}

module.exports = { solveBasicDampedOscillator };
