#!/usr/bin/env python3
"""Pull the real motion settings out of a shared ProtoPie Cloud link.

Usage:
  python3 -I pp_extract.py <cloud.protopie.io link or pieId> [--out DIR] [--fit]

What it does (public API, no login needed for a shared pie):
  1. GET /api/pies/<pie>                      -> name, last revision
  2. GET /api/pies/<pie>/revisions/<n>        -> revision.modelUrl (the full pie model)
  3. GET modelUrl                             -> scenes -> interactions -> responses, with the
                                                 authored easing (SPRING tension/friction,
                                                 EASE_OUT.CUBIC, CUBIC_BEZIER x1..y2), duration, delay
  4. GET /api/pies/<pie>/scenarios            -> recordings (Rec01, Test01 …)
  5. --fit: GET .../scenarios/<scn>/data      -> recorded tracks (~8 ms samples); fits every
                                                 spring track to stiffness/damping and every tween
                                                 track to the candidate beziers, so you see what
                                                 ProtoPie actually RENDERED (it differs from the
                                                 stored bezier for EASE_IN_OUT.CUBIC — see protopie.md)

Writes into --out (default ./pp-<pieId>):
  model.json, scenario-*.json   raw downloads (data, never executed)
  interactions.txt              one line per response: +delay type layer EASE values
  summary.txt                   easing vocabulary, durations, delays, haptics, fits
The browser pane blocks this API (ERR_BLOCKED_BY_CLIENT); run it from a shell.
"""
import json, math, os, re, sys, collections, urllib.request

API = 'https://cloud.protopie.io/api/pies/'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'noon_sas_motion-skill'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode('utf-8'))


def ease_label(r):
    f = r.get('easingFunction')
    if f == 'SPRING':
        return f"SPRING({r.get('tension')},{r.get('friction')})"
    if f == 'CUBIC_BEZIER':
        return 'BEZIER(%s,%s,%s,%s)' % tuple(r.get(k) for k in ('easingCubicBezierX1', 'easingCubicBezierY1', 'easingCubicBezierX2', 'easingCubicBezierY2'))
    return {'EASE_IN_OUT.CUBIC': 'EASE-IN-OUT-CUBIC', 'EASE_OUT.CUBIC': 'EASE-OUT-CUBIC'}.get(f, str(f))


VALUE_KEYS = ['x', 'y', 'scaleX', 'scaleY', 'scaleType', 'width', 'height', 'opacity', 'radiusTopLeft',
              'rotation', 'command', 'formula', 'varName', 'focusType', 'iosVibrateType', 'androidVibrateType']
TIMED = {'xid_move', 'xid_scale', 'xid_opacity', 'xid_radius', 'xid_rotate', 'xid_scroll', 'xid_color', 'xid_size'}


def rd(v):
    return round(v, 3) if isinstance(v, float) else v


def walk(o, fn):
    if isinstance(o, dict):
        fn(o)
        for v in o.values():
            walk(v, fn)
    elif isinstance(o, list):
        for v in o:
            walk(v, fn)


