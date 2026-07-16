// Logs slow API requests and can log every request when LOG_REQUEST_TIMINGS=true.
const requestTiming = (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const slowRequestMs = Number(process.env.SLOW_REQUEST_MS || 500);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    if (process.env.LOG_REQUEST_TIMINGS === 'true' || durationMs >= slowRequestMs) {
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`);
    }
  });

  next();
};

module.exports = requestTiming;
