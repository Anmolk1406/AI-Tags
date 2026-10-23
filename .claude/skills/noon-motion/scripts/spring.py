#!/usr/bin/env python3
"""Print a spring in every format noon uses, plus a CSS linear() you can paste.

Usage (any one way to describe the spring):
  python3 spring.py --k 280.6 --c 27.14            # stiffness / damping (mass 1)
  python3 spring.py --pp 300 28                     # ProtoPie Spring(Tension, Friction) as authored
  python3 spring.py --w 16.75 --z 0.81              # natural frequency / damping ratio
  python3 spring.py --response 0.34 --z 0.74        # SwiftUI / UIKit response + dampingFraction
options: --ms 544 (length of the linear(), default = settle to 0.1 %), --stops 34

ProtoPie note: Spring(T, F) as authored renders like stiffness 0.935*T, damping 0.969*F
(fitted on 200 recorded tracks of Spring(300, 28) -> 280.6 / 27.14). --pp applies that.
"""
import math, sys


def arg(name, n=1):
    if name not in sys.argv:
        return None
    i = sys.argv.index(name)
    vals = [float(v) for v in sys.argv[i + 1:i + 1 + n]]
    return vals if n > 1 else vals[0]


def step(w, z):
    if z < 1:
        wd = w * math.sqrt(1 - z * z)
        return lambda t: 1 - math.exp(-z * w * t) * (math.cos(wd * t) + z * w / wd * math.sin(wd * t))
    if z == 1:
        return lambda t: 1 - math.exp(-w * t) * (1 + w * t)
    r1 = -w * (z - math.sqrt(z * z - 1)); r2 = -w * (z + math.sqrt(z * z - 1))
    return lambda t: 1 + (r2 * math.exp(r1 * t) - r1 * math.exp(r2 * t)) / (r1 - r2)


def main():
    if arg('--pp', 2):
        T, F = arg('--pp', 2); k, c = 0.9353 * T, 0.9693 * F
    elif arg('--k') is not None:
        k, c = arg('--k'), arg('--c')
    elif arg('--w') is not None:
        w, z = arg('--w'), arg('--z'); k, c = w * w, 2 * z * w
    elif arg('--response') is not None:
        w = 2 * math.pi / arg('--response'); z = arg('--z'); k, c = w * w, 2 * z * w
    else:
        print(__doc__); sys.exit(1)
    w = math.sqrt(k); z = c / (2 * w); f = step(w, z)
    ts = [i / 1000 for i in range(4000)]
    peak = max(ts, key=f); ovs = max(0.0, (f(peak) - 1) * 100)

    def settle(eps):
        last = 0
        for t in ts:
            if abs(f(t) - 1) > eps:
                last = t
        return last
    ms = int(round(arg('--ms') or settle(0.001) * 1000))
    stops = int(arg('--stops') or 34)
    vals = []
    for i in range(stops + 1):
        v = 1.0 if i == stops else f(i / stops * ms / 1000)
        vals.append('0' if i == 0 else '1' if i == stops else f"{v:.4f}".rstrip('0').rstrip('.'))
    print(f"stiffness {k:.2f}  damping {c:.2f}  mass 1")
    print(f"omega {w:.3f} rad/s  zeta {z:.3f}  response {2 * math.pi / w:.3f} s")
    print(f"overshoot {ovs:.2f} % at {peak * 1000:.0f} ms; within 1 % by {settle(.01) * 1000:.0f} ms, 0.1 % by {settle(.001) * 1000:.0f} ms")
    print(f"ProtoPie (authored): Spring(Tension {k / 0.9353:.0f}, Friction {c / 0.9693:.1f})")
    print(f"CSS:        transition: transform {ms}ms linear({', '.join(vals)});")
    print(f"motion:     {{ type: 'spring', stiffness: {k:.1f}, damping: {c:.2f}, mass: 1 }}")
    print(f"Reanimated: withSpring(to, {{ stiffness: {k:.1f}, damping: {c:.2f}, mass: 1 }})")
    print(f"SwiftUI:    .interpolatingSpring(mass: 1, stiffness: {k:.1f}, damping: {c:.2f})  // ≈ .spring(response: {2 * math.pi / w:.3f}, dampingFraction: {z:.2f})")
    print(f"UIKit:      UISpringTimingParameters(mass: 1, stiffness: {k:.1f}, damping: {c:.2f}, initialVelocity: .zero)")
    print(f"Compose:    spring(dampingRatio = {z:.2f}f, stiffness = {k:.1f}f)")
    print(f"Figma:      Custom spring — mass 1, stiffness {k:.0f}, damping {c:.0f}")


if __name__ == '__main__':
    main()
