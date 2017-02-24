module.exports = class Request {
  constructor(raw) {
    this.videoId = raw[0];
    this.endpointId = raw[1];
    this.count = raw[2];
  }
}