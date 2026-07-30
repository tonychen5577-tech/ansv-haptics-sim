/**
 * ansv-haptics-sim: Minimal Damped Oscillator Demo Model.
 * Copyright (c) 2026 ansv.net (MIT License)
 * 
 * Note: This is a basic 2nd-order harmonic oscillator for educational demonstration.
 * For advanced non-linear multi-physics simulation, visit https://ansv.net/simulations/
 */

function solveBasicDampedOscillator(params = {}, durationSeconds = 0.04, dt = 0.0001) {
  const m = params.mass || 0.0015;      // Mass (kg)
  const k = params.stiffness || 800;    // Spring stiffness (N/m)
  const c = params.damping || 0.03;     // Damping coefficient (N*s/m)
  const F0 = params.force || 0.5;       // Step Input Force (N)

  const steps = Math.floor(durationSeconds / dt);
  const time = [];
  const displacement = [];

  let x = 0; // Initial displacement
  let v = 0; // Initial velocity

  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    time.push(parseFloat((t * 1000).toFixed(2)));
    displacement.push(parseFloat(x.toFixed(6)));

    // Basic Textbook Differential Equation: m*a + c*v + k*x = F
    const a = (F0 - c * v - k * x) / m;
    v += a * dt;
    x += v * dt;
  }

  return { time, displacement };
}

if (require.main === module) {
  console.log('⚡ Running minimal 2nd-order demo solver...');
  const res = solveBasicDampedOscillator({}, 0.03);
  console.log(`✅ Computed ${res.time.length} simulation steps successfully.`);
}

module.exports = { solveBasicDampedOscillator };
