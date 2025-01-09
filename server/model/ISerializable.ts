import { isObject } from "lodash-es";
import consola from "consola";

const logger = consola.withTag("Serializer");

export interface ISerializable {
    serialized: boolean | undefined;
}

export function ensureSerialized(body: unknown, route: string): unknown {
    if (!isObject(body)) {
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
        body[key] = ensureSerialized(body[key], route);
    }
    return body;
}
