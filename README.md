# ⚡ ansv-haptics-sim

> **A Minimal 2nd-Order Harmonic Oscillator Demo for Actuator Physics.**  
> 简易二阶阻尼振荡器与马达五大物理参数模型。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build & Test](https://img.shields.io/badge/tests-passing-brightgreen.svg)](test.js)

---

## 📈 Interactive Simulation Preview 动态模拟效果展示

以下为 `ansv-haptics-sim` 求解获得的触觉马达（LRA）受力阶跃响应与阻尼衰减动画曲线（SVG 动态矢量图形，原生支持暗黑主题）：

![2nd-Order Damped Oscillator Simulation](https://raw.githubusercontent.com/tonychen5577-tech/ansv-haptics-sim/main/docs/simulation.svg?v=5)

---

## 📌 Overview 简介

`ansv-haptics-sim` 是一个用于教学与基础物理演练的简易二阶阻尼振荡器模型，用极简代码演示质量-弹簧-阻尼系统的受力响应。

> 💡 **商业级多物理场仿真 (Commercial Digital Twin)**：  
> 本开源项目仅提供基础线性二阶微分演练。如需体验完整的非线性刚度 $K(x)$ 建模、动态阻尼 $C(v)$、热电耦合及多类型马达动态物理仿真，请访问官网：[https://ansv.net/simulations/](https://ansv.net/simulations/)

---

## 🔬 Physics Model & Motor 5 Key Parameters 马达五大物理参数

系统的运动学由二阶线性微分方程决定：

$$m \cdot \frac{d^2x}{dt^2} + c \cdot \frac{dx}{dt} + k \cdot x = F(t) = BL \cdot I$$

| 参数名 (Parameter) | 符号 (Symbol) | 物理含义 (Description) | 默认值 (Default) | 国际单位 (Unit) |
| :--- | :--- | :--- | :--- | :--- |
| **`mass`** | $m$ | **振子质量** (Moving Mass) | `0.0015` (1.5g) | $\text{kg}$ |
| **`stiffness`** | $k$ | **弹簧刚度** (Spring Stiffness) | `800` | $\text{N/m}$ |
| **`damping`** | $c$ | **阻尼系数** (Damping Coefficient) | `0.03` | $\text{N}\cdot\text{s/m}$ |
| **`bl`** | $BL$ | **力灵敏度 / 电磁因子** (BL Factor) | `1.2` | $\text{N/A}$ 或 $\text{T}\cdot\text{m}$ |
| **`current`** | $I$ | **驱动电流** (Drive Current) | `0.4` | $\text{A}$ (安培) |

**衍生指标自动导出：**
- **固有谐振频率**：$f_0 = \frac{1}{2\pi}\sqrt{\frac{k}{m}}$ （Hz）
- **加速度响应**：$a(t) = \frac{d^2x}{dt^2} / 9.81$ （G 值）

---

## 🚀 Quick Start & Usage 使用示例

```bash
# 运行单元测试 (Unit Test)
npm test

# 重新生成 SVG 动态模拟图表
npm run build:svg
```

### 1. 修改参数与 JavaScript 调用代码

```javascript
const { solveBasicDampedOscillator } = require('./index');

// 传入自定义的马达五大物理参数：
const myMotorParams = {
  mass: 0.0020,     // 1. 振子质量 m = 2.0g (0.002 kg)
  stiffness: 950,   // 2. 弹簧刚度 k = 950 N/m
  damping: 0.025,   // 3. 阻尼系数 c = 0.025 Ns/m
  bl: 1.5,          // 4. 电磁常数 BL = 1.5 N/A
  current: 0.5      // 5. 驱动电流 I = 0.5 A (即推力 F = 1.5 * 0.5 = 0.75 N)
};

// 求解 40ms 仿真数据 (步长 0.1ms)
const res = solveBasicDampedOscillator(myMotorParams, 0.04, 0.0001);

console.log(`📌 固有谐振频率 (f0): ${res.f0Hz} Hz`);
console.log(`最大位移 (Peak Disp): ${Math.max(...res.displacement)} mm`);
console.log(`最大加速度 (Peak Acc): ${Math.max(...res.acceleration)} G`);
```

### 2. 查看输出结果的三种途径

1. **浏览器可视化动画**：拖拽打开 `docs/simulation.svg` 或在 [GitHub 主页](https://github.com/tonychen5577-tech/ansv-haptics-sim) 实时播放。
2. **控制台快速验证**：运行 `npm test`，查看受迫阻尼衰减的数字峰值验证。
3. **数据导出**：直接读取返回的 `res.displacement` (mm) 与 `res.acceleration` (G) 数组进行后续分析。

---

## 🤝 Links & Support 链接与支持

* 🌐 **官网在线仿真实验室**：[https://ansv.net](https://ansv.net)
* 📱 **微信公众号**：**【ANSV微型执行器】**
* 💡 **知乎专栏**：[知乎@ansv-net](https://www.zhihu.com/people/ansv-net)

---

## 📜 License

[MIT License](LICENSE) © 2026 ansv.net
