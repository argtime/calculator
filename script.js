// Simple, safe calculator logic with keyboard support and percent handling
(() => {
  const screenEl = document.getElementById('screen');
  const buttons = document.querySelectorAll('.btn');

  let expr = ''; // visible expression (uses JS operators)
  let lastEvaluated = false;

  function updateScreen() {
    screenEl.textContent = expr === '' ? '0' : expr;
  }

  function appendValue(v) {
    if (lastEvaluated && /[0-9.]/.test(v)) {
      // start new number after evaluation
      expr = '';
      lastEvaluated = false;
    } else {
      lastEvaluated = false;
    }
    expr += v;
    updateScreen();
  }

  function clearAll() {
    expr = '';
    lastEvaluated = false;
    updateScreen();
  }

  function backspace() {
    if (lastEvaluated) {
      expr = '';
      lastEvaluated = false;
    } else {
      expr = expr.slice(0, -1);
    }
    updateScreen();
  }

  // transform instances like "50%" into "(50/100)" to implement percentage behavior
  function transformPercent(s) {
    // replace number% with (number/100)
    return s.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
  }

  function safeEvaluate(s) {
    // Only allow digits, operators, parentheses, dot and percentage sign (will be transformed)
    if (!/^[0-9+\-*/().% \t]+$/.test(s)) {
      throw new Error('Invalid characters');
    }
    const t = transformPercent(s);
    // prevent things like consecutive operators producing syntax injection; rely on try/catch
    // Using Function to evaluate is acceptable here because we sanitized allowed chars above.
    // Evaluate in a sandboxed expression
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${t});`);
    return fn();
  }

  function evaluateExpression() {
    if (expr.trim() === '') return;
    try {
      const result = safeEvaluate(expr);
      expr = String(Number.isFinite(result) ? +(+result).toPrecision(12) : result);
      lastEvaluated = true;
      updateScreen();
    } catch (err) {
      expr = 'Error';
      lastEvaluated = true;
      updateScreen();
      setTimeout(() => { expr = ''; updateScreen(); }, 900);
    }
  }

  // button handling
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-value');
      const action = btn.getAttribute('data-action');
      if (action === 'clear') return clearAll();
      if (action === 'back') return backspace();
      if (action === 'equals') return evaluateExpression();
      if (v) {
        // map display symbols to JS operators when needed
        appendValue(v);
      }
    });
  });

  // keyboard support
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      evaluateExpression();
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      backspace();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      clearAll();
      return;
    }
    // allow digits, operators, parentheses, dot, percent
    if (/^[0-9+\-*/().%]$/.test(e.key)) {
      e.preventDefault();
      appendValue(e.key);
      return;
    }
    // support '*' and '/' from keyboard (they match)
  });

  // initial
  updateScreen();
})();
