import { createError, type EventHandlerRequest, H3Event, readBody } from "h3";
import { merge } from "lodash-es";
import { z, ZodError } from "zod";

export function ensureURLParameter(
    event: H3Event<EventHandlerRequest>,
    urlParameter: string,
): string {
    if (event.context.params?.[urlParameter] == null) {
        throw createError({ statusCode: 400 });
    }
    return event.context.params[urlParameter];
}

export async function validateBody<T extends z.ZodTypeAny>(
    event: H3Event<EventHandlerRequest>,
    schema: T,
): Promise<z.infer<T>> {
    const body = (await readBody<unknown>(event)) as unknown;
    try {
        const data = (await schema.parseAsync(body)) as z.infer<T>;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data;
    } catch (e) {
        if (e instanceof ZodError) {
            throw createError({
                statusCode: 400,
                statusMessage: "Validation error",
                data: buildErrorsMap(e),
            });
        }
    }
}

function buildErrorsMap(e: ZodError): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const issue of e.issues) {
        const joinedPath = issue.path.join(".");
        result[joinedPath] ??= [];

        switch (issue.code) {
            case "invalid_type":
                result[joinedPath].push(
                    `Invalid type, expected ${issue.expected}, received ${issue.received}`,
                );
                break;
            case "unrecognized_keys":
                for (const key of issue.keys) {
                    result[joinedPath].push(`Unrecognized key: ${key}`);
                }
                break;
            case "invalid_union":
                for (const union of issue.unionErrors) {
                    merge(result, buildErrorsMap(union));
                }
                break;
            case "invalid_enum_value":
                result[joinedPath].push(
                    `Invalid value, expected one of ${JSON.stringify(issue.options)}`,
                );
                break;
            case "invalid_date":
                result[joinedPath].push(`Invalid date`);
                break;
            case "invalid_string":
                result[joinedPath].push(
                    `Invalid string, expected ${JSON.stringify(issue.validation)}`,
                );
                break;
            case "too_small":
                result[joinedPath].push(
                    `Too small, expected at least ${issue.minimum}`,
                );
                break;
            case "too_big":
                result[joinedPath].push(
                    `Too big, expected at most ${issue.maximum}`,
                );
                break;
            case "not_multiple_of":
                result[joinedPath].push(
                    `Expected at multiple of ${issue.multipleOf}`,
                );
                break;
            default:
                result[joinedPath].push(`Unknown valiation error`);
                break;
        }
    }

    return result;
}
