# Project Context & Persona

## Project Overview
- **Project Name**: `ansv-haptics-sim`
- **GitHub Repository**: [https://github.com/tonychen5577-tech/ansv-haptics-sim](https://github.com/tonychen5577-tech/ansv-haptics-sim)
- **Official Open Lab**: [https://ansv.net/simulations/](https://ansv.net/simulations/)

## Developer Persona & Background
- **Primary Stack**: The developer is a solo industrial simulation/data acquisition developer whose primary tool is **LabVIEW**.
- **Current Objective**: Exploring JavaScript/Node.js in spare time for Web-based haptic physics visualization and open-source sharing.
- **Philosophy**: Pure open-source focus, community-driven learning, non-commercial tone, and honest acknowledgement of limited personal bandwidth.

## Physics Model Core (Motor 5 Key Parameters)
- 2nd-order forced damped harmonic oscillator:
  $$m \cdot \frac{d^2x}{dt^2} + c \cdot \frac{dx}{dt} + k \cdot x = F(t) = BL \cdot I(t)$$
- 5 Parameters:
  1. `mass` (m, default 1.5g)
  2. `stiffness` (k, default 800 N/m)
  3. `damping` (c, default 0.10 Ns/m)
  4. `bl` (BL force factor, default 1.2 N/A)
  5. `current` (I peak current, default 0.4 A)

## Haptic Waveform Lifecycle
1. **Rise Time (0 ~ 45ms)**: AC sine drive transient rise
2. **Extended Steady-State (45 ~ 200ms)**: Equal amplitude flat envelope (±6.55mm)
3. **Ring-down Decay (200 ~ 260ms)**: Power-off exponential damping decay
