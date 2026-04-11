// ═══════════════════════════════════════════════════════
// SCHEMA — Ticket shape, validation, coercion
//
// Pure-function module. No DOM. Node-testable.
//
// Why this exists: tickets live in localStorage and the
// shape has drifted over the life of the tool. Old tickets
// may be missing fields added later (blockedBy, subtasks,
// timeLogged). A bad ticket in the array used to take down
// the whole ticket log on render.
//
// coerceTicket(t) always returns an object that matches the
// current schema — defaults filled in, types normalized,
// unknown fields preserved. It never throws.
//
// validateTicket(t) returns { ok, errors, warnings } so the
// caller can log drift without hiding it. Used by tlLoad to
// surface "your stored data was auto-migrated" signal.
//
// The single source of truth for the ticket shape. Adding a
// new field? Add it to SCHEMA_FIELDS below and coerce will
// pick it up everywhere.
// ═══════════════════════════════════════════════════════

(function (global) {
  'use strict';

  var SCHEMA_VERSION = 2;

  // Enum values — must stay in sync with js/tickets.js TL_SYSTEMS / TL_STATUSES / TL_VENDORS.
  // Coercion is lenient: if a stored value is outside the enum, it is kept with a warning,
  // not silently replaced. Drift is information, not garbage.
  var SYSTEMS = ['Banner Direct', 'Banner Ethos', 'Colleague Ethos', 'PeopleSoft', 'CCCApply', 'SuperGlue', 'Canvas', 'Ethos API', 'SSO / IdP', 'Other'];
  var STATUSES = ['open', 'waiting-vendor', 'waiting-college', 'waiting-student', 'resolved'];
  var VENDORS = ['', 'Ellucian', 'CCCTC', 'Internal (FHDA ETS)', 'College IT', 'Other'];

  // Field descriptors. `kind` drives coercion:
  //   'string'   — coerced via String(), default ''
  //   'enum'     — string; kept as-is if outside enum but warned
  //   'isoDate'  — ISO timestamp; if unparseable, replaced with now()
  //   'dateStr'  — YYYY-MM-DD; kept if matches, else ''
  //   'int'      — non-negative integer, default 0
  //   'bool'     — coerced via Boolean()
  //   'array'    — each element coerced by elementKind
  //   'subtasks' — array of {id, text, done}
  //   'nullableIso' — ISO timestamp or null
  var SCHEMA_FIELDS = {
    id:         { kind: 'string',      required: true  },
    created:    { kind: 'isoDate',     required: true  },
    updated:    { kind: 'isoDate',     required: true  },
    college:    { kind: 'string',      default: ''     },
    system:     { kind: 'enum',        enum: SYSTEMS,   default: 'Other' },
    symptom:    { kind: 'string',      default: ''     },
    status:     { kind: 'enum',        enum: STATUSES,  default: 'open' },
    vendor:     { kind: 'enum',        enum: VENDORS,   default: ''     },
    tags:       { kind: 'string',      default: ''     },
    followUp:   { kind: 'dateStr',     default: ''     },
    subtasks:   { kind: 'subtasks',    default: []     },
    related:    { kind: 'stringArray', default: []     },
    blockedBy:  { kind: 'stringArray', default: []     },
    notes:      { kind: 'string',      default: ''     },
    resolution: { kind: 'string',      default: ''     },
    timeLogged: { kind: 'int',         default: 0      },
    timerStart: { kind: 'nullableIso', default: null   }
  };

  function isObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }

  function parseIsoDate(v) {
    if (v == null || v === '') return null;
    var t = new Date(v).getTime();
    return isNaN(t) ? null : new Date(t).toISOString();
  }

  // YYYY-MM-DD only. Anything else — including ISO timestamps — returns ''.
  function parseDateStr(v) {
    if (v == null || v === '') return '';
    var s = String(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      var t = new Date(s + 'T00:00:00').getTime();
      if (!isNaN(t)) return s;
    }
    return '';
  }

  function coerceSubtask(st, idx) {
    if (!isObject(st)) {
      return { id: 'ST' + Date.now().toString(36) + idx, text: String(st == null ? '' : st), done: false };
    }
    return {
      id: (typeof st.id === 'string' && st.id) ? st.id : ('ST' + Date.now().toString(36) + idx),
      text: st.text == null ? '' : String(st.text),
      done: !!st.done
    };
  }

  function coerceField(raw, desc, warnings, fieldName) {
    switch (desc.kind) {
      case 'string':
        if (raw == null) return desc.default || '';
        return typeof raw === 'string' ? raw : String(raw);

      case 'enum':
        if (raw == null || raw === '') return desc.default != null ? desc.default : '';
        var s = typeof raw === 'string' ? raw : String(raw);
        if (desc.enum.indexOf(s) < 0) {
          warnings.push(fieldName + ': "' + s + '" is not in the enum — kept as-is');
        }
        return s;

      case 'isoDate':
        var iso = parseIsoDate(raw);
        if (iso) return iso;
        warnings.push(fieldName + ': unparseable date "' + raw + '" — replaced with now');
        return new Date().toISOString();

      case 'dateStr':
        var ds = parseDateStr(raw);
        if (ds) return ds;
        if (raw) warnings.push(fieldName + ': "' + raw + '" is not YYYY-MM-DD — cleared');
        return '';

      case 'int':
        var n = Number(raw);
        if (!isFinite(n) || n < 0) return desc.default || 0;
        return Math.floor(n);

      case 'bool':
        return !!raw;

      case 'stringArray':
        if (!Array.isArray(raw)) {
          if (raw == null || raw === '') return [];
          warnings.push(fieldName + ': expected array, got ' + typeof raw + ' — coerced');
          return [];
        }
        return raw.filter(function (x) { return typeof x === 'string' && x.length > 0; });

      case 'subtasks':
        if (!Array.isArray(raw)) {
          if (raw != null && raw !== '') warnings.push(fieldName + ': expected array — coerced to []');
          return [];
        }
        return raw.map(coerceSubtask);

      case 'nullableIso':
        if (raw == null || raw === '') return null;
        var ni = parseIsoDate(raw);
        if (!ni) {
          warnings.push(fieldName + ': unparseable date "' + raw + '" — set to null');
          return null;
        }
        return ni;

      default:
        return raw;
    }
  }

  // Coerce a ticket into canonical shape. Never throws. Preserves any
  // unknown fields under a meta._extra bag so forward-compat data survives
  // a round trip through an older client.
  function coerceTicket(input) {
    var warnings = [];
    if (!isObject(input)) {
      return {
        ticket: null,
        warnings: ['ticket is not an object — dropped']
      };
    }

    var out = {};
    var name;
    for (name in SCHEMA_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(SCHEMA_FIELDS, name)) {
        out[name] = coerceField(input[name], SCHEMA_FIELDS[name], warnings, name);
      }
    }

    // If id is missing, mint one — losing the ticket is worse than a new id.
    if (!out.id) {
      out.id = 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      warnings.push('id: missing — minted ' + out.id);
    }

    // Preserve unknown fields so a newer client's data survives a round trip.
    var extra = null;
    for (name in input) {
      if (Object.prototype.hasOwnProperty.call(input, name) && !Object.prototype.hasOwnProperty.call(SCHEMA_FIELDS, name)) {
        if (!extra) extra = {};
        extra[name] = input[name];
      }
    }
    if (extra) out._extra = extra;

    return { ticket: out, warnings: warnings };
  }

  // Strict validation — returns what's wrong without mutating.
  // `ok` is false only for unrecoverable structural problems (not an object,
  // missing id after coercion). Enum drift and unparseable dates are warnings.
  function validateTicket(input) {
    if (!isObject(input)) {
      return { ok: false, errors: ['not an object'], warnings: [] };
    }
    var errors = [];
    var warnings = [];
    var name;
    for (name in SCHEMA_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(SCHEMA_FIELDS, name)) continue;
      var desc = SCHEMA_FIELDS[name];
      var raw = input[name];
      if (desc.required && (raw == null || raw === '')) {
        errors.push(name + ' is required');
        continue;
      }
      if (raw == null) continue;
      switch (desc.kind) {
        case 'isoDate':
          if (parseIsoDate(raw) == null) warnings.push(name + ' is not a parseable date');
          break;
        case 'enum':
          if (typeof raw === 'string' && desc.enum.indexOf(raw) < 0) warnings.push(name + ' value "' + raw + '" not in enum');
          break;
        case 'stringArray':
        case 'subtasks':
          if (!Array.isArray(raw)) errors.push(name + ' must be an array');
          break;
        case 'int':
          if (typeof raw !== 'number' || raw < 0 || !isFinite(raw)) warnings.push(name + ' is not a non-negative number');
          break;
      }
    }
    return { ok: errors.length === 0, errors: errors, warnings: warnings };
  }

  // Batch coerce. Returns { tickets, dropped, warnings, changed } so the
  // caller knows whether to re-save (changed > 0 means shape drifted and
  // we should persist the coerced form back to avoid doing this work on
  // every load).
  function coerceTickets(raw) {
    if (!Array.isArray(raw)) {
      return { tickets: [], dropped: 1, warnings: ['stored value was not an array'], changed: 0 };
    }
    var out = [];
    var dropped = 0;
    var allWarnings = [];
    var changed = 0;
    for (var i = 0; i < raw.length; i++) {
      var res = coerceTicket(raw[i]);
      if (!res.ticket) {
        dropped++;
        if (res.warnings) Array.prototype.push.apply(allWarnings, res.warnings.map(function (w) { return '[' + i + '] ' + w; }));
        continue;
      }
      out.push(res.ticket);
      if (res.warnings && res.warnings.length > 0) {
        changed++;
        Array.prototype.push.apply(allWarnings, res.warnings.map(function (w) { return '[' + i + '] ' + w; }));
      } else if (!shallowShapeEqual(raw[i], res.ticket)) {
        // Filling in defaults is silent but still counts as a change — we
        // want to persist back to keep future loads fast and consistent.
        changed++;
      }
    }
    return { tickets: out, dropped: dropped, warnings: allWarnings, changed: changed };
  }

  // Cheap shape-equality: same keys and primitive fields equal. Used only
  // to decide whether coercion mutated anything.
  function shallowShapeEqual(a, b) {
    if (!isObject(a) || !isObject(b)) return false;
    var k;
    for (k in SCHEMA_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(SCHEMA_FIELDS, k)) continue;
      if (!Object.prototype.hasOwnProperty.call(a, k)) return false;
      var av = a[k], bv = b[k];
      if (Array.isArray(av) !== Array.isArray(bv)) return false;
      if (Array.isArray(av)) {
        if (av.length !== bv.length) return false;
      } else if (av !== bv && !(av == null && bv == null)) {
        return false;
      }
    }
    return true;
  }

  global.schema = {
    version: SCHEMA_VERSION,
    systems: SYSTEMS,
    statuses: STATUSES,
    vendors: VENDORS,
    fields: SCHEMA_FIELDS,
    coerceTicket: coerceTicket,
    coerceTickets: coerceTickets,
    validateTicket: validateTicket,
    // Exposed for tests:
    parseIsoDate: parseIsoDate,
    parseDateStr: parseDateStr,
    coerceSubtask: coerceSubtask
  };
})(typeof window !== 'undefined' ? window : this);
