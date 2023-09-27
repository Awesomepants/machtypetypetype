class menuScene extends Phaser.Scene{
    constructor ()
    {
        super({ key: 'menuScene' });
    }
    preload(){
        this.load.image("WPMSelector","button.png");
        this.load.image("fullscreen","full-screen-button.png");
    }
    init(){}
    create(){
        console.log("Main Menu Scene");
        let WPM = 60;
        const lowWPM = 10;
        const highWPM = 120;
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
            this.scene.start("gameplayScene", {wpm:WPM});
          });
    }
    update(){}
}