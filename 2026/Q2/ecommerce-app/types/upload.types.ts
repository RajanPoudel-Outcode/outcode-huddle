/**
 * Upload Types
 */

/** A locally-picked image ready to append to a multipart FormData request. */
export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}
