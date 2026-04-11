// ═══════════════════════════════════════════════════════
// INSIGHTS — Narrative analytics layer over the ticket log.
//
// The existing "Real Patterns" panel shows raw bar charts.
// This module turns the same data into short, honest findings
// an analyst can act on: where time is actually going, which
// tickets are statistically stale, whether velocity is up or
// down, which phrases keep recurring, which colleges are
// outliers on open load, and which waiting-vendor tickets
// need a nudge.
//
// Design notes:
//
// • All compute functions are pure. They take a tickets array
//   (optionally a `now` ms timestamp for testability) and
//   return plain data. Rendering is a separate layer below.
// • Each insight has its own minimum-data threshold. With a
//   handful of tickets, most insights return null rather than
//   fire spurious alerts. Better silence than false signal.
// • Statistics are robust where possible: median + median
//   absolute deviation (MAD) for outlier detection, not mean
//   + standard deviation. Small samples with one giant ticket
//   break mean-based methods immediately.
// • Percentiles are computed with linear interpolation so
//   p50 on an even-length array is the midpoint of the two
//   middle values, not an arbitrary pick.
// • "Statistically stale" means an open ticket's current age
//   exceeds the p80 of previously-resolved tickets in the
//   same system — a learned threshold, not a hardcoded 3d/7d.
// ═══════════════════════════════════════════════════════

