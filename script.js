
var config = {
        type: Phaser.AUTO,
        backgroundColor: "#003399",
        width:1080,
        height: 600,
        scale: {
          mode: Phaser.Scale.FIT,
          parent: 'phaser-example',
          autoCenter: Phaser.Scale.CENTER_BOTH
      },
        //scene: [menuScene, gameplayScene],
        scene: [menuScene, gameplayScene]
      };

      var game = new Phaser.Game(config);