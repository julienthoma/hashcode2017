const fs = require('fs');

exports.writeOutput = (data, filename) => {
  let outputString = Object.keys(data).length + '\n';

  for (let key in data) {
    const cache = data[key];
    outputString += key + ' ' + Object.keys(cache.videos).join(' ') + '\n';
  }

  fs.writeFileSync(filename, outputString);
};

exports.parseFile = file => {
  const content = fs.readFileSync(file, 'ascii');
  const rows = content.split('\n');
  // Relevant.
  const [videoCount, endpointCount, requestDescCount, cacheCount, cacheCapacity] =
    rows[0].split(' ').map(element => parseInt(element));

  // i --> size
  const videoSizes = rows[1].split(' ').map(element => parseInt(element));
  // endpointId -> [data center latency, [cacheId, latency]]
  const endpoints = [];
  // VideoId, endpointId, requestCount
  let requests = [];

  /**
   * Data parsing.
   */
  let rowIter = 2;
  let endpointCounter = endpointCount;
  while (endpointCounter-->0) {
    let [centerLatency, _cacheCount] = rows[rowIter++].split(' ');
    let caches = [];
    while (_cacheCount-->0) {
      caches.push(rows[rowIter++].split(' '));
    }
    endpoints.push([centerLatency, caches]);
  }

  let requestDescCounter = requestDescCount;
  while (requestDescCounter-->0) {
    requests.push(rows[rowIter++].split(' '));
  }

  /**
   * My Logic here.
   */


  return {
    videoCount,
    endpointCount,
    requestDescCount,
    cacheCount,
    cacheCapacity,
    videoSizes,
    endpoints,
    requests
  };
  // const outputString = slices.length + '\n' + slices.map(slice => slice.join(' ')).join('\n') + '\n';
  // fs.writeFileSync(`${size}.out`, outputString);
}