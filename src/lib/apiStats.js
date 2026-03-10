// In-memory API usage statistics tracker
// Tracks calls per endpoint per hour

const stats = {
  // { 'YYYY-MM-DD-HH': { chat: N, prompt: N, image: N, image_cost: N } }
  hourly: new Map(),
  // Running totals for current process lifetime
  totals: { chat: 0, prompt: 0, image: 0 },
  startedAt: new Date().toISOString(),
};

// Cost estimates (USD)
const COSTS = {
  chat: 0.001,    // ~$0.001 per DeepSeek chat call
  prompt: 0.0005, // ~$0.0005 per DeepSeek prompt call
  image: 0.01,    // ~$0.01 per KIE image generation (adjust as needed)
};

function getHourKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}`;
}

/**
 * Record an API call
 * @param {'chat' | 'prompt' | 'image'} endpoint
 */
export function recordCall(endpoint) {
  const key = getHourKey();

  if (!stats.hourly.has(key)) {
    stats.hourly.set(key, { chat: 0, prompt: 0, image: 0 });
  }

  const hourData = stats.hourly.get(key);
  hourData[endpoint] = (hourData[endpoint] || 0) + 1;
  stats.totals[endpoint] = (stats.totals[endpoint] || 0) + 1;

  // Keep only last 72 hours of data
  if (stats.hourly.size > 72) {
    const keys = Array.from(stats.hourly.keys()).sort();
    while (keys.length > 72) {
      stats.hourly.delete(keys.shift());
    }
  }
}

/**
 * Get usage statistics
 */
export function getStats() {
  const hourlyData = {};
  const sortedKeys = Array.from(stats.hourly.keys()).sort();

  for (const key of sortedKeys) {
    const data = stats.hourly.get(key);
    hourlyData[key] = {
      ...data,
      cost: round(
        (data.chat || 0) * COSTS.chat +
        (data.prompt || 0) * COSTS.prompt +
        (data.image || 0) * COSTS.image
      ),
    };
  }

  // Calculate today's totals
  const today = new Date().toISOString().slice(0, 10);
  const todayStats = { chat: 0, prompt: 0, image: 0, cost: 0 };
  for (const [key, data] of stats.hourly) {
    if (key.startsWith(today)) {
      todayStats.chat += data.chat || 0;
      todayStats.prompt += data.prompt || 0;
      todayStats.image += data.image || 0;
    }
  }
  todayStats.cost = round(
    todayStats.chat * COSTS.chat +
    todayStats.prompt * COSTS.prompt +
    todayStats.image * COSTS.image
  );

  // Current hour
  const currentHour = getHourKey();
  const currentData = stats.hourly.get(currentHour) || { chat: 0, prompt: 0, image: 0 };

  return {
    serverStarted: stats.startedAt,
    currentHour: {
      key: currentHour,
      ...currentData,
      cost: round(
        (currentData.chat || 0) * COSTS.chat +
        (currentData.prompt || 0) * COSTS.prompt +
        (currentData.image || 0) * COSTS.image
      ),
    },
    today: todayStats,
    lifetime: {
      ...stats.totals,
      cost: round(
        stats.totals.chat * COSTS.chat +
        stats.totals.prompt * COSTS.prompt +
        stats.totals.image * COSTS.image
      ),
    },
    hourly: hourlyData,
    costRates: COSTS,
  };
}

function round(n) {
  return Math.round(n * 10000) / 10000;
}
