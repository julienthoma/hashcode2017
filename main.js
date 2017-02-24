const fileparser = require('./fileparser');
const parseFile = fileparser.parseFile;
const writeOutput = fileparser.writeOutput;
const Endpoint = require('./Endpoint');
const Video = require('./Video');
const Request = require('./Request');
const Cache = require('./Cache');

const endpointmap = {};
const videomap = {};
const cacheMap = {};

const run = (fileName) => {
  const data = parseFile(`./${fileName}.in`);

  const videoSizes = {};
  let videoSizeSum = 0;
  const endpoints = data.endpoints.map((endpoint, index) => new Endpoint(index, endpoint));


  endpoints.forEach(_endpoint => endpointmap[_endpoint.id] = _endpoint);
  const videos = data.videoSizes
    .map((video, index) => new Video(index, video));

  videos.forEach(_video => {
    videoSizes[_video.id] = _video.size;
    videoSizeSum += _video.size;
    videomap[_video.id] = _video
  });

  const videoAvgSize = videoSizeSum / videos.length;

  const requests = data.requests.map(request => new Request(request));


  for (var i = 0; i < data.cacheCount; i++) {
    cacheMap[i] = new Cache(i, data.cacheCapacity);
  }

  requests.sort((a, b) => {
    return calcRequestImportance(b) - calcRequestImportance(a);
  });

  parseRequests(requests);
  parseRequests(requests, true);

  console.log('done');

  writeOutput(cacheMap, `./${fileName}.out`);
};


const testmap = {};

function parseRequests(requests, ignoreDuplicates = false) {
  requests.forEach(request => {

    //if (!testmap[request.endpointId]) {
    //  testmap[request.endpointId] = {}
    //}
    //
    //if (!testmap[request.endpointId][request.videoId]) {
    //  testmap[request.endpointId][request.videoId] = 0;
    //}
    //
    //testmap[request.endpointId][request.videoId]++;

    const endpoint = endpointmap[request.endpointId];
    const video = videomap[request.videoId];

    if (videoAlreadyExistsInEndpointCaches(endpoint, video) && !ignoreDuplicates) {
      return;
    }

    const cache = findBestCache(endpoint, video);

    if (!cache) {
      return;
    }

    cache.add(video);
  });
}

function videoAlreadyExistsInEndpointCaches(endpoint, video) {
  let videoExists = false;

  endpoint.caches.forEach(_cache => {
    const cache = cacheMap[_cache.id];

    if (cache.videoExists(video)) {
      videoExists = true;
    }
  });

  return videoExists;
}

function findBestCache(endpoint, video) {
  let bestCache = null;
  let lowestScore = 999999999999;

  for (var i = 0, len = endpoint.caches.length; i < len; i++) {
    const _cache = endpoint.caches[i];
    const cache = cacheMap[_cache.id];


    if (!cache.canAdd(video) || cache.videoExists(video)) {
      continue;
    }

    const fillLevel = cache.currentCapacity / cache.capacity;
    const score = _cache.latency;

    if (score < lowestScore) {
      lowestScore = score;
      bestCache = cache;
    }
  }

  return bestCache;
}

function calcRequestImportance(request) {
  const { count } = request;
  const endpoint = endpointmap[request.endpointId];
  const { dataCenterLatency } = endpoint;
  const video = videomap[request.videoId];

  return (count * dataCenterLatency) / video.size;
}

run('me_at_the_zoo');
run('videos_worth_spreading');
//run('kittens');
run('trending_today');
