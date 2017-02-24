import { parseFile } from './fileparser';

describe('fileparser', () => {
  it('parse file', () => {
    expect(true).toEqual(true);

    const result = parseFile('./test.in');

    expect(result.videoCount).toEqual(5);
    expect(result.endpointCount).toEqual(2);
    expect(result.requestDescCount).toEqual(4);
    expect(result.cacheCount).toEqual(3);
    expect(result.cacheCapacity).toEqual(100);

  });
});