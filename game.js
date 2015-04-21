window.onload = function() {
     var innerWidth = window.innerWidth;
	var innerHeight = window.innerHeight;
	var gameRatio = innerWidth/innerHeight;	
	var game = new Phaser.Game(Math.floor(480*gameRatio), 480, Phaser.CANVAS);	
	var ninja;
	var ninjaGravity = 800;
	var ninjaJumpPower;    
	var score=0;
	var scoreText;
     var topScore;
     var powerBar;
     var powerTween;
     var placedPoles;
	var poleGroup; 
     var minPoleGap = 100;
     var maxPoleGap = 300; 
     var ninjaJumping;
     var ninjaFallingDown;     
     var fpsCounter;
	var cloud;
	 var cloudGroup;
     var play = function(game){}     
     play.prototype = {
		preload:function(){
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			game.scale.setScreenSize(true);
			game.load.image("star", "star.png");
			game.load.image("diamond", "diamond.png"); 
			game.load.image("pole", "pole3.png");
            game.load.image("powerbar", "powerbar.png");
			game.load.image("background","back.jpg");
			game.load.image("cloud","cloud.png");
			game.load.image("cloud2","cloud2.png");
            //game.load.spritesheet('dude', 'dude.png', 32, 48);
            game.load.spritesheet('baddie', 'baddie.png', 32, 32);
		},
		create:function(){
			ninjaJumping = false;
			ninjaFallingDown = false;
			game.time.advancedTiming = true;
			 //background = game.add.tileSprite(0, 0, game.stage.bounds.width, game.cache.getImage('background').height, 'background');
		//background = game.add.tileSprite(0, 0, game.cache.getImage('background').width, game.cache.getImage('background').height, 'background');
			background = game.add.sprite(0, 0, 'background');
			score = 0;
			placedPoles = 0;
			poleGroup = game.add.group();
			topScore = localStorage.getItem("topFlappyScore")==null?0:localStorage.getItem("topFlappyScore");
			scoreText = game.add.text(10,10,"-",{
				font:"bold 16px Arial"
			});
			updateScore();		
			cloudGroup = game.add.group();
			//cloud = game.add.tileSprite(0, 0, game.cache.getImage('cloud').width, , 'cloud');
			//cloud = game.add.tileSprite(0, 0, innerWidth, game.cache.getImage('cloud').height, 'cloud');
			//cloud = game.add.sprite(innerWidth/2, 25, 'cloud');
			
			//game.stage.backgroundColor = "#87CEEB";
			game.physics.startSystem(Phaser.Physics.ARCADE);
			ninja = game.add.sprite(80,0,"baddie");
			ninja.anchor.set(0.5);
			ninja.lastPole = 1;
			ninja.animations.add('up', [2, 3], 5, true);
			ninja.frame = 2;
			game.physics.arcade.enable(ninja);              
			ninja.body.gravity.y = ninjaGravity;
			game.input.onDown.add(prepareToJump, this);
			addPole(80);
			addCloud(game.width);
			fpsCounter = game.add.text(600, 10, game.time.fps,{ font:"bold 16px Arial" });
		},
		update:function(){
			game.physics.arcade.collide(ninja, poleGroup, checkLanding);
			if(ninja.y>game.height){
				die();
			}
			if(ninjaJumping && !ninjaFallingDown){
               //background.velocity.x = ninjaJumpPower;
			}
			else{
               //background.velocity.x = 0
			}
			//background.tilePosition.x -= 0.3;
			//cloud.x -= 1;
			//if (cloud.x < 0-cloud.width) cloud.x=innerWidth;
			fpsCounter.setText(game.time.fps);
		}
	}     
     game.state.add("Play",play);
     game.state.start("Play");
	function updateScore(){
		scoreText.text = "Score: "+score+"\nBest: "+topScore;	
	}     
	function prepareToJump(){
		if(ninja.body.velocity.y==0){
	          powerBar = game.add.sprite(ninja.x,ninja.y-50,"powerbar");
	          powerBar.width = 0;			  
	          powerTween = game.add.tween(powerBar).to({
			   width:100
			}, 1000, "Linear",true); 
	          game.input.onDown.remove(prepareToJump, this);
	          game.input.onUp.add(jump, this);
          }        	
	}     
     function jump(){
     	ninja.animations.play("up");
          ninjaJumpPower= -powerBar.width*3-100
          powerBar.destroy();
          game.tweens.removeAll();
          ninja.body.velocity.y = ninjaJumpPower*2;
		  
          ninjaJumping = true;
          powerTween.stop();
          game.input.onUp.remove(jump, this);
     }  
	function addNewCloud(){
		var maxCloudY=0;
		/*cloudGroup.forEach(function(item) {
			maxCloudY = Math.max(item.x,maxCloudY)
		});*/
		var nextCloudY = game.rnd.between(0,45);
		addCloud(nextCloudY);
	}
	function addCloud(cloudY){
		if(cloudY<game.width*2){
			var cloud = new Cloud(game, game.width, cloudY);
			game.add.existing(cloud);
			cloudGroup.add(cloud);
			var nextCloudY = game.rnd.between(0,45);
			//addCloud(nextCloudY);
		}
	}
     function addNewPoles(){
     	var maxPoleX = 0;
		poleGroup.forEach(function(item) {
			maxPoleX = Math.max(item.x,maxPoleX)			
		});
		var nextPolePosition = maxPoleX + game.rnd.between(minPoleGap,maxPoleGap);
		addPole(nextPolePosition);			
	}
	function addPole(poleX){
		if(poleX<game.width*2){
			placedPoles++;
			var pole = new Pole(game,poleX,game.rnd.between(250,380));
			//pole.backgroundColor  = "#878787";
			game.add.existing(pole);	       
	        pole.anchor.set(0.5,0);
			poleGroup.add(pole);
			var nextPolePosition = poleX + game.rnd.between(minPoleGap,maxPoleGap);
			addPole(nextPolePosition);
		}
	}	
	function die(){
		localStorage.setItem("topFlappyScore",Math.max(score,topScore));	
		game.state.start("Play");
	}
	function checkLanding(n,p){
		if(n.body.touching.down){
			var border = n.x-p.x;
			if(Math.abs(border)>50){
				n.body.velocity.x=border*2;
				n.body.velocity.y=-200;	
			}
			var poleDiff = p.poleNumber-n.lastPole;
			if(poleDiff>0){
				score+= Math.pow(2,poleDiff);
				updateScore();	
				n.lastPole= p.poleNumber;
			}
			if(ninjaJumping){
               	ninjaJumping = false;              
               	game.input.onDown.add(prepareToJump, this);
          	}
          	ninja.frame = 2;
		}
		else{
			ninjaFallingDown = true;
			poleGroup.forEach(function(item) {
				item.body.velocity.x = 0;			
			});
		}			
	}
	Pole = function (game, x, y) {
		Phaser.Sprite.call(this, game, x, y, "pole");
		//this.angle=30;
		game.physics.enable(this, Phaser.Physics.ARCADE);
          
          this.body.immovable = true;
          this.poleNumber = placedPoles;

	};
	Pole.prototype = Object.create(Phaser.Sprite.prototype);
	Pole.prototype.constructor = Pole;
	Pole.prototype.update = function() {
          if(ninjaJumping && !ninjaFallingDown){
               this.body.velocity.x = ninjaJumpPower;
          }
          else{
               this.body.velocity.x = 0
          }
		if(this.x<-this.width){
			this.destroy();
			addNewPoles();
		}
	}	
	Cloud = function (game, x, y) {
		if(y % 2 == 1) {		
		Phaser.Sprite.call(this, game, x, y, "cloud");}
		else {
		Phaser.Sprite.call(this, game, x, y, "cloud2");}
		//this.angle=30;
		//game.physics.enable(this, Phaser.Physics.ARCADE);
          
          //this.body.immovable = true;
          //this.poleNumber = placedPoles;

	};
	Cloud.prototype = Object.create(Phaser.Sprite.prototype);
	Cloud.prototype.constructor = Cloud;
	Cloud.prototype.update = function() {
          if(ninjaJumping && !ninjaFallingDown){
               this.x -= 3;
          }
          //else{
              // this.body.velocity.x = 0
         // }		 
		 this.x -= 5;
		if(this.x<-this.width){
			this.destroy();
			addNewCloud();
		}
	}	
}