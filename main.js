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
const videoEndpointMap = {};

const run = (fileName) => {
  const data = parseFile(`./${fileName}.in`);

  const videoSizes = {};
  let videoSizeSum = 0;
  const endpoints = [];
  data.endpoints.forEach((_endpoint, index) => {
    const endpoint = new Endpoint(index, _endpoint)

    if (endpoint.caches.length !== 0) {
      endpoints.push(endpoint);
    }
  });

  endpoints.forEach(_endpoint => {
    videoEndpointMap[_endpoint.id] = {};
    endpointmap[_endpoint.id] = _endpoint
  });
  const videos = data.videoSizes
    .map((video, index) => new Video(index, video));

  videos.forEach(_video => {
    videoSizes[_video.id] = _video.size;
    videoSizeSum += _video.size;
    videomap[_video.id] = _video
  });

  for (var i = 0; i < data.cacheCount; i++) {
    cacheMap[i] = new Cache(i, data.cacheCapacity);
  }

  const requests = [];

  data.requests.forEach(_request => {
    const videoId = _request[0];
    const endpointId = _request[1];
    const count = parseInt(_request[2], 10);

    if (!videoEndpointMap[endpointId]) {
      return;
    }

    if (!videoEndpointMap[endpointId][videoId]) {
      const request = new Request(_request);
      videoEndpointMap[endpointId][videoId] = request;
      requests.push(request);
    } else {
      videoEndpointMap[endpointId][videoId].count += count;
    }
  });

  requests.forEach(request => {
    const video = videomap[request.videoId];
    const endpoint = endpointmap[request.endpointId];

    endpoint.caches.forEach(_cache => {
      const cache = cacheMap[_cache.id];

      cache.addPossibleVideo(video, request.count, _cache.latency, endpoint.dataCenterLatency);
    });
  });

  const bestGains = getBestGains(requests).sort((a, b) => b.gain - a.gain);

  parseGains(bestGains);

  requests.sort((a, b) => {
    return calcRequestImportance(b) - calcRequestImportance(a);
  });

  parseRequests(requests);
  parseRequests(requests, true);

  writeOutput(cacheMap, `./${fileName}.out`);
};


const testmap = {};

function parseGains(gains) {
  gains.forEach(gain => {
    const cache = gain.cache;
    const video = gain.video;

    if (!cache.videoExists(video.id) && cache.canAdd(video)) {
      cache.add(video);
    }
  });
}


function parseRequests(requests, ignoreDuplicates = false) {
  requests.forEach(request => {
    const endpoint = endpointmap[request.endpointId];
    const video = videomap[request.videoId];

    if (videoAlreadyExistsInEndpointCaches(endpoint, video.id) && !ignoreDuplicates) {
      return;
    }

    const cache = findBestCache(endpoint, video);

    if (!cache) {
      return;
    }

    cache.add(video);
  });
}

function getBestGains(requests, ignoreDoubleEnpointGroup = false) {
  const gains = [];

  requests.forEach(request => {
    const endpoint = endpointmap[request.endpointId];
    const video = videomap[request.videoId];

    if (videoAlreadyExistsInEndpointCaches(endpoint, video.id) && !ignoreDoubleEnpointGroup) {
      return;
    }

    let bestGain = 0;
    let bestCache = null;

    endpoint.caches.forEach(_cache => {
      const cache = cacheMap[_cache.id];
      const gain = cache.getGainByVideo(video.id);

      //console.log(gain);

      if (gain >= bestGain) {
        bestCache = cache;
        bestGain = gain;
      }
    });

    if (!bestCache) {
      //console.log(endpoint.caches);
    }

    gains.push({
      video,
      cache: bestCache,
      gain: bestGain
    });
  });

  return gains;
}

function videoAlreadyExistsInEndpointCaches(endpoint, videoId) {
  let videoExists = false;

  endpoint.caches.forEach(_cache => {
    const cache = cacheMap[_cache.id];

    if (cache.videoExists(videoId)) {
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
    const score = _cache.latency / fillLevel;

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

//run('me_at_the_zoo');
//run('videos_worth_spreading');
run('kittens');
//run('trending_today');
