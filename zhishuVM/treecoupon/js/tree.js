function Ship(ctx){
	gameMonitor.im.loadImage(['treecoupon/img/player.png']);
	this.width = 80;
	this.height = 80;
	this.left = gameMonitor.w/2 - this.width/2;
	this.top = gameMonitor.h - 2*this.height;
	this.player = gameMonitor.im.createImage('treecoupon/img/player.png');

	this.paint = function(){
		ctx.drawImage(this.player, this.left, this.top, this.width, this.height);
	}

	this.setPosition = function(event){
		if(gameMonitor.isMobile()){
			var tarL = event.changedTouches[0].clientX;
			var tarT = event.changedTouches[0].clientY;
		}
		else{
			var tarL = event.offsetX;
			var tarT = event.offsetY;
		}
		this.left = tarL - this.width/2 - 16;
		this.top = tarT - this.height/2;
		if(this.left<0){
			this.left = 0;
		}
		if(this.left>gameMonitor.w-this.width){
			this.left = gameMonitor.w-this.width;
		}
		if(this.top<0){
			this.top = 0;
		}
		if(this.top>gameMonitor.h - this.height){
			this.top = gameMonitor.h - this.height;
		}
		this.paint();
	}

	this.controll = function(){
		var _this = this;
		var stage = $('#gamepanel');
		var currentX = this.left,
			currentY = this.top,
			move = false;
		stage.on(gameMonitor.eventType.start, function(event){
			_this.setPosition(event);
			move = true;
		}).on(gameMonitor.eventType.end, function(){
			move = false;
		}).on(gameMonitor.eventType.move, function(event){
			event.preventDefault();
			if(move){
				_this.setPosition(event);	
			}
			
		});
	}

	this.eat = function(foodlist){
		for(var i=foodlist.length-1; i>=0; i--){
			var f = foodlist[i];
			if(f){
				var l1 = this.top+this.height/2 - (f.top+f.height/2);
				var l2 = this.left+this.width/2 - (f.left+f.width/2);
				var l3 = Math.sqrt(l1*l1 + l2*l2);
				if(l3<=this.height/2 + f.height/2){
					foodlist[f.id] = null;
					if(f.type==0){
						gameMonitor.stop();
						$('#gameoverPanel').show();

						setTimeout(function(){
							$('#gameoverPanel').hide();
							$('#resultPanel').show();
							gameMonitor.getScore();
						}, 1000);
					}
					else{
						$('#score').text(++gameMonitor.score);
						$('.heart').removeClass('hearthot').addClass('hearthot');
						setTimeout(function() {
							$('.heart').removeClass('hearthot')
						}, 200);
					}
				}
			}
			
		}
	}
}

function Food(type, left, id){
	this.speedUpTime = 300;
	this.id = id;
	this.type = type;
	this.width = 50;
	this.height = 50;
	this.left = left;
	this.top = -50;
	this.speed = 0.04 * Math.pow(1.2, Math.floor(gameMonitor.time/this.speedUpTime));
	this.loop = 0;

	var p = this.type == 0 ? 'treecoupon/img/food1.png' : 'treecoupon/img/food2.png';
	this.pic = gameMonitor.im.createImage(p);
}
Food.prototype.paint = function(ctx){
	ctx.drawImage(this.pic, this.left, this.top, this.width, this.height);
}
Food.prototype.move = function(ctx){
	if(gameMonitor.time % this.speedUpTime == 0){
		this.speed *= 1.2;
	}
	this.top += ++this.loop * this.speed;
	if(this.top>gameMonitor.h){
	 	gameMonitor.foodList[this.id] = null;
	}
	else{
		this.paint(ctx);
	}
}


function ImageMonitor(){
	var imgArray = [];
	return {
		createImage : function(src){
			return typeof imgArray[src] != 'undefined' ? imgArray[src] : (imgArray[src] = new Image(), imgArray[src].src = src, imgArray[src])
		},
		loadImage : function(arr, callback){
			for(var i=0,l=arr.length; i<l; i++){
				var img = arr[i];
				imgArray[img] = new Image();
				imgArray[img].onload = function(){
					if(i==l-1 && typeof callback=='function'){
						callback();
					}
				}
				imgArray[img].src = img
			}
		}
	}
}