(function (global) {
  'use strict';

  var HOUR_MS = 3600 * 1000;
  var DAY_MS = 86400 * 1000;

  // ── Pure math helpers ─────────────────────────────────

  function insMedian(arr) {
    if (!arr || arr.length === 0) return 0;
    var sorted = arr.slice().sort(function (a, b) { return a - b; });
    var mid = sorted.length / 2;
    if (sorted.length % 2 === 1) return sorted[Math.floor(mid)];
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  // Linear-interpolation percentile. p in [0, 1]. Returns 0 on empty.
  function insPercentile(arr, p) {
    if (!arr || arr.length === 0) return 0;
    if (p <= 0) return Math.min.apply(null, arr);
    if (p >= 1) return Math.max.apply(null, arr);
    var sorted = arr.slice().sort(function (a, b) { return a - b; });
    var idx = p * (sorted.length - 1);
    var lo = Math.floor(idx);
    var hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    var frac = idx - lo;
    return sorted[lo] * (1 - frac) + sorted[hi] * frac;
  }

  // Median absolute deviation — a robust spread estimator.
  function insMAD(arr) {
    if (!arr || arr.length === 0) return 0;
    var m = insMedian(arr);
    var devs = arr.map(function (x) { return Math.abs(x - m); });
    return insMedian(devs);
  }

  // Tokenize a free-text symptom into significant lowercase words.
  // Drops punctuation, stopwords, and short fragments.
  var INS_STOPWORDS = {
    the: 1, a: 1, an: 1, and: 1, or: 1, but: 1, of: 1, to: 1, in: 1, on: 1,
    at: 1, by: 1, for: 1, with: 1, from: 1, as: 1, is: 1, are: 1, was: 1,
    were: 1, be: 1, been: 1, being: 1, has: 1, have: 1, had: 1, do: 1,
    does: 1, did: 1, will: 1, would: 1, could: 1, should: 1, may: 1,
    can: 1, this: 1, that: 1, these: 1, those: 1, it: 1, its: 1, he: 1,
    she: 1, they: 1, them: 1, their: 1, his: 1, her: 1, we: 1, our: 1,
    you: 1, your: 1, i: 1, me: 1, my: 1, not: 1, no: 1, so: 1, if: 1,
    then: 1, than: 1, when: 1, where: 1, why: 1, how: 1, what: 1, who: 1,
    // ticket-log specific noise
    ticket: 1, issue: 1, problem: 1, student: 1, students: 1, says: 1,
    said: 1, still: 1, getting: 1, cannot: 1, unable: 1, about: 1,
    after: 1, before: 1, again: 1, even: 1, just: 1
  };

  function insTokenize(text) {
    if (!text) return [];
    return String(text).toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(function (w) { return w.length >= 4 && !INS_STOPWORDS[w]; });
  }

  function insBigrams(tokens) {
    var out = [];
    for (var i = 0; i < tokens.length - 1; i++) {
      out.push(tokens[i] + ' ' + tokens[i + 1]);
    }
    return out;
  }

  // Format hours as a human-short duration.
  function insFmtHours(h) {
    if (h == null || isNaN(h) || h < 0) return '—';
    if (h < 1) return Math.round(h * 60) + 'm';
    if (h < 24) return (h >= 10 ? Math.round(h) : h.toFixed(1).replace(/\.0$/, '')) + 'h';
    return (h / 24).toFixed(1).replace(/\.0$/, '') + 'd';
  }

  // Resolution hours for a single ticket (updated − created), clamped ≥ 0.
  function insResolutionHours(t) {
    var start = new Date(t.created).getTime();
    var end = new Date(t.updated || t.created).getTime();
    return Math.max(0, (end - start) / HOUR_MS);
  }

  function insOpenAgeHours(t, now) {
    var start = new Date(t.created).getTime();
    return Math.max(0, (now - start) / HOUR_MS);
  }

  // ── Insight computers ─────────────────────────────────
  // Each returns {type, severity, headline, detail, data} or null when
  // there isn't enough signal to fire the insight.

  // 1. Where is resolution time actually going?
  //    Per-system sum of resolution hours, % of total.
  function insComputeTimeSinks(tickets) {
    var resolved = tickets.filter(function (t) { return t.status === 'resolved'; });
    if (resolved.length < 5) return null;
    var bySystem = {};
    var total = 0;
    resolved.forEach(function (t) {
      var h = insResolutionHours(t);
      var sys = t.system || 'Unknown';
      bySystem[sys] = (bySystem[sys] || 0) + h;
      total += h;
    });
    if (total <= 0) return null;
    var rows = Object.keys(bySystem).map(function (s) {
      return { system: s, hours: bySystem[s], pct: bySystem[s] / total };
    }).sort(function (a, b) { return b.hours - a.hours; });
    var top = rows[0];
    return {
      type: 'time-sink',
      severity: 'info',
      headline: top.system + ' holds ' + Math.round(top.pct * 100) + '% of your resolution time',
      detail: 'Across ' + resolved.length + ' resolved tickets, ' + insFmtHours(top.hours) +
              ' of the ' + insFmtHours(total) + ' total landed on ' + top.system + '.',
      data: { rows: rows.slice(0, 5), total: total }
    };
  }

  // 2. Statistically stale open tickets.
  //    For each system with ≥ 5 resolved tickets, compute p80 of
  //    resolution hours. An open ticket whose age exceeds that
  //    threshold is older than 80% of its system's prior tickets.
  function insComputeStatisticallyStale(tickets, now) {
    now = now || Date.now();
    var bySystem = {};
    tickets.forEach(function (t) {
      var s = t.system || 'Unknown';
      if (!bySystem[s]) bySystem[s] = { resolved: [], open: [] };
      if (t.status === 'resolved') bySystem[s].resolved.push(insResolutionHours(t));
      else bySystem[s].open.push(t);
    });
    var flagged = [];
    Object.keys(bySystem).forEach(function (s) {
      var group = bySystem[s];
      if (group.resolved.length < 5) return;
      var p80 = insPercentile(group.resolved, 0.8);
      group.open.forEach(function (t) {
        var age = insOpenAgeHours(t, now);
        if (age > p80) flagged.push({ ticket: t, ageHours: age, thresholdHours: p80, system: s });
      });
    });
    if (flagged.length === 0) return null;
    flagged.sort(function (a, b) { return b.ageHours - a.ageHours; });
    return {
      type: 'stale',
      severity: flagged.length >= 3 ? 'warn' : 'notice',
      headline: flagged.length + ' open ticket' + (flagged.length === 1 ? '' : 's') +
                ' past the p80 age for ' + (flagged.length === 1 ? 'its' : 'their') + ' system',
      detail: 'These tickets are taking longer than 80% of your previously-resolved tickets in the same system. ' +
              'Not all of them are stuck — some are just harder — but the batch is worth a look.',
      data: { flagged: flagged.slice(0, 8) }
    };
  }

  // 3. Velocity trend. This week's resolutions vs trailing 4-week median.
  function insComputeVelocityTrend(tickets, now) {
    now = now || Date.now();
    var weekMs = 7 * DAY_MS;
    function countResolvedInWindow(startMs, endMs) {
      return tickets.filter(function (t) {
        if (t.status !== 'resolved') return false;
        var u = new Date(t.updated || t.created).getTime();
        return u >= startMs && u < endMs;
      }).length;
    }
    var thisWeek = countResolvedInWindow(now - weekMs, now);
    var trailing = [];
    for (var i = 1; i <= 4; i++) {
      trailing.push(countResolvedInWindow(now - (i + 1) * weekMs, now - i * weekMs));
    }
    var trailingMedian = insMedian(trailing);
    var totalTrailing = trailing.reduce(function (a, b) { return a + b; }, 0);
    if (totalTrailing < 4) return null; // Not enough history to trend against.
    var pctChange = trailingMedian > 0
      ? (thisWeek - trailingMedian) / trailingMedian
      : (thisWeek > 0 ? 1 : 0);
    var direction, severity, arrow;
    if (pctChange >= 0.2) { direction = 'up'; severity = 'info'; arrow = '▲'; }
    else if (pctChange <= -0.2) { direction = 'down'; severity = 'notice'; arrow = '▼'; }
    else { direction = 'flat'; severity = 'info'; arrow = '■'; }
    return {
      type: 'velocity',
      severity: severity,
      headline: 'Resolution velocity ' + direction + ' ' +
                (direction === 'flat' ? '' : Math.abs(Math.round(pctChange * 100)) + '% ') +
                'vs your 4-week median ' + arrow,
      detail: 'Last 7 days: ' + thisWeek + ' resolved. Trailing 4-week median: ' +
              trailingMedian + '. Trailing weeks (oldest→newest): ' +
              trailing.slice().reverse().join(', ') + '.',
      data: { thisWeek: thisWeek, trailingMedian: trailingMedian, trailing: trailing, pctChange: pctChange }
    };
  }

  // 4. Recurring symptom phrases. Bigram frequency across all tickets.
  function insComputeRecurringSymptoms(tickets) {
    if (tickets.length < 6) return null;
    var counts = {};
    var docFreq = {}; // how many tickets each bigram appears in
    tickets.forEach(function (t) {
      var tokens = insTokenize(t.symptom || '');
      var grams = insBigrams(tokens);
      var seen = {};
      grams.forEach(function (g) {
        counts[g] = (counts[g] || 0) + 1;
        if (!seen[g]) { seen[g] = true; docFreq[g] = (docFreq[g] || 0) + 1; }
      });
    });
    var top = Object.keys(docFreq)
      .filter(function (g) { return docFreq[g] >= 3; })
      .sort(function (a, b) { return docFreq[b] - docFreq[a]; })
      .slice(0, 5);
    if (top.length === 0) return null;
    var leader = top[0];
    return {
      type: 'recurring',
      severity: 'notice',
      headline: '"' + leader + '" appears in ' + docFreq[leader] + ' tickets',
      detail: 'Recurring language across your log is often a KB candidate — the same symptom shows up with different wording.',
      data: { top: top.map(function (g) { return { phrase: g, tickets: docFreq[g] }; }) }
    };
  }

  // 5. Hot colleges — MAD-based outlier detection on open-ticket load.
  function insComputeHotColleges(tickets) {
    var byCollege = {};
    tickets.forEach(function (t) {
      if (t.status === 'resolved') return;
      var c = t.college || '(unassigned)';
      if (c === '(unassigned)') return;
      byCollege[c] = (byCollege[c] || 0) + 1;
    });
    var names = Object.keys(byCollege);
    if (names.length < 4) return null;
    var counts = names.map(function (n) { return byCollege[n]; });
    var med = insMedian(counts);
    var mad = insMAD(counts);
    if (mad === 0) return null; // Flat distribution — nothing to flag.
    // Threshold: median + 2 * MAD. Robust alternative to mean + 2σ.
    var threshold = med + 2 * mad;
    var outliers = names
      .filter(function (n) { return byCollege[n] > threshold; })
      .map(function (n) { return { college: n, open: byCollege[n] }; })
      .sort(function (a, b) { return b.open - a.open; });
    if (outliers.length === 0) return null;
    var leader = outliers[0];
    return {
      type: 'hot-college',
      severity: 'warn',
      headline: leader.college + ' is carrying ' + leader.open +
                ' open ticket' + (leader.open === 1 ? '' : 's') +
                ' — above median + 2·MAD',
      detail: 'Median open load across your colleges: ' + med + '. ' +
              'Flagged outliers are more than 2 median-absolute-deviations above that — a robust alternative to mean + 2σ on small samples.',
      data: { outliers: outliers, median: med, mad: mad, threshold: threshold }
    };
  }

  // 6. Waiting-vendor tickets that haven't moved in 5+ days.
  function insComputeEscalationCandidates(tickets, now) {
    now = now || Date.now();
    var stale = tickets.filter(function (t) {
      if (t.status !== 'waiting-vendor') return false;
      var u = new Date(t.updated || t.created).getTime();
      return (now - u) >= 5 * DAY_MS;
    }).map(function (t) {
      var u = new Date(t.updated || t.created).getTime();
      return { ticket: t, daysSinceUpdate: Math.floor((now - u) / DAY_MS) };
    }).sort(function (a, b) { return b.daysSinceUpdate - a.daysSinceUpdate; });
    if (stale.length === 0) return null;
    return {
      type: 'escalate',
      severity: 'warn',
      headline: stale.length + ' waiting-vendor ticket' + (stale.length === 1 ? '' : 's') +
                ' untouched for 5+ days',
      detail: 'Consider a nudge. Vendor queues go quiet unless you pull the thread.',
      data: { stale: stale.slice(0, 8) }
    };
  }

  // 7. System resolution distribution. Transparent reference, not a finding.
  function insComputeSystemDistributions(tickets) {
    var bySystem = {};
    tickets.forEach(function (t) {
      if (t.status !== 'resolved') return;
      var s = t.system || 'Unknown';
      if (!bySystem[s]) bySystem[s] = [];
      bySystem[s].push(insResolutionHours(t));
    });
    var rows = Object.keys(bySystem)
      .filter(function (s) { return bySystem[s].length >= 5; })
      .map(function (s) {
        return {
          system: s,
          n: bySystem[s].length,
          p50: insPercentile(bySystem[s], 0.5),
          p90: insPercentile(bySystem[s], 0.9)
        };
      })
      .sort(function (a, b) { return b.p90 - a.p90; });
    if (rows.length === 0) return null;
    return {
      type: 'distribution',
      severity: 'info',
      headline: 'Resolution distribution by system (p50 / p90)',
      detail: 'p50 is the median — half resolve faster. p90 is the tail — 10% take longer than this. Only systems with ≥ 5 resolved tickets are shown.',
      data: { rows: rows }
    };
  }

  // ── KB suggestion (ticket → ranked KB entries) ────────
  //
  // The prior implementation in tickets.js did substring matching on
  // whitespace tokens, which matched "tic" inside "tictactoe" and
  // weighted stopwords the same as domain terms. This replaces it with
  // a pure function that:
  //
  //  • tokenizes ticket symptom + notes + tags through insTokenize
  //    (stopword + short-word filtering for free)
  //  • builds a token SET per KB entry for title and body separately
  //    (token-vs-token, not substring)
  //  • scores: 3 * title-matches + 1 * body-match + 5 if system equals
  //    the ticket's system + 2 if audience overlaps any ticket tag
  //  • normalizes by ticket token count so longer tickets don't
  //    automatically dominate the top-k
  //
  // Pure, deterministic, testable. No DOM, no storage.
  function insSuggestKB(ticket, kbEntries, opts) {
    opts = opts || {};
    var limit = opts.limit || 3;
    var minScore = opts.minScore != null ? opts.minScore : 0.25;
    if (!ticket || !kbEntries || kbEntries.length === 0) return [];

    var ticketText = [ticket.symptom, ticket.notes, ticket.tags].filter(Boolean).join(' ');
    var ticketTokens = insTokenize(ticketText);
    if (ticketTokens.length === 0) return [];
    var ticketTokenSet = {};
    ticketTokens.forEach(function (t) { ticketTokenSet[t] = true; });
    var ticketTagList = String(ticket.tags || '').toLowerCase()
      .split(',').map(function (s) { return s.trim(); }).filter(Boolean);

    var scored = kbEntries.map(function (entry) {
      var titleTokens = insTokenize(entry.title || '');
      var bodyTokens = insTokenize(entry.body || '');
      var titleMatch = 0;
      var titleSeen = {};
      titleTokens.forEach(function (t) {
        if (ticketTokenSet[t] && !titleSeen[t]) { titleMatch++; titleSeen[t] = true; }
      });
      var bodyMatch = 0;
      var bodySeen = {};
      bodyTokens.forEach(function (t) {
        if (ticketTokenSet[t] && !bodySeen[t]) { bodyMatch++; bodySeen[t] = true; }
      });
      var raw = 3 * titleMatch + 1 * bodyMatch;
      if (ticket.system && entry.system && ticket.system === entry.system) raw += 5;
      var audienceLower = String(entry.audience || '').toLowerCase();
      if (audienceLower && ticketTagList.indexOf(audienceLower) >= 0) raw += 2;
      var normalized = raw / Math.max(1, ticketTokens.length);
      return {
        entry: entry,
        score: normalized,
        rawScore: raw,
        titleMatches: titleMatch,
        bodyMatches: bodyMatch
      };
    });

    return scored
      .filter(function (s) { return s.score >= minScore; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, limit);
  }

  // ── Compose everything ────────────────────────────────

  function insComputeAll(tickets, now) {
    now = now || Date.now();
    tickets = tickets || [];
    return {
      totalTickets: tickets.length,
      resolvedCount: tickets.filter(function (t) { return t.status === 'resolved'; }).length,
      openCount: tickets.filter(function (t) { return t.status !== 'resolved'; }).length,
      computedAt: now,
      insights: [
        insComputeEscalationCandidates(tickets, now),
        insComputeStatisticallyStale(tickets, now),
        insComputeHotColleges(tickets),
        insComputeVelocityTrend(tickets, now),
        insComputeTimeSinks(tickets),
        insComputeRecurringSymptoms(tickets),
        insComputeSystemDistributions(tickets)
      ].filter(function (x) { return x != null; })
    };
  }

  // ── Rendering (impure: touches DOM) ───────────────────

  function insEsc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function insRenderCard(card) {
    var sevClass = 'ins-card ins-sev-' + card.severity;
    var html = '<div class="' + sevClass + '" data-ins-type="' + insEsc(card.type) + '">' +
      '<div class="ins-card-head">' +
        '<span class="ins-card-dot"></span>' +
        '<span class="ins-card-title">' + insEsc(card.headline) + '</span>' +
      '</div>' +
      (card.detail ? '<div class="ins-card-detail">' + insEsc(card.detail) + '</div>' : '');

    if (card.type === 'time-sink' && card.data && card.data.rows) {
      html += '<div class="ins-card-body">' + card.data.rows.map(function (r) {
        return '<div class="ins-row">' +
          '<span class="ins-row-label">' + insEsc(r.system) + '</span>' +
          '<span class="ins-row-bar-wrap"><span class="ins-row-bar" style="width:' + (r.pct * 100).toFixed(0) + '%"></span></span>' +
          '<span class="ins-row-val">' + insFmtHours(r.hours) + ' · ' + Math.round(r.pct * 100) + '%</span>' +
        '</div>';
      }).join('') + '</div>';
    } else if (card.type === 'stale' && card.data && card.data.flagged) {
      html += '<div class="ins-card-body">' + card.data.flagged.map(function (f) {
        return '<div class="ins-row">' +
          '<span class="ins-row-label">' + insEsc((f.ticket.college || '?') + ' · ' + (f.ticket.symptom || '—').slice(0, 50)) + '</span>' +
          '<span class="ins-row-val">' + insFmtHours(f.ageHours) + ' (p80 ' + insFmtHours(f.thresholdHours) + ')</span>' +
        '</div>';
      }).join('') + '</div>';
    } else if (card.type === 'recurring' && card.data && card.data.top) {
      html += '<div class="ins-card-body ins-chips">' + card.data.top.map(function (p) {
        return '<span class="ins-chip">' + insEsc(p.phrase) + ' <span class="ins-chip-n">' + p.tickets + '</span></span>';
      }).join('') + '</div>';
    } else if (card.type === 'hot-college' && card.data && card.data.outliers) {
      html += '<div class="ins-card-body">' + card.data.outliers.map(function (o) {
        return '<div class="ins-row">' +
          '<span class="ins-row-label">' + insEsc(o.college) + '</span>' +
          '<span class="ins-row-val">' + o.open + ' open</span>' +
        '</div>';
      }).join('') + '</div>';
    } else if (card.type === 'escalate' && card.data && card.data.stale) {
      html += '<div class="ins-card-body">' + card.data.stale.map(function (s) {
        return '<div class="ins-row">' +
          '<span class="ins-row-label">' + insEsc((s.ticket.college || '?') + ' · ' + (s.ticket.symptom || '—').slice(0, 50)) + '</span>' +
          '<span class="ins-row-val">' + s.daysSinceUpdate + 'd quiet</span>' +
        '</div>';
      }).join('') + '</div>';
    } else if (card.type === 'velocity' && card.data) {
      html += '<div class="ins-card-body ins-velocity">' +
        '<span class="ins-vel-big">' + card.data.thisWeek + '</span>' +
        '<span class="ins-vel-label">this week</span>' +
        '<span class="ins-vel-sep">vs</span>' +
        '<span class="ins-vel-big">' + card.data.trailingMedian + '</span>' +
        '<span class="ins-vel-label">4-wk median</span>' +
      '</div>';
    } else if (card.type === 'distribution' && card.data && card.data.rows) {
      html += '<div class="ins-card-body ins-dist">' +
        '<div class="ins-dist-head"><span>System</span><span>n</span><span>p50</span><span>p90</span></div>' +
        card.data.rows.map(function (r) {
          return '<div class="ins-dist-row">' +
            '<span>' + insEsc(r.system) + '</span>' +
            '<span>' + r.n + '</span>' +
            '<span>' + insFmtHours(r.p50) + '</span>' +
            '<span>' + insFmtHours(r.p90) + '</span>' +
          '</div>';
        }).join('') + '</div>';
    }

    html += '</div>';
    return html;
  }

  function insRenderInto(element, tickets) {
    if (!element) return;
    var result = insComputeAll(tickets);
    if (result.totalTickets < 3) {
      element.innerHTML = '<div class="ins-empty">' +
        '<strong>Insights need data.</strong> ' +
        'Log a few tickets and this panel will start calling out stale tickets, velocity trends, and recurring patterns. ' +
        'Current: ' + result.totalTickets + ' total, ' + result.resolvedCount + ' resolved.' +
      '</div>';
      return;
    }
    if (result.insights.length === 0) {
      element.innerHTML = '<div class="ins-empty">' +
        '<strong>Nothing unusual right now.</strong> ' +
        'No stale tickets, no outlier colleges, no escalation candidates. ' +
        'Keep logging — patterns surface as the dataset grows.' +
      '</div>';
      return;
    }
    element.innerHTML =
      '<div class="ins-head">' +
        '<span class="ins-head-title">Insights</span>' +
        '<span class="ins-head-sub">Narrative read of your ticket log · ' + result.totalTickets + ' total · ' + result.resolvedCount + ' resolved</span>' +
      '</div>' +
      '<div class="ins-grid">' + result.insights.map(insRenderCard).join('') + '</div>';
  }

  // ── Public surface ────────────────────────────────────

  global.insights = {
    // Pure math
    median: insMedian,
    percentile: insPercentile,
    mad: insMAD,
    tokenize: insTokenize,
    bigrams: insBigrams,
    fmtHours: insFmtHours,
    resolutionHours: insResolutionHours,
    openAgeHours: insOpenAgeHours,
    // Pure insight computers
    computeTimeSinks: insComputeTimeSinks,
    computeStatisticallyStale: insComputeStatisticallyStale,
    computeVelocityTrend: insComputeVelocityTrend,
    computeRecurringSymptoms: insComputeRecurringSymptoms,
    computeHotColleges: insComputeHotColleges,
    computeEscalationCandidates: insComputeEscalationCandidates,
    computeSystemDistributions: insComputeSystemDistributions,
    computeAll: insComputeAll,
    // KB suggestion
    suggestKB: insSuggestKB,
    // Rendering
    renderInto: insRenderInto,
    esc: insEsc
  };
})(typeof window !== 'undefined' ? window : this);
