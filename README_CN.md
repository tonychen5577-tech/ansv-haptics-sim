# ⚡ ansv-haptics-sim

> **简易二阶阻尼振荡器与触觉马达五大物理参数模型。**  
> 用于触觉执行器（LRA / VCM / ERM）的基础物理仿真与教学工具。

 [English](README.md) | 简体中文

---

## 📈 动态模拟效果展示

以下为 `ansv-haptics-sim` 求解获得的触觉马达（LRA）受力与阻尼衰减动画曲线，展示完整的触觉物理生命周期（瞬态起振 $\rightarrow$ 持续平稳长振动 $\rightarrow$ 断电刹车余震衰减）：

![2nd-Order Damped Oscillator Simulation](https://raw.githubusercontent.com/tonychen5577-tech/ansv-haptics-sim/main/docs/simulation.svg?v=8)

---

## 📌 简介

`ansv-haptics-sim` 是一个轻量级、零依赖的二阶阻尼振荡器求解器，用于教学演练与触觉马达基础受力响应建模。

> 💡 **商业级多物理场数字孪生仿真平台 (Commercial Digital Twin)**：  
> 本开源项目仅提供基础线性二阶微分演练。如需体验完整的非线性刚度 $K(x)$ 建模、动态阻尼 $C(v)$、热电耦合及多类型马达动态物理仿真，请访问官网：[https://ansv.net/simulations/](https://ansv.net/simulations/)

---

## 🔬 物理模型与马达五大参数

系统的运动学由二阶线性微分方程决定：

$$m \cdot \frac{d^2x}{dt^2} + c \cdot \frac{dx}{dt} + k \cdot x = F(t) = BL \cdot I(t)$$

| 参数名 | 符号 | 物理含义 | 默认值 | 国际单位 |
| :--- | :--- | :--- | :--- | :--- |
| **`mass`** | $m$ | **振子质量** (Moving Mass) | `0.0015` (1.5g) | $\text{kg}$ |
| **`stiffness`** | $k$ | **弹簧刚度** (Spring Stiffness) | `800` | $\text{N/m}$ |
| **`damping`** | $c$ | **阻尼系数** (Damping Coefficient) | `0.10` | $\text{N}\cdot\text{s/m}$ |
| **`bl`** | $BL$ | **力灵敏度 / 电磁因子** (BL Factor) | `1.2` | $\text{N/A}$ 或 $\text{T}\cdot\text{m}$ |
| **`current`** | $I$ | **驱动电流峰值** (Drive Current) | `0.4` | $\text{A}$ (安培) |

**衍生指标自动导出：**

- **固有谐振频率 ($f_0$)**：
  $$f_0 = \frac{1}{2\pi}\sqrt{\frac{k}{m}} \quad (\text{Hz})$$

- **加速度响应 ($a$)**：
  $$a(t) = \frac{d^2x/dt^2}{9.81} \quad (\text{G 值})$$

---

## 🚀 快速上手与使用示例

```bash
# 运行单元测试
npm test

# 重新生成 SVG 动态模拟图表
npm run build:svg

# 在终端中以中文查看输出与计算结果
node generate_svg.js --lang=zh --mass=0.002 --stiffness=950

# 在终端中以英文查看输出
node generate_svg.js --lang=en --mass=0.002
```

### JavaScript API 调用

```javascript
const { solveBasicDampedOscillator } = require('./index');

// 定义自定义马达参数：
const myMotorParams = {
  mass: 0.0015,       // 振子质量 m = 1.5g (0.0015 kg)
  stiffness: 800,     // 弹簧刚度 k = 800 N/m
  damping: 0.10,      // 阻尼 c = 0.10 Ns/m
  bl: 1.2,            // BL = 1.2 N/A
  current: 0.4,       // 电流 I = 0.4 A
  driveType: 'ac',    // 'ac' 正弦交流驱动，'dc' 阶跃驱动
  driveDuration: 0.20 // 200ms 通电时长
};

// 执行 260ms 仿真计算 (0.1ms 步长)
const res = solveBasicDampedOscillator(myMotorParams, 0.260, 0.0001);

console.log(`📌 固有谐振频率 (f0): ${res.f0Hz} Hz`);
console.log(`📈 稳态长振动幅值: ±${Math.max(...res.displacement.slice(600, 1800))} mm`);
```

---

## 🤝 链接与商业支持

* 🌐 **官网在线多物理场实验室**：[https://ansv.net](https://ansv.net)
* 📱 **微信公众号**：**【ANSV微型执行器】**
* 💡 **知乎专栏**：[知乎@ansv-net](https://www.zhihu.com/people/ansv-net)

---

## 📜 许可证

[MIT License](LICENSE) © 2026 ansv.net
