// ============================================================================
//  Async view loader
//  Views that need DB data export an async init function.
//  We show a spinner, await data, then render.
// ============================================================================

export function showSpinner(app) {
  if (!app) return;
  app.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;
      min-height:60vh;flex-direction:column;gap:16px">
      <div style="
        width:44px;height:44px;border-radius:50%;
        border:4px solid #e2e8f0;border-top-color:#059669;
        animation:tsid-spin .7s linear infinite"></div>
      <div style="font-size:13px;font-weight:600;color:#64748b">Loading…</div>
      <style>
        @keyframes tsid-spin { to { transform:rotate(360deg) } }
      </style>
    </div>`;
}
