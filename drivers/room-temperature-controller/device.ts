import Homey, { Device } from 'homey';
import { AHC9000Driver } from './driver';
import { DeviceData, propertyToCapabilityMap } from './api';

export class AHC9000Device extends Homey.Device {
  deviceData!: DeviceData;

  setCapabilityFromPropertyAndValue(property:string, value:number) {
    this.setCapabilityValue(propertyToCapabilityMap[property], value);
  }

  async onInit() {
    await (this.driver as AHC9000Driver).driverReady;

    this.deviceData = this.getData();
    const initialData = (this.driver as AHC9000Driver).devices[this.deviceData.deviceId][this.deviceData.floorId] as any;


    // Instantiate with initial data
    
    setTimeout(_=> {
      Object.keys(initialData).forEach(key => {
        this.setCapabilityFromPropertyAndValue(key, initialData[key])
      });
    },500);

    // send back new target_temperature to driver to publish
    this.registerCapabilityListener('target_temperature', async (value, opts) => {
      (this.driver as AHC9000Driver).postMessage(this.deviceData, 'target_set', value)
    });
  }

}

//https://apps.developer.homey.app/advanced/custom-views/custom-pairing-views
module.exports = AHC9000Device;
