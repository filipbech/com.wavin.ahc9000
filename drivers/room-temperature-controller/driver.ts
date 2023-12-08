import Homey from 'homey';
import mqtt from 'mqtt'; 
import { device, deviceMap, paramsToPersistAndNotifyOn, topicToParams, DeviceData } from './api';
import { AHC9000Device } from './device';

export class AHC9000Driver extends Homey.Driver {
  client!: mqtt.MqttClient;
  devices: deviceMap = {};

  handleMessage(topic:string, message: Buffer, payload: mqtt.IPublishPacket) {
    const params = topicToParams(topic);
    if(paramsToPersistAndNotifyOn.includes(params.property)) {
      if(!this.devices[params.deviceId]) {
        this.devices[params.deviceId] = {};
      }
      if(!this.devices[params.deviceId][params.floorId]) {
        this.devices[params.deviceId][params.floorId] = {} as device;
      }
      const value = +message.toString();
      this.devices[params.deviceId][params.floorId][params.property] = value;
    
      this.getDevices().forEach((deviceClass) => { 
        const device = deviceClass as AHC9000Device;
        if(device.deviceData?.deviceId === params.deviceId && device.deviceData?.floorId === params.floorId) {
          device.setCapabilityFromPropertyAndValue(params.property, value);
        }
      });
    }
  }

  private driverReadyResolver:any;
  driverReady = new Promise(res => {
    this.driverReadyResolver = res;
  })

  postMessage(deviceData: DeviceData, topic:string, value:string) {
    this.client.publish(`heat/${deviceData.deviceId}/${deviceData.floorId}/${topic}`, value.toString());
  }

  async onInit() {
    /*
    //can we handle changing settings without requiring a restard
    this.homey.settings.on('set', () => {
      console.log('settings changed', arguments);
    });
    */

    this.client = mqtt.connect(this.homey.settings.get('server'), {
      username: this.homey.settings.get('username'),
      password: this.homey.settings.get('password')
    });

    this.client.on("connect", () => {
      this.client.subscribe("heat/#", (err) => {
        this.client.on("message", this.handleMessage.bind(this));
        setTimeout(_=> {
          this.driverReadyResolver();
        }, 500);
      });
    });
  }

  async onPairListDevices() {
    const flatDeviceList:any[] = [];
    Object.keys(this.devices).forEach((deviceId,deviceIndex)=> {
      Object.keys(this.devices[deviceId]).forEach(floorId => {
        flatDeviceList.push({
          name: `Zone ${+floorId+1} ${+deviceIndex ? `(Unit ${+deviceIndex+1})`: ''}`, //+1 because its 0-indexed, and the device-lights are not
          data: {
            deviceId,
            floorId
          }
        })
      });
    });

    return flatDeviceList;
  }

}

module.exports = AHC9000Driver;
