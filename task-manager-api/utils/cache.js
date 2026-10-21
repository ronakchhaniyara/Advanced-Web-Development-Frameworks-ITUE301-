const NodeCache = require("node-cache");

// Initialize in-memory cache with standard TTL of 60 seconds (1 minute)
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

// Cache performance metrics tracking (Supplementary Problem 2)
const stats = {
  hits: 0,
  misses: 0,
  invalidations: 0,
  lastInvalidationTime: null,
};

const getCache = (key) => {
  const data = cache.get(key);
  if (data !== undefined) {
    stats.hits++;
    return { data, cached: true };
  }
  stats.misses++;
  return { data: null, cached: false };
};

const setCache = (key, value, ttl = 60) => {
  return cache.set(key, value, ttl);
};

const invalidateKey = (key) => {
  stats.invalidations++;
  stats.lastInvalidationTime = new Date().toISOString();
  return cache.del(key);
};

const invalidateTaskCache = (taskId = null) => {
  stats.invalidations++;
  stats.lastInvalidationTime = new Date().toISOString();
  cache.del("all_tasks");
  if (taskId) {
    cache.del(`task_${taskId}`);
  }
};

const clearAllCache = () => {
  stats.invalidations++;
  stats.lastInvalidationTime = new Date().toISOString();
  cache.flushAll();
};

const getCacheStats = () => {
  const keys = cache.keys();
  const totalRequests = stats.hits + stats.misses;
  const hitRatio = totalRequests > 0 ? ((stats.hits / totalRequests) * 100).toFixed(1) + "%" : "0%";

  return {
    hits: stats.hits,
    misses: stats.misses,
    totalRequests,
    hitRatio,
    activeKeysCount: keys.length,
    activeKeys: keys,
    stdTTL: 60,
    invalidations: stats.invalidations,
    lastInvalidationTime: stats.lastInvalidationTime,
  };
};

module.exports = {
  cache,
  getCache,
  setCache,
  invalidateKey,
  invalidateTaskCache,
  clearAllCache,
  getCacheStats,
};
