module.exports = class Endpoint {
  constructor(id, raw) {
    this.id = id;
    this.dataCenterLatency = raw[0];
    this.caches = raw[1]
      .map(cacheLatency => ({id: cacheLatency[0], latency: cacheLatency[1]}));
  }
};
