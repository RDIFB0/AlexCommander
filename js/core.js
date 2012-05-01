	function createLine(chars, cnt) {
		cnt = (cnt === undefined) ? 80 : cnt;
		var res = "";
		for(var i = 0; i < cnt; i++) {
			res = res.concat(chars);
		}
		return res;
	}

	function expandArray(collapsed) {
		var res = [];
		for (var i = 0; i < collapsed.length; i++) {
			var val = collapsed[i][0];
			var times = collapsed[i][1];
			for (var j = 0; j < times; j++)
				res[res.length] = val;
		}
		return res;
	}

	/**
	 * Return current cursor position
	 * @param e Event
	 * @return {Array} Position
	 */
	function getCursorPosition(e) {
		var x;
		var y;
		if (e.pageX || e.pageY) {
			x = e.pageX;
			y = e.pageY;
		} else {
			x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;
		return [Math.floor(x/metrics.width), Math.floor(y/metrics.height)];
	}

	// global variables
	var consoleLine = new String();
	var consoleFullscreen = false;
	/**
	 * display grid or not
	 */
	var isGrid = false;

	// time interval id
	var timeInterval = null;

	// current panel, default left
	var isLeft = true;

	var filePanel = function() {
		this.directory = ".";
		this.files = [];
		this.cachedFiles = [];
		this.countFiles = 0;
		this.position = 0;
		this.offset = 0;
	};

	filePanel.prototype.up = function() {
		if (this.position <= this.offset) {
			if (this.offset !== 0)
				this.offset--;
		}
		this.position = Math.max(this.position-1, 0);
		this.draw();
	};

	filePanel.prototype.down = function() {
		if (this.position > 16 + this.offset) {
			if (this.offset < this.countFiles - 18)
				this.offset++;
		}
		this.position = Math.min(this.position+1, this.countFiles-1);
		this.draw();
	};

	filePanel.prototype.dir = function() {
		if (this.countFiles && (this.files[this.position].perm.substr(0,1) == "d")) {
			return this.directory +"/"+ this.files[this.position].name;
		}
		return false;
	};

	filePanel.prototype.file = function() {
		if (this.countFiles) {
			return this.directory +"/"+ this.files[this.position].name;
		}
		return this.directory;
	};

	filePanel.prototype.load = function(files) {
		this.position = 0;
		this.offset = 0;
		this.files = files;
		this.countFiles = files.length;
		this.cachedFiles = [];
		for (var i in files) {
			this.cachedFiles[this.cachedFiles.length] = getShortName(files[i].name) + "\u2502" + files[i].perm;
		}
		this.draw();
	};

	filePanel.prototype.isActive = function() {
		return ((isLeft && this.drawOffset == 0) || (!isLeft && this.drawOffset != 0));
	};

	filePanel.prototype.draw = function() {
		//todo: optimize redrawing
		draw(1+this.drawOffset, 2, [["\u2588",38*18]], [["rgba(0,0,200,1)", 38*18]], 39+this.drawOffset);
		for (var i = 0 + this.offset; i < this.countFiles; i++) {
			if (i-this.offset > 17)
				break;
			if (i == this.position && this.isActive()) {
				draw(1+this.drawOffset, 2+i-this.offset, [["\u2588",38]], [["#0FF",38]]);
				draw(1+this.drawOffset, 2+i-this.offset, strToArray(this.cachedFiles[i]), [["#000",38]]);
			} else {
				draw(1+this.drawOffset, 2+i-this.offset, strToArray(this.cachedFiles[i]), [["#0FF",38]]);
			}
		}
	};

	filePanel.prototype.status = function(text) {
		text = text.substr(0,37);
		draw(1+this.drawOffset, 21, strToArray(text), [["#0FF",38]]);
	};

	var leftFilePanel  = function () {
		this.drawOffset = 0;
	};
	leftFilePanel.prototype = new filePanel();
	var leftPanel = new leftFilePanel();

	var rightFilePanel  = function () {
		this.drawOffset = 40;
	};
	rightFilePanel.prototype = new filePanel();
	var rightPanel = new rightFilePanel();

	// canvas and context
	var canvas = null;
	var ctx = null;

	// current metrics
	var metrics = null;

	// list of buffers
	var buffers = {
		fm: 1,
		console: 2,
		screensaver: 3
	};
	// current buffer
	var curBuffer = buffers.fm;

	function init() {
		canvas = document.getElementById('canva');
		if (canvas.getContext) {
			var font = Fonts.main;
			ctx = canvas.getContext('2d');
			ctx.font = font;
			metrics = ctx.measureText('T');
			metrics = {
				width: Math.round(metrics.width * 100) / 100,
				height: Math.round(metrics.width * Fonts.height * 100) / 100
			};
			// metrics.height = canvas.style.lineHeight;
			canvas.width = metrics.width * 80;
			canvas.height = metrics.height * 25;
			ctx.font = font;
			ctx.textBaseline = "top";
			ctx.mozImageSmoothingEnabled = false;

			// draw default screen
			leftPanel.load(Network.getFiles(leftPanel.file()));
			rightPanel.load(Network.getFiles(rightPanel.file()));
			refresh();
			//
			$("#canva").animate({
				width: metrics.width * 80,
				height: metrics.height * 25
				},300,"linear", function() {
			});
			canvas.addEventListener("click", function(e) {
				var cell = getCursorPosition(e);
				console.log(cell);
				//
				draw(cell[0], cell[1], [["\u2665",1]], [["#F00",1]]);
			}, false);
			return true;
		} else {
			return false;
		}
	}
	function strToArray(str) {
		var res = [];
		var lastChar = null;
		for (var i = 0; i < str.length; i++) {
			if (str[i] !== lastChar) {
				res[res.length] = [str[i],1];
			} else {
				res[res.length-1][1] += 1;
			}
			lastChar = str[i];
		}
		return res;
	}

	/**
	 * Repaint current buffer
	 */
	function refresh() {
		switch (curBuffer) {
			case buffers.fm:
				drawMain();
				break;
			case buffers.console:
				drawConsole();
				break;
			case buffers.screensaver:
				drawScreensaver();
				break;
		}
	}

	function clear() {
		ctx.fillStyle = Colors.background;
		ctx.fillRect (0, 0, canvas.width, canvas.height);
	}

	function draw(xo, yo, chars, colors, max) {
		chars = expandArray(chars);
		colors = expandArray(colors);
		if (chars.length !== colors.length)
			throw "Chars length not equal to colors length";
		max = (max === undefined) ? 80 : max;
		var dxd = 0 + ((xo === undefined) ? 0 : xo);
		var dyd = 0 + ((yo === undefined) ? 0 : yo);
		var dx = dxd;
		var dy = dyd;

		//var lines = [];
		//[].slice();
		//[].join("");
		for (var i = 0; i < chars.length; i++) {
			ctx.fillStyle = colors[i];
			ctx.fillText(chars[i], dx*metrics.width, dy*metrics.height);
			//if ((i+xo+1) % max == 0) {
			if (dx && (dx % (max-1) == 0)) {
				dx = dxd;
				dy++;
			} else {
				dx++;
			}
		}
	}

	function drawSkeleton() {
		draw(0, 0, fmChars, fmColors);
	}

	function drawCL() {
		draw(0, 0, [["\u2588",2000]], [["#0FF",80],["#000",1920]]);
	}

	function drawTime() {
		var isDotted = false;
		if (!timeInterval) {
			timeInterval = setInterval(function(){
				var now = new Date();
				var h = now.getHours();
				var m = now.getMinutes();
				h = (h < 10) ? "0"+h : h;
				m = (m < 10) ? "0"+m : m;
				var t = h + (isDotted?" ":":") + m;
				isDotted = !isDotted;
				draw(75, 0, [["\u2588",5]], [["#0FF",5]]);
				draw(75, 0, strToArray(t), [["#000",5]]);
			}, 1000);
		}
	}

	function drawGrid() {
		if (!isGrid) {
			ctx.fillStyle = "Black";
			for (var y = 0; y < 25; y++) {
				for (var x = 0; x < 80; x++) {
					ctx.strokeRect(x*metrics.width, y*metrics.height, metrics.width, metrics.height);
				}
			}
		} else {
			refresh();
		}
		isGrid = !isGrid;
	}

	function getShortName(fileName) {
		if (fileName.length > 27) {
			return fileName.substr(0, 27);
		} else {
			return fileName.concat(createLine("\u0020",27 - fileName.length));
		}
	}

	function drawLeftRightChange() {
		//todo: optimize redrawing
		leftPanel.draw();
		rightPanel.draw();
	}

	function drawMain() {
		clear();
		drawSkeleton();
		leftPanel.draw();
		rightPanel.draw();
		drawTime();
	}

	function drawConsole() {
		clear();
		drawCL();
		drawTime();
	}

	function drawConsoleLine() {
		draw(0, 23, [["\u2588",80]], [["#000",80]]);
		draw(0, 23, strToArray(consoleLine), [["#0FF",consoleLine.length]]);
	}

	function optimizeDir(str) {
		var regexp = /\/\w+\/\.\./;		// << like boobs :(
		while (regexp.test(str)) {
			str = str.replace(regexp, "");
		}
		return str;
	}

	$(document).ready(function(){
		if (init()) {
			$("body").keypress(function(e){
				switch (curBuffer ) {
					case buffers.fm:
						if (e.keyCode) {
							switch(e.keyCode) {
								case 38:    // up
									(isLeft) ? leftPanel.up() : rightPanel.up();
									return false;
								case 40:    // down
									(isLeft) ? leftPanel.down() : rightPanel.down();
									return false;
								case 37:    // left
									return false;
								case 39:    // right
									return false;
								case 9:     // tab
									isLeft = !isLeft;
									drawLeftRightChange();
									return false;
									break;
								case 13:	// return
									if (isLeft) {
										var dir = leftPanel.dir();
										if (dir) {
											leftPanel.load(Network.getFiles(dir))
											leftPanel.directory = optimizeDir(dir);
										}
									} else {
										var dir = rightPanel.dir();
										if (dir) {
											rightPanel.load(Network.getFiles(dir))
											rightPanel.directory = optimizeDir(dir);
										}
									}
									break;
							}
						}
						if (e.ctrlKey && e.keyCode == 13) {
							consoleLine = (isLeft) ? leftPanel.file().name : rightPanel.file().name;
							drawConsoleLine();
							return false;
						}
						break;
					case buffers.console:
						if (e.charCode && consoleLine.length < 80) {
							consoleLine += Tools.chr(e.charCode);
							drawConsoleLine();
						}
						if (e.keyCode) {
							switch(e.keyCode) {
								case 8:		// backspace
									consoleLine = consoleLine.substr(0,consoleLine.length-1);
									drawConsoleLine();
									break;
								case 13:	// enter
									consoleLine = eval(consoleLine).toString();
									drawConsoleLine();
									//alert(consoleLine);
									break;
								default:
									console.log(e.keyCode);
									break;
							}
						}
						break;
					case buffers.screensaver:
						break;
				}
				//
				if (e.ctrlKey && e.charCode == 0x67) {
					drawGrid();
					return false;
				}
				if (e.ctrlKey && e.charCode == 0x6F) {
					if (curBuffer !== buffers.console) {
						curBuffer = buffers.console;
					} else {
						curBuffer = buffers.fm;
					}
					refresh();
					//e.preventDefault();
					return false;
				}
			});
		}
	});
