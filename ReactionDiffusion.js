var prev_A = [];
var curr_A = [];
var prev_B = [];
var curr_B = [];

var FEED_RATE = 0.054;
var KILL_RATE = 0.062;
var DIFFUSION_A = 1.0;
var DIFFUSION_B = 0.5;

function fill_grid(grid, val) {
  for (var i = 0; i < height; i++) {
    var row = [];
    for (var j = 0; j < width; j++) {
      row.push(val);
    }
    grid.push(row);
  }
}

function seed_rect(grid, row, col, rows, cols, val) {
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid[row + i][col + j] = val;
    }
  }
}

function seed_grid(grid) {
  seed_rect(grid, 100, 100, 100, 100, 1.0);
  seed_rect(grid, 150, 150, 200, 200, 1.0);
}

function setup() {
  createCanvas(500, 500);
  pixelDensity(1);
  background(200);
  
  // Set up the grids
  fill_grid(prev_A, 1.0);
  fill_grid(prev_B, 0.0);
  fill_grid(curr_A, 0.0);
  fill_grid(curr_B, 0.0);
  seed_grid(prev_B);
}

function neighbor(grid, row, col, row_offset, col_offset) {
  var r = row + row_offset;
  var c = col + col_offset;
  if (c < 0 || c >= width){
    return 0.0;
  } else if (r < 0 || r >= height) {
    return 0.0;
  }
  
  return grid[r][c];
}

function laplacian(grid, row, col) {
  var CENTER_WEIGHT = -1.0;
  var CORNER_WEIGHT = 0.05;
  var ADJ_WEIGHT = 0.2;
  
  var center = CENTER_WEIGHT * grid[row][col];
  
  var n = ADJ_WEIGHT * neighbor(grid, row, col, -1, 0);
  var s = ADJ_WEIGHT * neighbor(grid, row, col, 1, 0);
  var e = ADJ_WEIGHT * neighbor(grid, row, col, 0, 1);
  var w = ADJ_WEIGHT * neighbor(grid, row, col, 0, -1);
  
  var nw = CORNER_WEIGHT * neighbor(grid, row, col, -1, -1);
  var ne = CORNER_WEIGHT * neighbor(grid, row, col, -1, 1);
  var sw = CORNER_WEIGHT * neighbor(grid, row, col, 1, -1);
  var se = CORNER_WEIGHT * neighbor(grid, row, col, 1, 1);
  
  return center + n + s + e + w + nw + ne + sw + se;
}

function reaction_diffusion_step(row, col) {
  
  // Diffusion Term
  var diffusion_A = DIFFUSION_A * laplacian(prev_A, row, col);
  var diffusion_B = DIFFUSION_B * laplacian(prev_B, row, col);
  
  // Reaction Term
  var old_A = prev_A[row][col];
  var old_B = prev_B[row][col];
  var reaction = old_A * old_B * old_B;
  var reaction_A = -reaction;
  var reaction_B = reaction;
  
  // Feed/Kill terms
  var feed_A = FEED_RATE * (1.0 - old_A);
  var kill_B = -(KILL_RATE + FEED_RATE) * old_B;
  
  // All together
  var delta_A = diffusion_A + reaction_A + feed_A;
  var delta_B = diffusion_B + reaction_B + kill_B;
  curr_A[row][col] = old_A + delta_A;
  curr_B[row][col] = old_B + delta_B;
}

function reaction_diffusion() {
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      reaction_diffusion_step(i, j);
    }
  }
}

function display() {
  loadPixels();
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
       var A = curr_A[i][j];
       var B = curr_B[i][j];
       var center_of_mass = B / (A + B);
       var COLOR_A = color(255, 127, 0);
       var COLOR_B = color(255, 255, 255);
       
       var index = 4 * (i * width + j);       
       var col = lerpColor(COLOR_A, COLOR_B, center_of_mass);
       
       pixels[index] = red(col);
       pixels[index + 1] = green(col);
       pixels[index + 2] = blue(col);
       pixels[index + 3] = 255;
    }
  }
  updatePixels();
}

function swap_buffers() {
  var tmp_A = prev_A;
  prev_A = curr_A;
  curr_A = tmp_A;
  
  var tmp_B = prev_B;
  prev_B = curr_B;
  curr_B = tmp_B;
}


function draw() {
  if (frameCount % 30 == 0) {
    display();
  } else {
      reaction_diffusion();
      swap_buffers();
  }
}
