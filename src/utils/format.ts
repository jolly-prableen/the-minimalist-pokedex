export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const formatId = (id: number) => `#${id.toString().padStart(3, "0")}`;

export const formatName = (value: string) => capitalize(value.replace(/-/g, " "));
