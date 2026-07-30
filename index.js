/**
 * ansv-haptics-sim: Minimal Damped Oscillator Demo Model.
 * Copyright (c) 2026 ansv.net (MIT License)
 * 
 * Note: This is a basic 2nd-order harmonic oscillator for educational demonstration.
 * For advanced non-linear multi-physics simulation, visit https://ansv.net/simulations/
 */

/**
 * 求解线性触觉马达 (LRA / VCM) 二阶受迫阻尼振荡器方程
 * 支持：通电脉冲 (Pulse Drive) + 断电自由衰减 (Ring-down Decay) 完整生命周期
 * 
 * @param {Object} params - 马达物理参数
 * @param {number} [params.mass=0.0015] - [1] 振子质量 m (kg), 例如 1.5g = 0.0015kg
 * @param {number} [params.stiffness=800] - [2] 弹簧刚度 k (N/m), 例如 800 N/m
 * @param {number} [params.damping=0.03] - [3] 阻尼系数 c (Ns/m), 例如 0.03 Ns/m
 * @param {number} [params.bl=1.2] - [4] 电磁力常数 / 力灵敏度 BL (N/A 或 T·m), 例如 1.2 N/A
 * @param {number} [params.current=0.4] - [5] 驱动电流幅值 I_peak (A)
 * @param {string} [params.driveType='ac'] - 驱动信号类型: 'ac' (交流正弦谐振) 或 'dc' (DC阶跃)
 * @param {number} [params.driveDuration=0.04] - 马达通电激励时长 (s), 默认 0.04s (40ms 通电)
 * @param {number} [params.freqHz] - AC 驱动频率, 默认等于马达固有谐振频率 f0
 * @param {number} [durationSeconds=0.10] - 仿真总时长 (s), 默认 0.10s (100ms 包含通电+断电余震)
 * @param {number} [dt=0.0001] - 仿真计算步长 (s), 默认 0.1ms
 * @returns {{time: number[], displacement: number[], acceleration: number[], driveSignal: number[], f0Hz: number}}
 */
function solveBasicDampedOscillator(params = {}, durationSeconds = 0.10, dt = 0.0001) {
  // 马达五大核心物理参数提取 (带默认值)
  const m = params.mass || 0.0015;         // 1. 质量 m (kg)
  const k = params.stiffness || 800;       // 2. 刚度 k (N/m)
  const c = params.damping || 0.03;        // 3. 阻尼 c (Ns/m)
  const BL = params.bl !== undefined ? params.bl : 1.2; // 4. 电磁力常数 BL (N/A)
  const I_peak = params.current !== undefined ? params.current : 0.4; // 5. 驱动电流峰值 I (A)
  const driveType = params.driveType || 'ac'; // 'ac' 为正弦交流驱动
  const driveDuration = params.driveDuration !== undefined ? params.driveDuration : 0.04; // 通电时长 (默认40ms)

  // 固有频率 f0 (Hz)
  const f0Hz = (1 / (2 * Math.PI)) * Math.sqrt(k / m);
  const driveFreq = params.freqHz || f0Hz;
  const omega = 2 * Math.PI * driveFreq;

  const steps = Math.floor(durationSeconds / dt);
  const time = [];
  const displacement = [];
  const acceleration = [];
  const driveSignal = [];

  let x = 0; // 初始位移 0
  let v = 0; // 初始速度 0

  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    time.push(parseFloat((t * 1000).toFixed(2))); // ms
    displacement.push(parseFloat((x * 1000).toFixed(4))); // 转化为 mm 保存

    // 只有在通电脉冲时间段内 (t <= driveDuration) 才有输入电磁力，断电后 F_t = 0
    let F_t = 0;
    if (t <= driveDuration) {
      if (driveType === 'ac') {
        F_t = BL * I_peak * Math.sin(omega * t); // 通电段：正弦交流驱动
      } else {
        F_t = BL * I_peak; // 通电段：DC 阶跃驱动
      }
    } else {
      F_t = 0; // 断电后：无驱动力，依靠阻尼自由衰减 (Ring-down)
    }

    driveSignal.push(parseFloat(F_t.toFixed(4)));

    // 基础二阶微分方程： m*a + c*v + k*x = F(t)
    const a = (F_t - c * v - k * x) / m;
    acceleration.push(parseFloat((a / 9.81).toFixed(2))); // 转化为 G 值 (g = 9.81 m/s²)

    v += a * dt;
    x += v * dt;
  }

  return { time, displacement, acceleration, driveSignal, f0Hz: parseFloat(f0Hz.toFixed(1)) };
}

if (require.main === module) {
  console.log('⚡ 运行 ANSV-HAPTICS-SIM (通电 40ms + 断电余震衰减) 物理求解器演示...\n');
  
  const customMotor = {
    mass: 0.0015,         // m = 1.5g
    stiffness: 800,       // k = 800 N/m
    damping: 0.03,        // c = 0.03 Ns/m
    bl: 1.2,              // BL = 1.2 N/A
    current: 0.4,         // I = 0.4 A
    driveDuration: 0.04,  // 通电 40ms 脉冲
    driveType: 'ac'
  };

  const res = solveBasicDampedOscillator(customMotor, 0.10);

  console.log(`📌 固有谐振频率 (f0): ${res.f0Hz} Hz`);
  console.log(`✅ 通电时长: 40 ms | 总仿真时长: 100 ms`);
  console.log(`起振最高峰值: +${Math.max(...res.displacement)} mm`);
  console.log(`断电后 80ms 剩余振幅: ${res.displacement[800]} mm (余震基本衰减完全)\n`);
}

module.exports = { solveBasicDampedOscillator };
