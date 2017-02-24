module.exports = class Cache {
  constructor(id, capacity) {
    this.id = id;
    this.capacity = capacity;
    this.currentCapacity = 0;
    this.videos = {}
  }

  videoExists(video) {
    return this.videos[video.id];
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
}