function showMessage(text) {
    $('#message').html(text);
    document.getElementById('message').style.display = 'block';
    setTimeout(function () {
        document.getElementById('message').style.display = 'none';
    }, 1500);
}

var gameMonitor = {
	w : 320,
	h : 568,
	bgWidth : 320,
	bgHeight : 1126,
	time : 0,
	timmer : null,
	bgSpeed : 2,
	bgloop : 0,
	score : 0,
	im : new ImageMonitor(),
	foodList : [],
	bgDistance : 0,//背景位置
	eventType : {
		start : 'touchstart',
		move : 'touchmove',
		end : 'touchend'
	},
	init : function(){
		var _this = this;
		var canvas = document.getElementById('stage');
		var ctx = canvas.getContext('2d');

		//绘制背景
		var bg = new Image();
		_this.bg = bg;
		bg.onload = function(){
          	ctx.drawImage(bg, 0, 0, _this.bgWidth, _this.bgHeight);          	
		}
		bg.src = 'treecoupon/img/bg.png';

		_this.initListener(ctx);


	},
	initListener : function(ctx){
		var _this = this;
		var body = $(document.body);
		$(document).on(gameMonitor.eventType.move, function(event){
			event.preventDefault();
		});
		body.on(gameMonitor.eventType.start, '.replay, .playagain', function(){
			$('#resultPanel').hide();
			var canvas = document.getElementById('stage');
			var ctx = canvas.getContext('2d');
			_this.ship = new Ship(ctx);
      		_this.ship.controll();
      		_this.reset();
			_this.run(ctx);
		});

		body.on(gameMonitor.eventType.start, '#frontpage', function(){
			$('#frontpage').css('left', '-100%');
		});

		body.on(gameMonitor.eventType.start, '#guidePanel', function(){
			$(this).hide();
			_this.ship = new Ship(ctx);
			_this.ship.paint();
      		_this.ship.controll();
			gameMonitor.run(ctx);
		});

		body.on(gameMonitor.eventType.start, '.read', function(){
			
			window.location='/h5/treebook.htm';
		});

	},
	rollBg : function(ctx){
		if(this.bgDistance>=this.bgHeight){
			this.bgloop = 0;
		}
		this.bgDistance = ++this.bgloop * this.bgSpeed;
		ctx.drawImage(this.bg, 0, this.bgDistance-this.bgHeight, this.bgWidth, this.bgHeight);
		ctx.drawImage(this.bg, 0, this.bgDistance, this.bgWidth, this.bgHeight);
	},
	run : function(ctx){
		var _this = gameMonitor;
		ctx.clearRect(0, 0, _this.bgWidth, _this.bgHeight);
		_this.rollBg(ctx);

		//绘制飞船
		_this.ship.paint();
		_this.ship.eat(_this.foodList);


		//产生小树
		_this.genorateFood();

		//绘制小树
		for(i=_this.foodList.length-1; i>=0; i--){
			var f = _this.foodList[i];
			if(f){
				f.paint(ctx);
				f.move(ctx);
			}
			
		}
		_this.timmer = setTimeout(function(){
			gameMonitor.run(ctx);
		}, Math.round(1000/60));

		_this.time++;
	},
	stop : function(){
		var _this = this
		$('#stage').off(gameMonitor.eventType.start + ' ' +gameMonitor.eventType.move);
		setTimeout(function(){
			clearTimeout(_this.timmer);
		}, 0);
		
	},
	genorateFood : function(){
		var genRate = 50; //产生小树的频率
		var random = Math.random();
		if(random*genRate>genRate-1){
			var left = Math.random()*(this.w - 50);
			var type = Math.floor(left)%2 == 0 ? 0 : 1;
			var id = this.foodList.length;
			var f = new Food(type, left, id);
			this.foodList.push(f);
		}
	},
	reset : function(){
		this.foodList = [];
		this.bgloop = 0;
		this.score = 0;
		this.timmer = null;
		this.time = 0;
		$('#score').text(this.score);
	},
	getScore : function(){
		var time = Math.floor(this.time/60);
		var score = this.score;
		var user = 1;
		if(score==0){
			$('#scorecontent').html('<br/>真遗憾，您没能阻止小树被砍伐！<br/>请注意躲避<span class="lighttext">斧头</span>');
			$('.btn1').text('请重新来过').removeClass('read').addClass('playagain');
			$('#coupon2').hide();
			$('#coupon1').show();
			return;
		}
		else if(score<10){
			user = 2;
		}
		else if(score>10 && score<=20){
			user = 10;
		}
		else if(score>20 && score<=40){
			user = 40;
		}
		else if(score>40 && score<=60){
			user = 80;
		}
		else if(score>60 && score<=80){
			user = 92;
		}
		else if(score>80){
			user = 99;
		}
		if (parseInt(isUsed) == 0) {
			$.post("/h5Service/getCoupons.do", {"key": '170312', "code": '001'}, function (result) {
                if (result.success == false) {
                    showMessage(result.msg);
                    return;
                }
                isUsed=1;      
            }, "json");
			$('#coupon2').show();
			$('#coupon1').hide();
			$('#scorecontent').html('<span class="lighttext">获得低碳阅读红包</span><br/>您在<span id="stime" class="lighttext">2378</span>秒内阻止了<span id="sscore" class="lighttext">21341</span>课小树免受砍伐<br>超过了<span id="suser" class="lighttext">31%</span>的用户！');
			$('#stime').text(time);
			$('#sscore').text(score);
			$('#suser').text(user+'%');
			$('.btn1').text('开启低碳阅读>>').removeClass('playagain').addClass('read');
			return;
		}
		
		$('#coupon2').show();
		$('#coupon1').hide();
		$('#scorecontent').html('<span class="lighttext">您已领取低碳阅读红包，用完才能再领</span><br/>您在<span id="stime" class="lighttext">2</span>秒内阻止了<span id="sscore" class="lighttext">2</span>课小树免受砍伐<br>超过了<span id="suser" class="lighttext">3%</span>的用户！');
		$('#stime').text(time);
		$('#sscore').text(score);
		$('#suser').text(user+'%');
		$('.btn1').text('开启低碳阅读>>').removeClass('playagain').addClass('read');
		
	},
	isMobile : function(){
		var sUserAgent= navigator.userAgent.toLowerCase(),
		bIsIpad= sUserAgent.match(/ipad/i) == "ipad",
		bIsIphoneOs= sUserAgent.match(/iphone os/i) == "iphone os",
		bIsMidp= sUserAgent.match(/midp/i) == "midp",
		bIsUc7= sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
		bIsUc= sUserAgent.match(/ucweb/i) == "ucweb",
		bIsAndroid= sUserAgent.match(/android/i) == "android",
		bIsCE= sUserAgent.match(/windows ce/i) == "windows ce",
		bIsWM= sUserAgent.match(/windows mobile/i) == "windows mobile",
		bIsWebview = sUserAgent.match(/webview/i) == "webview";
		return (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM);
     }
}

if(!gameMonitor.isMobile()){
	gameMonitor.eventType.start = 'mousedown';
	gameMonitor.eventType.move = 'mousemove';
	gameMonitor.eventType.end = 'mouseup';
}
$(function () {
    //HEIGHT
    var height =$(window).height();
    $('#stage').attr('height',height);
    gameMonitor.bgHeight=height;
    gameMonitor.h=height;
    var width=$(window).width();
    $('#stage').attr('width',width);
    gameMonitor.bgWidth=width;
    gameMonitor.w=width;
    $('#gamepanel').css({'width':width});
    gameMonitor.init();
})

