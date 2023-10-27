class gameplayScene extends Phaser.Scene{
    constructor(){
        super({
           key:"gameplayScene"
        });
    }

  init(data){
    console.log("init", data.wpm);
    this.wpm = data.wpm
  }
  preload(){
    
    this.load.audio("wrong-answer","wrong-answer.wav");
    this.load.audio("bgm","POL-mission-cobra-long.mp3");
    this.load.image("racetrack","racetrack.jpg");
    this.load.image("superFast","SuperFast.png")
  }
  modal(modalText, miliseconds, andThen){
    //is this creating a new graphics object every time this function is called?!?!?! We need to change this at some point
    const modalBackgrounds = this.add.graphics();
    modalBackgrounds.fillStyle(0x2d2d2d, 0.5);
    const modalTextObject = this.add.text(
      0,
      (config.height / 2) - 15,
      modalText,
      {fontSize:"30px",color:"white",fontFamily:"Trebuchet MS"}
    );
    modalTextObject.x = (config.width/2) - (modalTextObject.width/2);
    this.tweens.addCounter({

      from: 0,
      to: 1,
      duration: 500,
      onUpdate: (tween) => {
        let t = tween.getValue();
        modalBackgrounds.clear();
        
        
        modalBackgrounds.fillRect(((config.width/2) - (modalTextObject.width/2) - 30), ((config.height/2)-(30 * t)), (modalTextObject.width + 60), 60*t);
      }
    })
    
    this.timedEvent = this.time.delayedCall(
      miliseconds,
      () => {
        modalTextObject.destroy();
        modalBackgrounds.clear();
        if(andThen){
          andThen();
        }
        
      },
      [],
      this
    );
  }
  
  create() {
    //put these somewhere else?
    const mistakeSound = this.sound.add("wrong-answer");
    this.bgm = this.sound.add("bgm");
    this.bg = this.add.image(config.width/2, config.height/2, "racetrack");
    this.superFast = this.add.image(config.width/2, 150, "superFast");
    this.superFastScale = 0.25;
    this.superFast.scale = this.superFastScale;
    this.superFast.setAlpha(0);
    this.minbgscale = 0.6;
    this.bg.scale = this.minbgscale;
    this.WPMs = [];
    this.accuracies = [];
    this.errorIcon = this.add.image(config.width/2,config.height/2,"redX");
    this.errorIcon.scaleX = 0.1;
    this.errorIcon.scaleY = 0.1;
    this.errorIcon.setAlpha(0);
    
    this.finishedEmitter = new Phaser.Events.EventEmitter();
           this.gameEnded = false;
          
        const mBackgrounds = this.add.graphics();
        mBackgrounds.fillStyle(0x2d2d2d, 0.5);
        const marquee = (
          typingText,
          originX,
          originY,
          speed = { wpm: 50 },
          fontsize = 32
        ) => {
          let keysPressed = 0;
          let accuratekeysPressed = 0;
          let spawningTime;  //we keep track of this to help determine the WPM the user is typing at
          const amountOfWords = typingText.split(" ").length;
          if (this.currentTextObject) {
            console.log(
              "We tried to create a marquee when one already existed. This overrode the existing one and is not good game design. If I want to do something like this I will need to change the game from the ground up."
            );
          }
          this.tweens.addCounter({
            from: 0,
            to: fontsize*1.5,
            duration: 500,
            onUpdate: (tween) => {
              mBackgrounds.clear();
              
              
              mBackgrounds.fillRect(originX, originY - fontsize/4, config.width, tween.getValue());
            }
          })
          var typingTextDisplay = this.add.text(
            originX + config.width,
            originY,
            "|" + typingText,
            { fontSize: fontsize.toString() + "px", fill: "white" }
          );
          if (speed.wpm) {
            speed.time = (amountOfWords / speed.wpm) * 60000 /*per minute*/;

            //console.log("words: " + typingText.split(' ').length + "wpm: " + speed.wpm + " time: " +speed.time + " miliseconds")
          }
          if (speed.time) {
            //60 frames in a second. When this function is called, the "time" variable is in miliseconds, which is standard. Convert it to game frames
            speed.time = (speed.time / 1000) * 60; //this number now represents the amount of game frames that this marquee should take to scroll from left to right
            speed.speed =
              (typingTextDisplay.width +
                config.width) /*The total pixels that this marquee will traverse*/ /
              speed.time;
            //console.log("time: " + speed.time + " gameframes, speed: " + speed.speed);
          }
          typingTextDisplay.speed = speed.speed;
          this.currentTextObject = typingTextDisplay;
          //console.log(this.currentTextObject);
          var invisibleLetter = this.add.text(0, 0, "", {
            fontSize: fontsize.toString() + "px",
          });
          invisibleLetter.visible = false;
          const finishingHandler = () => {
            /* Handling what happens when we finish typing the marquee*/

            const finishedTime = new Date();
            mBackgrounds.clear();
            console.log("time to finish: " + finishedTime - spawningTime);
            const finalWPM =
              amountOfWords / ((finishedTime - spawningTime) / 60000);
            console.log("words per minute: " + finalWPM);
            const accuracy = accuratekeysPressed/keysPressed;
            invisibleLetter.destroy();
            typingTextDisplay.destroy();
            this.currentTextObject = false;
            this.input.keyboard.removeListener("keydown", keyPressHandler);
            //emit an event to signify that the user has succeeded in typing the string
            this.finishedEmitter.emit("Finished", finalWPM, accuracy);
          }
          this.finishedEmitter.on("loss",finishingHandler);
          const keyPressHandler = (keyPress) => {
            if(!spawningTime){
                spawningTime = new Date();
                //moved this here instead of when the marquee initializes. Hopefully this gives a more accurate WPM reading for the users
            }
            if (keyPress.key === typingTextDisplay.text[1]) {
              accuratekeysPressed++;
              keysPressed++;
              //console.log("Key Press Listener is listening");
              typingTextDisplay.setText(
                "|" + typingTextDisplay.text.substring(2)
              );
              invisibleLetter.setText(typingTextDisplay.text[1]);
              typingTextDisplay.x += invisibleLetter.width;
              if (typingTextDisplay.x > config.width - fontsize * 2){
                //when the cursor is too close to the right side of the screen, it is messing up the user's WPM so we will bump the text to the left a bit
                console.log("moving fast...");
                typingTextDisplay.x -= fontsize*5;
              }
              if (typingTextDisplay.text.length === 1) {
                finishingHandler();
              }
            } else if (keyPress.key !== "Shift") {
              keysPressed++;
              //emit an event to signify that the user has made a mistake
              this.finishedEmitter.emit("Mistake");
            }
          };
          this.input.keyboard.on("keydown", keyPressHandler);
        };
        const generateString = (wordsAmount) => {
          let result = "";

          for (let pete = 0; pete < wordsAmount; pete++) {
            result = result.concat(
              " " + words[Math.floor(Math.random() * words.length)].toLowerCase()
            );
          }
          return result.substring(1);
        };
       
        const infiniteMode = (initialWPM) => {
          let stringLength = 10;
          let string = generateString(stringLength);
          let incrementalWPM = initialWPM;
          const again = () => {
            this.superFast.setAlpha(0);
            incrementalWPM += 3;
            stringLength++;
            string = generateString(stringLength);
            marquee(
              string,
              0,
              Phaser.Math.RND.integerInRange(30, config.height - 30),
              { wpm: incrementalWPM }
            );
          };
          marquee(
            string,
            0,
            Phaser.Math.RND.integerInRange(30, config.height - 30),
            { wpm: incrementalWPM }
          );
          this.finishedEmitter.on("Mistake", ()=>{
            /* Audio Visual Cue to indicate the mistake */
            this.errorIcon.setAlpha(1);
            mistakeSound.play();
            console.log("You made a mistake >:-(");
            this.currentTextObject.x -= 15;
          })
          this.finishedEmitter.on("Finished", (WPM, accuracy) => {
            this.bg.scale = this.minbgscale;
            this.bg.x = config.width/2;
            this.bg.y = config.height/2;
            this.superFast.setAlpha(1);
            this.tweens.addCounter({
              from: 2,
              to: this.superFastScale,
              duration: 500,
              onUpdate: (tween) => {
                console.log(tween);
                this.superFast.scale = tween.getValue();
              }
            })
            if(!this.gameEnded){
               this.WPMs.push(WPM);
                this.accuracies.push(accuracy); 
              this.modal("WPM: " + Math.floor(WPM) + " Accuracy: " + Math.floor(accuracy*100) + "%", 3000, again);
              //this.bg.scale = 1;
            }
            });
        };
        const startGame = () => {
          console.log("startGame");
          this.modal("Get ready!",3000,()=>{
            infiniteMode(this.wpm * 0.9);
          })
        }
        this.bgm.loop = true;

          this.bgm.play();
        
        
        startGame();

      }
      
      update(time, delta) {
        
        let f = 1000 / 60 / delta;
        if (this.errorIcon.alpha > 0){
          this.errorIcon.alpha -= 0.05;
        }
        
        if (this.currentTextObject) {
          if(this.bg.scale < 1){
            this.bg.scale += 0.0005;
            this.bg.x += (Math.random() - 0.5) * 4;
            this.bg.y += (Math.random() - 0.5) * 4;
          }
          
          this.currentTextObject.x -= f * this.currentTextObject.speed;
          if (this.currentTextObject.x < -100 && !this.gameEnded) {
            this.gameEnded = true;
            this.finishedEmitter.emit("loss");
            console.log("running this code again...");
            const average = (array)=>{
                var total = 0;
                for(var i = 0; i < array.length; i++) {
                    total += array[i];
                }
                return total / array.length;
            }
            const averageWPM = Math.floor(average(this.WPMs));
            const averageAccuracy = Math.floor(average(this.accuracies) * 100);
            let message = "";
            if(averageWPM){
                message = `Game over. Average WPM: ${averageWPM} Average accuracy: ${averageAccuracy}%`;
            } else {
                message = "It seems like this was too hard for you! Try a slower speed?"
            }
            this.modal(message,5000,()=>{
                this.bgm.destroy();
                this.scene.start("menuScene",{wpm:this.wpm});
            });
          }
        }
      }

}
