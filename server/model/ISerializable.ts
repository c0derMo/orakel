import { isError, isObject } from "lodash-es";
import consola from "consola";

const logger = consola.withTag("Serializer");

export interface ISerializable {
    serialized: boolean | undefined;
}

export function ensureSerialized(body: unknown, route: string): unknown {
    if (!isObject(body) || isError(body)) {
        return body;
    }

    const keys = Object.getOwnPropertyNames(body);

    if (keys.includes("serialized")) {
        const serializable = body as ISerializable;

        if (!serializable.serialized) {
            logger.warn(
                "Object %o is being sent in route %s without being serialized first!",
                body,
                route,
            );
        }

        delete serializable.serialized;
    }

    for (const key of keys) {
        if (key === "serialized") {
            continue;
        }
        const descriptor = Object.getOwnPropertyDescriptor(body, key);
        if (!descriptor?.writable) {
            continue;
        }
        (body as Record<string, unknown>)[key] = ensureSerialized(
            (body as Record<string, unknown>)[key],
            route,
        );
    }
    return body;
}
