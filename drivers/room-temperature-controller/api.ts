export interface deviceMap {
  [deviceId: string]: {
    [floorId: string]: device
  }
}
export interface DeviceData {
  floorId:string;
  deviceId:string;
}
export const paramsToPersistAndNotifyOn = ['current','target','battery'];

export interface device {
  current: number;
  target: number;
  // mode?: string;
  // output?: string;
  battery: number;
}

export interface TopicParams {
  prefix:string;
  deviceId:string;
  floorId:string;
  property:keyof device; 
}

export const propertyToCapabilityMap:{[key:string]:string} = {
  current:'measure_temperature',
  target:'target_temperature',
  battery:'measure_battery'
}

export function topicToParams(topic:string):TopicParams {
    const parts = topic.split('/');
    return {
      prefix:parts[0],
      deviceId:parts[1],
      floorId:parts[2],
      property:parts[3] as keyof device
    }
  }