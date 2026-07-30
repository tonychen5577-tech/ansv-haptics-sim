const assert = require('assert');
const { solveBasicDampedOscillator } = require('./index');

console.log('🧪 Running ansv-haptics-sim unit tests...\n');

// Test Case 1: Dimension & Step Verification
{
  const duration = 0.04;
  const dt = 0.0001;
  const res = solveBasicDampedOscillator({}, duration, dt);
  
  assert.strictEqual(res.time.length, 400, 'Total step count should be 400');
  assert.strictEqual(res.displacement.length, 400, 'Displacement points length matching time steps');
  assert.strictEqual(res.displacement[0], 0, 'Initial displacement must be 0');
  console.log('✅ Test 1 Passed: Initial parameters and step sizes match expected dimensions.');
}

// Test Case 2: Damped Decay Physical Law Check (Using DC Step Response for Ring-Down Decay)
{
  const res = solveBasicDampedOscillator({ damping: 0.03, driveType: 'dc' }, 0.1, 0.0001);
  const disp = res.displacement;
  
  let peakValues = [];
  for (let i = 1; i < disp.length - 1; i++) {
    if (disp[i] >= disp[i - 1] && disp[i] >= disp[i + 1] && disp[i] > 0) {
      if (peakValues.length === 0 || Math.abs(disp[i] - peakValues[peakValues.length - 1]) > 0.01) {
        peakValues.push(disp[i]);
      }
    }
  }
  
  assert.ok(peakValues.length >= 2, 'Should detect at least 2 distinct positive peaks');
  assert.ok(peakValues[0] > peakValues[1], `Peak 1 (${peakValues[0]}mm) must be strictly greater than Peak 2 (${peakValues[1]}mm) under DC step damping`);
  console.log(`✅ Test 2 Passed: Physical damping verified (Peak 1: ${peakValues[0]}mm > Peak 2: ${peakValues[1]}mm).`);
}

console.log('\n🎉 All unit tests executed successfully!');
