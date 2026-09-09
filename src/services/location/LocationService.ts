import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation, { type GeoPosition } from 'react-native-geolocation-service';

class LocationService {
  async requestWhenInUsePermission() {
    if (Platform.OS === 'ios') return (await Geolocation.requestAuthorization('whenInUse')) === 'granted';
    if (Platform.OS === 'android') {
      return (await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)) === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  }

  async getCurrentPosition(): Promise<GeoPosition> {
    if (!(await this.requestWhenInUsePermission())) throw new Error('Location permission was not granted.');
    return new Promise((resolve, reject) => Geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }));
  }
}

export const locationService = new LocationService();
