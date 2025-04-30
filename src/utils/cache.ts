import NodeCache from 'node-cache';

const ttl = Number(process.env.CACHE_TTL) || 60;
const cache = new NodeCache({ stdTTL: ttl, checkperiod: ttl * 0.2 });

export default cache;
