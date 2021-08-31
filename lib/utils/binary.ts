export const isBinary = (fileBuffer: Buffer): boolean => {
    // The spec defines a binary file as anything containing a null byte
    if (fileBuffer.includes(0)) return true;
    return false;
};