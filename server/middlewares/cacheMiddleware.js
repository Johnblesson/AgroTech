import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 120, checkperiod: 120 });

const cacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET') {
    // Only cache GET requests
    console.log(`Skipping cache for ${req.method} request to ${req.originalUrl || req.url}`);
    return next();
  }

  const key = req.originalUrl || req.url;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    console.log(`Cache hit for ${key}`);
    return res.send(cachedResponse);
  } else {
    console.log(`Cache miss for ${key}`);
    res.sendResponse = res.send;
    res.send = (body) => {
      cache.set(key, body);
      res.sendResponse(body);
    };
    next();
  }
};

export default cacheMiddleware;