def dump_model(model, out):
    names = {}
    walk(model, lambda o: names.__setitem__(o['id'], o['name']) if 'id' in o and 'name' in o else None)
    lines, stats = [], collections.Counter()

    def resp_line(r, indent='    '):
        t = r.get('type', '')
        timing = ''
        if t in TIMED and r.get('easingFunction'):
            timing = ease_label(r) + ('' if r.get('easingFunction') == 'SPRING' else f" {rd(r.get('duration'))}s")
            stats['EASE ' + ease_label(r) + ('' if r.get('easingFunction') == 'SPRING' else f" {rd(r.get('duration'))}s")] += 1
        if t == 'xid_vibrate':
            stats[f"HAPTIC ios={r.get('iosVibrateType')} android={r.get('androidVibrateType')}"] += 1
        stats[f"DELAY {rd(r.get('delay'))}"] += 1 if isinstance(r.get('delay'), (int, float)) else 0
        vals = ' '.join(f"{k}={rd(r[k])}" for k in VALUE_KEYS if r.get(k) not in (None, ''))
        rep = ' REPEAT' if r.get('repeat') else ''
        return f"{indent}+{rd(r.get('delay'))}s {t[4:]:9} {names.get(r.get('layerId'), '-')[:28]:28} {timing:24} {vals}{rep}"

    def container(c, label):
        its = [i for i in (c.get('interactions') or []) if not i.get('disabled')]
        if not its:
            return
        lines.append(f"\n### {label}")
        for it in its:
            extra = ' '.join(f"{k}={it[k]}" for k in ('propertyName', 'direction') if it.get(k))
            lines.append(f"  > {it.get('type', '')[4:]} on '{names.get(it.get('layerId'), 'scene')}' {extra}")
            for r in it.get('responses') or []:
                if not r.get('disabled'):
                    lines.append(resp_line(r))
            for cond in it.get('conditions') or []:
                rs = [r for r in (cond.get('responses') or []) if not r.get('disabled')]
                if rs:
                    lines.append('    [condition]')
                    lines.extend(resp_line(r, '      ') for r in rs)

    for s in model.get('scenes') or []:
        container(s, 'SCENE ' + str(s.get('name')))
    for c in model.get('components') or []:
        container(c, 'COMPONENT ' + str(c.get('name')))
    with open(os.path.join(out, 'interactions.txt'), 'w') as f:
        f.write('\n'.join(lines))
    return stats


# ---------- recording fits ----------

def bez(x1, y1, x2, y2):
    def f(x):
        lo, hi = 0.0, 1.0
        for _ in range(40):
            t = (lo + hi) / 2
            if 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3 < x:
                lo = t
            else:
                hi = t
        t = (lo + hi) / 2
        return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3
    return f


def spring(k, c):
    w = math.sqrt(k); z = c / (2 * w)
    if z < 1:
        wd = w * math.sqrt(1 - z * z)
        return lambda t: 1 - math.exp(-z * w * t) * (math.cos(wd * t) + z * w / wd * math.sin(wd * t))
    return lambda t: 1 - math.exp(-w * t) * (1 + w * t)


CANDIDATES = {'cubic-bezier(.33,1,.68,1) ease-out-cubic': bez(.33, 1, .68, 1),
              'cubic-bezier(.65,0,.35,1) ease-in-out-cubic': bez(.65, 0, .35, 1),
              'cubic-bezier(.4,0,.2,1) (stored default)': bez(.4, 0, .2, 1),
              'linear': lambda x: x}
PROPS = {'xid_move': ['x', 'y'], 'xid_scale': ['scaleX', 'width', 'height'], 'xid_opacity': ['opacity'],
         'xid_radius': ['radiusTopLeft'], 'xid_scroll': ['scrollY', 'scrollX']}


