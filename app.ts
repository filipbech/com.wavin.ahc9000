import Homey from 'homey';

class Ahc9000 extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('Ahc9000 has been initialized');

    const flowCard = this.homey.flow.getActionCard('greet');
    flowCard.registerRunListener(async (response) => {
      this.log(`hello ${response.context}`);
    });


  }


  
} 

module.exports = Ahc9000;
