// Shared Supabase setup for the public portfolio and admin dashboard.
(function () {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const ready = cfg.supabaseUrl && cfg.supabaseAnonKey &&
    cfg.supabaseUrl.startsWith("https://") &&
    !cfg.supabaseUrl.includes("PASTE_") &&
    !cfg.supabaseAnonKey.includes("PASTE_");
  window.portfolioSupabaseReady = Boolean(ready && window.supabase);
  window.portfolioSupabase = window.portfolioSupabaseReady
    ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
    : null;
})();
