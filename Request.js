module.exports = class Request {
  constructor(raw) {
    this.videoId = parseInt(raw[0], 10);
    this.endpointId = parseInt(raw[1], 10);
    this.count = parseInt(raw[2], 10);
  }
}
