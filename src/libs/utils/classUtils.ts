export class ClassUtils {
    static bindMethods<T>(instance: T) {
        const proto = Object.getPrototypeOf(instance);
        Object.getOwnPropertyNames(proto).forEach((method) => {
            if (method !== "constructor" && typeof (instance as any)[method] === "function") {
                (instance as any)[method] = (instance as any)[method].bind(instance);
            }
        });
    }
}