def fit_recording(model, rec, report):
    R = {}
    walk(model, lambda o: R.__setitem__(o['id'], o) if o.get('pieceType') == 'response' else None)
    tracks = collections.defaultdict(dict)
    for k, v in (rec.get('numberValues') or {}).items():
        parts = k.split('?')
        if len(parts) == 3:
            tracks[parts[1]][parts[2]] = v
    pe = rec.get('playEvents') or {}
    for st0, ev in zip(pe.get('_times', []), pe.get('_values', [])):
        r = R.get(ev.get('targetId'))
        if ev.get('targetType') != 'RESPONSE' or not r or r.get('type') not in PROPS:
            continue
        dur = ev['endTime'] - ev['startTime']
        if dur < 60:
            continue
        for pr in PROPS[r['type']]:
            tr = tracks.get(r.get('layerId'), {}).get(pr)
            if not tr:
                continue
            T, V = tr['_times'], tr['_values']
            pre = [v for t, v in zip(T, V) if t <= ev['startTime']]
            seg = [(t - ev['startTime'], v) for t, v in zip(T, V) if ev['startTime'] < t <= ev['endTime'] + 20]
            if not pre or len(seg) < 6 or abs(seg[-1][1] - pre[-1]) < 1:
                continue
            v0, v1 = pre[-1], seg[-1][1]
            pts = [(t / 1000, (v - v0) / (v1 - v0)) for t, v in seg][:-1]
            if r.get('easingFunction') == 'SPRING':
                if len(report['springs'][ease_label(r)]) >= 12:   # 12 tracks per spring is plenty
                    continue
                best = None
                for off in [x / 1000 for x in range(-24, 25, 4)]:
                    for k in range(200, 421, 5):
                        for c in [x / 2 for x in range(36, 80)]:
                            g = spring(k, c)
                            e = math.sqrt(sum((g(max(t + off, 0)) - p) ** 2 for t, p in pts) / len(pts))
                            if best is None or e < best[0]:
                                best = (e, k, c, off)
                e0, k0, c0, o0 = best
                for off in [o0 + x / 1000 for x in range(-2, 3)]:          # fine pass
                    for k in [k0 + x * 0.5 for x in range(-10, 11)]:
                        for c in [c0 + x * 0.05 for x in range(-10, 11)]:
                            g = spring(k, c)
                            e = math.sqrt(sum((g(max(t + off, 0)) - p) ** 2 for t, p in pts) / len(pts))
                            if e < best[0]:
                                best = (e, k, c, off)
                report['springs'][ease_label(r)].append(best)
            else:
                D = dur / 1000
                errs = {n: math.sqrt(sum((fn(min(t / D, 1)) - p) ** 2 for t, p in pts) / len(pts)) for n, fn in CANDIDATES.items()}
                report['tweens'][f"{ease_label(r)} {dur}ms"].append(errs)


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    arg = sys.argv[1]
    m = re.search(r'/p/([0-9a-f]{16,})', arg)
    pie = m.group(1) if m else arg
    out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else f'pp-{pie}'
    os.makedirs(out, exist_ok=True)
    meta = get(API + pie)['pie']
    rev = get(f"{API}{pie}/revisions/{meta['lastRevisionNo']}")['revision']
    model = get(rev['modelUrl'])
    json.dump(model, open(os.path.join(out, 'model.json'), 'w'))
    stats = dump_model(model, out)
    lines = [f"Pie: {meta.get('name')} ({pie}) revision {meta['lastRevisionNo']}", '', 'Vocabulary (count  setting):']
    lines += [f"  {v:4}  {k}" for k, v in sorted(stats.items(), key=lambda x: -x[1]) if not k.startswith('DELAY')]
    lines += ['', 'Delays used (s):', '  ' + ', '.join(sorted({k[6:] for k in stats if k.startswith('DELAY')}, key=lambda s: float(s) if re.match(r'^-?[\d.]+$', s) else 99))]
    if '--fit' in sys.argv:
        scns = get(f"{API}{pie}/scenarios")
        scns = scns if isinstance(scns, list) else scns.get('scenarios', [])
        report = {'springs': collections.defaultdict(list), 'tweens': collections.defaultdict(list)}
        for s in scns:
            rec = get(f"{API}{pie}/scenarios/{s['scenarioId']}/data")
            json.dump(rec, open(os.path.join(out, f"scenario-{s['scenarioId']}.json"), 'w'))
            fit_recording(model, rec, report)
        lines += ['', 'Rendered springs (authored -> median fitted stiffness/damping, mass 1):']
        for key, fits in report['springs'].items():
            ks = sorted(f[1] for f in fits); cs = sorted(f[2] for f in fits)
            k, c = ks[len(ks) // 2], cs[len(cs) // 2]
            w = math.sqrt(k); rms = sorted(f[0] for f in fits)[len(fits) // 2]
            lines.append(f"  {key}: k {k:.1f} c {c:.2f} (w {w:.2f}, zeta {c / (2 * w):.3f}, median rms {rms:.4f}) over {len(fits)} tracks")
        lines += ['', 'Rendered tweens (authored -> best candidate, mean rms):']
        for key, L in report['tweens'].items():
            mean = {n: sum(e[n] for e in L) / len(L) for n in CANDIDATES}
            b = min(mean, key=mean.get)
            lines.append(f"  {key}: {b} (rms {mean[b]:.4f}, n {len(L)})")
    open(os.path.join(out, 'summary.txt'), 'w').write('\n'.join(lines))
    print('\n'.join(lines))
    print(f"\nWrote {out}/interactions.txt and {out}/summary.txt")


if __name__ == '__main__':
    main()
