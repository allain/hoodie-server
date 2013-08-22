var expect = require('expect.js');
var workers = require('../../lib/workers');

describe('workers', function () {

  describe('methods', function () {

    it('should have a startAll property', function () {
      expect(workers).to.have.property('startAll');
    });

    it('should have a startWorker property', function () {
      expect(workers).to.have.property('startWorker');
    });

    it('should have a getWorkerNames property', function () {
      expect(workers).to.have.property('getWorkerNames');
    });

    it('should have a getWorkerModuleNames property', function () {
      expect(workers).to.have.property('getWorkerModuleNames');
    });

    it('should have a workerPath property', function () {
      expect(workers).to.have.property('workerPath');
    });

    it('should have a readMetadata property', function () {
      expect(workers).to.have.property('readMetadata');
    });

  });

});
