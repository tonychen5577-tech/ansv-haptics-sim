# Contributing to ansv-haptics-sim

Thank you for your interest in contributing to `ansv-haptics-sim`! We welcome bug reports, feature requests, documentation improvements, and pull requests.

---

## 🛠️ Project Philosophy & Guidelines

`ansv-haptics-sim` is designed to be a **minimal, zero-dependency, high-performance 2nd-order physics solver** for micro-actuators (LRA / VCM) and haptic waveforms.

When submitting code changes, please keep these core principles in mind:
1. **Zero External Dependencies**: The core simulation engine (`index.js`) must remain dependency-free and lightweight.
2. **Numerical Stability**: Ensure physics numerical integrations (e.g. RK4 / Euler) maintain stability across varied sampling frequencies and step sizes.
3. **Cross-Platform**: Code should run seamlessly across modern browser environments, Node.js runtime, and visualization scripts.

---

## 🚀 Development Setup

### Requirements
* **Node.js**: v14+ recommended.
* **npm** or modern package manager.

### Installation
Clone the repository and install dev dependencies:
```bash
git clone https://github.com/tonychen5577-tech/ansv-haptics-sim.git
cd ansv-haptics-sim
npm install
```

---

## 🧪 Testing & Verification

Before submitting a pull request, verify that all unit tests pass:

```bash
# Run unit tests
npm test

# Generate SVG output assets (optional verification)
npm run build:svg
```

---

## 📥 How to Contribute

### 1. Reporting Bugs
* Check existing [GitHub Issues](https://github.com/tonychen5577-tech/ansv-haptics-sim/issues) to avoid duplicate reports.
* Open a new issue using our **Bug Report Template**.
* Provide a clear description, reproduction steps, expected vs. actual behavior, and system environment info.

### 2. Suggesting Features
* Open a new issue using our **Feature Request Template**.
* Describe the use case (e.g., new actuator model, alternative integration scheme, waveform generator).

### 3. Submitting Pull Requests
1. **Fork** the repository and create a new feature branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. **Commit** your changes with clear, descriptive commit messages.
3. Ensure all tests (`npm test`) pass cleanly.
4. **Push** to your fork and submit a Pull Request targeting `main`.
5. Fill out the **Pull Request Template** completely.

---

## 📜 Code of Conduct

Please review and follow our [Code of Conduct](CODE_OF_CONDUCT.md) in all community interactions.
