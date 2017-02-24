module.exports = class Cache {
  constructor(id, capacity) {
    this.id = id;
    this.capacity = capacity;
    this.currentCapacity = 0;
    this.videos = {};
    this.possibleVideos = {};
  }

  videoExists(id) {
    return this.videos[id];
  }

  canAdd(video) {
    return this.currentCapacity + video.size <= this.capacity;
  }

  add(video) {
    this.videos[video.id] = true;

    this.currentCapacity += video.size;

    if (this.currentCapacity > this.capacity) {
      throw new Error('Cache max capacity exceeded');
    }
  }

  addPossibleVideo(video, count, latency, dataCenterLatency) {
    if (!this.possibleVideos[video.id]) {
      this.possibleVideos[video.id] = {
        size: video.size,
        gain: 0
      };
    }

    this.possibleVideos[video.id].gain += (dataCenterLatency - latency) * count;
  }

  getGainByVideo(id) {
    return this.possibleVideos[id].gain / this.possibleVideos[id].size;
  }
}
