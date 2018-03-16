import { SnotifyType } from '../types';
/**
 * Transform arguments to Snotify object
 * @param target
 * @param {SnotifyType} propertyKey
 * @param {PropertyDescriptor} descriptor
 * @returns {Snotify}
 * @constructor
 */
export declare function TransformArgument(target: any, propertyKey: SnotifyType, descriptor: PropertyDescriptor): {
    value: (...args: any[]) => any;
};
