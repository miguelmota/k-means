var test = require('tape');
var KMeans = require('../kmeans');

test('kmeans', function (t) {
  'use strict';

  t.plan(8);

  var data = [
    [6,5],
    [9,10],
    [10,1],
    [5,5],
    [7,7],
    [4,1],
    [10,7],
    [6,8],
    [10,2],
    [9,4],
    [2,5],
    [9,1],
    [10,9],
    [2,8],
    [1,1],
    [6,10],
    [3,8],
    [2,3],
    [7,9],
    [7,7],
    [3,6],
    [5,8],
    [7,5],
    [10,9],
    [10,9]
  ];

  var kmeans = KMeans({
    data: data,
    k: 3
  });

  t.deepEqual(kmeans.extents, [{min: 1, max: 10}, {min: 1, max: 10}]);
  t.deepEqual(kmeans.ranges, [9, 9]);
  t.equal(kmeans.iterations, 0);
  t.deepEqual(kmeans.assignments, []);
  t.equal(kmeans.means.length, 3);
  t.equal(kmeans.data.length, data.length);
  t.equal(kmeans.k, 3);

  kmeans.on('iteration', function(self) {

  });

  kmeans.on('end', function(self) {
    t.equal(self.iterations > 0, true);
  });

  kmeans.run();
});
