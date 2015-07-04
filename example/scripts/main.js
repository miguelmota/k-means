'use strict';

/**
* random
* @desc Generate a random number within a range.
* @param {number} start - start number
* @param {number} end - end number
* @return random number.
*/
function random(start, end) {
  var dif = end - start;
  return (Math.random() * dif + start + 1)>>0;
}

/**
* generateSampleData
* @desc Returns an array with sample points.
* @param {object} options - options object
* @param {number} options.number - maximum number of points
* @return array with arrays of points
* @example
* var points = generateSampleData({points: 2});
* console.log(points); // [[2,5],[9,4]]
*/
function generateSampleData(opts) {
  opts = opts || {};
  var points = opts.points || 10;
  var data = [];

  // Generate random data
  for (var i = 0; i < points; i++) {
    data.push([random(0,10), random(0,10)]);
  }
  return data;
}

/**
* generateClusterColors
* @desc Generate a random colors for clusters.
* @return random colors
*/
function generateClusterColors(size) {
  var colors = [];

  // Generate point color for each cluster.
  for (var i = 0; i < size; i++) {
    colors.push('#'+((Math.random()*(1<<24))|0).toString(16));
  }

  return colors;
}

/**
* draw
* @desc Draws clusters onto canvas
* @param {object} context - canvas context.
* @param {array} colors - cluster colors.
* @param {array} data - data points to cluster.
* @param {array} means - cluster centroid points.
* @param {array} assignments - tracks which cluster centroid each data point belongs to.
* @param {array} extents - min and max points for each dimension.
* @param {array} ranges - ranges for each extent.
*/
function draw(context, clusterColors, data, means, assignments, extents, ranges) {
  var canvas = context.canvas;

  // Slightly clear the canvas to make new draws visible.
  context.fillStyle = 'rgba(255,255,255, 0.2)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  var point;
  var i;

  /* Iterate though points draw line from their origin to their cluster centroid.
  * `assignments` contains cluster centroid index for each point.
  */
  for (i = 0; i < assignments.length; i++) {
    var meanIndex = assignments[i];
    point = data[i];
    var mean = means[meanIndex];

    // Make lines that will get drawn alpha transparent.
    context.globalAlpha = 0.1;

    // Push current state onto the stack.
    context.save();

    context.beginPath();

    // Begin path from current point origin.
    context.moveTo(
      (point[0] - extents[0].min + 1) * (canvas.width / (ranges[0] + 2)),
      (point[1] - extents[1].min + 1) * (canvas.height / (ranges[1] + 2))
    );

    // Draw path from the point (moveTo) to the cluster centroid.
    context.lineTo(
      (mean[0] - extents[0].min + 1) * (canvas.width / (ranges[0] + 2)),
      (mean[1] - extents[1].min + 1) * (canvas.height / (ranges[1] + 2))
    );

    // Draw a stroke on the path to make it visible.
    context.strokeStyle = 'black';
    context.stroke();
    //context.closePath();

    // Restore saved state.
    context.restore();
  }

  // Plot every point onto canvas.
  for (i = 0; i < data.length; i++) {
    context.save();

    point = data[i];

    // Make style fully opaque.
    context.globalAlpha = 1;

    // Move canvas origin on the grid to current point position.
    context.translate(
      (point[0] - extents[0].min + 1) * (canvas.width / (ranges[0] + 2)),
      (point[1] - extents[1].min + 1) * (canvas.width / (ranges[1] + 2))
    );

    context.beginPath();

    // Draw point circle.
    context.arc(0, 0, 5, 0, Math.PI*2, true);

    // Set the color for current point based on which cluster it belongs to.
    context.strokeStyle = clusterColors[assignments[i]];

    // Draw a stroke to make circle visible.
    context.stroke();
    context.closePath();

    context.restore();
  }

  // Draw cluster centroids (means).
  for (i = 0; i < means.length; i++) {
    context.save();

    point = means[i];

    context.globalAlpha = 0.5;
    context.fillStyle = clusterColors[i];
    context.translate(
      (point[0] - extents[0].min + 1) * (canvas.width / (ranges[0] + 2)),
      (point[1] - extents[1].min + 1) * (canvas.width / (ranges[1] + 2))
    );
    context.beginPath();
    context.arc(0, 0, 5, 0, Math.PI*2, true);
    context.fill();
    context.closePath();

    context.restore();
  }
}

// Get canvas context.
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var drawDelay = 20;

var states = [];

function run() {
  states = [];

  // Clear the canvas.
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Fill background.
  context.fillStyle = 'rgb(255,255,255)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Generate sample data.
  var data = generateSampleData({points: random(20,60)});

  // Number of K points.
  var kPoints = random(3,6);

  // Generate cluster colors.
  var clusterColors = generateClusterColors(kPoints);

  // Create K-Means object
  var kmeans = KMeans({
    data: data,
    k: kPoints
  });

  // Callback for each iteration.
  kmeans.on('iteration', function(self) {
    // Draw the points onto canvas.
    draw(context, clusterColors, self.data, self.means, self.assignments, self.extents, self.ranges);
  });

  // Callback for when algorithm finished
  kmeans.on('end', function(self) {
    console.log('Iterations took for completion: ' + self.iterations);
  });

  // Perform work.
  kmeans.run({
    // Delay for each draw iteration.
    delay: drawDelay
  });
}

var runButton = document.getElementById('run');

runButton.addEventListener('click', run, false);

run();
