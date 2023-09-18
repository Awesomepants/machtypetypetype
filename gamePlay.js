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
  modal(modalText, miliseconds, andThen){
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
    const words = ["mississippi","nor", "double", "seat", "arrive", "master", "track", "parent", "shore", "division", "sheet", "substance", "favor", "connect", "post", "spend", "chord", "fat", "glad", "original", "share", "station", "dad", "bread", "charge", "proper", "bar", "offer", "segment", "slave", "duck", "instant", "market", "degree", "populate", "chick", "dear", "enemy", "reply", "drink", "occur", "support", "speech", "nature", "range", "steam", "motion", "path", "liquid", "log", "meant", "quotient", "teeth", "shell", "neck", "oxygen", "sugar", "death", "pretty", "skill", "women", "season", "solution", "magnet", "silver", "thank", "branch", "match", "suffix", "especially", "fig", "afraid", "huge", "sister", "steel", "discuss", "forward", "similar", "guide", "experience", "score", "apple", "bought", "led", "pitch", "coat", "mass", "card", "band", "rope", "slip", "win", "dream", "evening", "condition", "feed", "tool", "total", "basic", "smell", "valley"];
    const targetWPM = 9;
    this.finishedEmitter = new Phaser.Events.EventEmitter();
           this.gameEnded = false;
          
        const mBackgrounds = this.add.graphics();
        mBackgrounds.fillStyle(0x2d2d2d, 0.5);
       // const finishedEmitter = 
        
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
          //console.log("Marquee was created: " + typingText);
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
          //const rect = new Phaser.Geom.Rectangle(originX, originY - fontsize/4, config.width, fontsize*1.5);
          
          //mBackgrounds.fillRectShape(rect);
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
            //rect.destroy();
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
        //hard coded sample level
        const timeline = this.add.timeline([
          {
            at: 1000,
            run: () => {
              marquee("The quick brown fox jumps over the lazy dog", 0, 30);
            },
          },
          {
            from: 9000,
            run: () => {
              marquee("My name is Nachooooooooooooooooooooo", 0, 300);
            },
          },
          {
            from: 9000,
            run: () => {
              marquee(
                "Mississippi mississippi mississippi mississippi",
                0,
                500
              );
            },
          },
        ]);
        const generateString = (wordsAmount) => {
          let result = "";

          for (let pete = 0; pete < wordsAmount; pete++) {
            result = result.concat(
              " " + words[Math.floor(Math.random() * words.length)]
            );
          }
          return result.substring(1);
        };
       
        const infiniteMode = (initialWPM) => {
          let stringLength = 10;
          let string = generateString(stringLength);
          let incrementalWPM = initialWPM;
          const again = () => {
            incrementalWPM += 1;
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
            //console.log("finishedEmitter activated")
            this.currentTextObject.x -= 15;
          })
          this.finishedEmitter.on("Finished", (WPM, accuracy) => {
            if(!this.gameEnded){
              this.modal("WPM: " + Math.floor(WPM) + " Accuracy: " + Math.floor(accuracy*100) + "%", 3000, again);
          
            }
            });
        };
        
        const startGame = () => {
          console.log("startGame");
          this.modal("Get ready!",3000,()=>{
            infiniteMode(this.wpm * 0.9);
          })
        }
        startGame();

      }
      
      update(time, delta) {
        
        let f = 1000 / 60 / delta;
        if (this.currentTextObject) {
          this.currentTextObject.x -= f * this.currentTextObject.speed;
          if (this.currentTextObject.x < -100 && !this.gameEnded) {
            this.gameEnded = true;
            this.finishedEmitter.emit("loss");
            console.log("running this code again...");
            this.modal("Wowie wowie good job Joe Schmoe",5000,()=>{
                this.scene.start("menuScene")
            });
          }
        }
      }

}
