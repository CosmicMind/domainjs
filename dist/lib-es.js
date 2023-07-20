var p = Object.defineProperty;
var S = (i, t, e) => t in i ? p(i, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[t] = e;
var v = (i, t, e) => (S(i, typeof t != "symbol" ? t + "" : t, e), e);
import { FoundationError as y, guard as r } from "@cosmicmind/foundationjs";
import { Observable as V } from "@cosmicmind/patternjs";
class w extends y {
}
const $ = (i = {}) => (t) => m(t, i);
function a(i) {
  return {
    set(t, e, o) {
      var c, n, u, x;
      const s = (c = i.attributes) == null ? void 0 : c[e];
      if (((n = s == null ? void 0 : s.validate) == null ? void 0 : n.call(s, o, t)) === !1)
        throw new w(`${String(e)} is invalid`);
      (u = s == null ? void 0 : s.updated) == null || u.call(s, o, t[e], t);
      const f = Reflect.set(t, e, o);
      return (x = i.trace) == null || x.call(i, t), f;
    }
  };
}
function m(i, t = {}) {
  var e, o, s, f;
  if (r(i)) {
    const { attributes: c } = t, n = new Proxy(i, a(t));
    if (r(c)) {
      for (const u in c)
        if (((o = (e = c[u]) == null ? void 0 : e.validate) == null ? void 0 : o.call(e, i[u], n)) === !1)
          throw new w(`${String(u)} is invalid`);
      return (s = t.created) == null || s.call(t, n), (f = t.trace) == null || f.call(t, n), n;
    }
  }
  throw new w("Unable to create Entity");
}
class H extends V {
}
class E extends y {
}
const F = (i = {}) => (t) => R(t, i);
function P(i) {
  return {
    set(t, e, o) {
      var c, n, u;
      const s = (c = i.attributes) == null ? void 0 : c[e];
      if (((n = s == null ? void 0 : s.validate) == null ? void 0 : n.call(s, o, t)) === !1)
        throw new E(`${String(e)} is invalid`);
      const f = Reflect.set(t, e, o);
      return (u = i.trace) == null || u.call(i, t), f;
    }
  };
}
function R(i, t = {}) {
  var e, o, s, f;
  if (r(i)) {
    const { attributes: c } = t, n = new Proxy(i, P(t));
    if (r(c)) {
      for (const u in c)
        if (((o = (e = c[u]) == null ? void 0 : e.validate) == null ? void 0 : o.call(e, i[u], n)) === !1)
          throw new E(`${String(u)} is invalid`);
      return (s = t.created) == null || s.call(t, n), (f = t.trace) == null || f.call(t, n), n;
    }
  }
  throw new E("Unable to create Event");
}
class j extends H {
  constructor(e) {
    super();
    v(this, "root");
    this.root = e;
  }
}
function k(i, t = {}) {
  const e = $(t);
  return (o) => new i(e(o));
}
class q {
  constructor(t) {
    v(this, "_value");
    this._value = t;
  }
  get value() {
    return this._value;
  }
}
class b extends y {
}
const z = (i, t = {}) => (e) => A(new i(e), e, t);
function _(i) {
  return {
    set(t, e, o) {
      var s;
      if (((s = i.validate) == null ? void 0 : s.call(i, o, t)) === !1)
        throw new b(`${String(e)} is invalid`);
      return Reflect.set(t, e, o);
    }
  };
}
function A(i, t, e = {}) {
  var o, s, f;
  if (r(i)) {
    const c = new Proxy(i, _(e));
    if (((o = e.validate) == null ? void 0 : o.call(e, t, c)) === !1)
      throw new b("value is invalid");
    return (s = e.created) == null || s.call(e, c), (f = e.trace) == null || f.call(e, c), c;
  }
  throw new b("unable to create value");
}
export {
  j as Aggregate,
  w as EntityError,
  E as EventError,
  H as EventObservable,
  q as Value,
  b as ValueError,
  k as defineAggregate,
  $ as defineEntity,
  F as defineEvent,
  z as defineValue
};
