export function validateURLPart(value: string): boolean | string {
    return (
        !/\W/g.test(value) ||
        "May only contain letters, numbers and underscores"
    );
}

export function validateNonEmpty(value: string): boolean | string {
    return !!value || "May not be empty";
}
