class menuScene extends Phaser.Scene{
    constructor ()
    {
        super({ key: 'menuScene' });
    }
    preload(){
        this.load.image("WPMSelector","button.png");
        this.load.image("fullscreen","full-screen-button.png");
        this.load.image("background","menuImage.jpg");
        this.load.audio("MenuBgm","POL-raw-power-long.wav");
        this.load.image("paintSplatter","paintsplatter.png");
    }
    init(data){
       if(data.wpm){
        this.wpm = data.wpm;
       }
    }
    create(){
        console.log("Main Menu Scene");
        let WPM;
        if(this.wpm){
             WPM = this.wpm;
        } else {
            WPM = 60;
        }
        this.background = this.add.image(0,100,"background");
        this.backgroundScrollingSpeedX = (Math.random() - 0.5) * 20;//Math.floor(Math.random - 0.5) * 10;
        //console.log();
        const lowWPM = 10;
        const highWPM = 120;
        this.bgm = this.sound.add("MenuBgm");
        this.bgm.loop = true;
        this.bgm.play();
        const splatter1 = this.add.image(540,70,"paintSplatter");
        splatter1.scale = 0.7;
        const title = this.add.text(350,20,"MACH TYPE TYPE TYPE", {fontFamily:"Calibri", fontSize:"40px"});
        const WPMSelector = this.add.sprite(500,200,'WPMSelector');
        WPMSelector.setInteractive({draggable:true});
        const wpmDisplay = this.add.text(350,70,`WPM: ${WPM} (Drag to adjust)`,{fontFamily:"Calibri", fontSize:"30px"} );
        this.input.on("drag",(pointer,gameObject,dragX) => {
            const padding = 300;
            dragX=Phaser.Math.Clamp(dragX, padding, config.width-padding);
            gameObject.x = dragX;
            WPM = Math.floor((highWPM-lowWPM) * (((dragX-padding))/(config.width-padding*2)) + lowWPM);
            console.log(WPM);
            wpmDisplay.text = `WPM: ${WPM} (Drag to adjust)`;
            wpmDisplay.updateText();
        })
        const button = this.add.image(config.width - 50, 16, 'fullscreen', 0).setOrigin(1, 0).setInteractive();
        button.setScale(0.2);

        button.on('pointerup', function ()
        {

            if (this.scale.isFullscreen)
            {
                button.setFrame(0);

                this.scale.stopFullscreen();
            }
            else
            {
                button.setFrame(1);

                this.scale.startFullscreen();
            }

        }, this);
        const startingText = this.add.text(
            350,
            300,
            "Press any key to begin!",
            {fontSize:"30px",color:"white",fontFamily:"Trebuchet MS"}
          );
          this.input.keyboard.on('keydown',()=>{
            console.log("uwu");
            this.bgm.destroy();
            this.scene.start("gameplayScene", {wpm:WPM});
          });
    }
    update(){
        this.background.x += this.backgroundScrollingSpeedX;
        //console.log(this.backgroundScrollingSpeedX);
        if(this.background.x < 0|| this.background.x > config.width || Math.abs(this.backgroundScrollingSpeedX) < 4){
            this.background.x = Math.random() * config.width;
            this.backgroundScrollingSpeedX = (Math.random() - 0.5) * 20;
            console.log(this.backgroundScrollingSpeedX);

        }
        if(!(this.background.y < 200 || this.background.y > 400)){
            this.background.y += Math.floor((Math.random() - 0.5) * 5);
        } else {
            this.background.y = 300;
        }
    }
}