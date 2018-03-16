import { SnotifyType } from '../types';
/**
 * Defines toast style depending on method name
 * @param target
 * @param {SnotifyType} propertyKey
 * @param {PropertyDescriptor} descriptor
 * @returns {{value: ((...args: any[]) => any)}}
 * @constructor
 */
export declare function SetToastType(target: any, propertyKey: SnotifyType, descriptor: PropertyDescriptor): {
    value: (...args: any[]) => any;
};
