/**
 * FormData helpers for multipart uploads.
 */

import type { PickedImage } from "@/types/upload.types";

/**
 * Append a picked image to a FormData under `field`. No-op if image is missing.
 * React Native's FormData accepts a { uri, name, type } file descriptor.
 */
export function appendImage(
  form: FormData,
  field: string,
  image?: PickedImage | null,
): void {
  if (!image) return;
  form.append(field, {
    uri: image.uri,
    name: image.name,
    type: image.type,
  } as unknown as Blob);
}
