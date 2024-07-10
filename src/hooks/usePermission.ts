import { PermissionsAndroid, Platform } from "react-native";

const usePermission = () => {
    const checkPermissions = async () => {
        if (Number(Platform.Version) >= 33) {
            const permissions = [
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            ];
            const statuses = await Promise.all(permissions.map(PermissionsAndroid.check));
            return statuses.every(status => status);
        } else {
            return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        }
    };

    const requestPermissions = async () => {
        if (Number(Platform.Version) >= 33) {
            const permissions = [
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            ];
            const statuses = await PermissionsAndroid.requestMultiple(permissions);
            return permissions.every(permission => statuses[permission] === PermissionsAndroid.RESULTS.GRANTED);
        } else {
            const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
            return status === PermissionsAndroid.RESULTS.GRANTED;
        }
    };

    const hasAndroidPermission = async () => {
        const hasPermission = await checkPermissions();
        if (hasPermission) return true;
        return await requestPermissions();
    };

    return {
        hasAndroidPermission
    };
};

export default usePermission;
