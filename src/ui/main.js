import App from './App.svelte';

function mountError(err) {
  const root = document.getElementById('app');
  if (!root) return;
  root.innerHTML = `<div style="font-family:system-ui,Arial,sans-serif;padding:20px;color:#b91c1c;"><h2>App failed to start</h2><pre style="white-space:pre-wrap">${String(err)}</pre></div>`;
}

let app = null;
const target = (typeof document !== 'undefined') ? document.getElementById('app') : null;
try {
  if (!target) throw new Error('Root element #app not found');
  // Support both Svelte 5 factory API and older constructor API
  const factory = (typeof App === 'function') ? App : (App && typeof App.default === 'function' ? App.default : null);
  if (!factory) throw new Error('Imported App is not a Svelte component (typeof App=' + typeof App + ')');
  try {
    // Svelte 5: call the component factory
    app = factory({ target });
  } catch (err) {
    // Fallback: older Svelte versions used `new`
    app = new factory({ target });
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Error mounting App', err);
  mountError(err);
}

window.addEventListener('error', (ev) => {
  mountError(ev.error || ev.message || 'Unknown error');
});

export default app;
