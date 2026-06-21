/**
 * useImagePicker
 * Thin wrapper over expo-image-picker that returns a multipart-ready PickedImage.
 * Requests gallery permission, opens a square-crop picker, and normalizes the
 * asset into { uri, name, type }. Returns null if cancelled or denied.
 *
 * Backend only accepts png/jpg/jpeg up to 2MB, so we compress (quality 0.7).
 */

import type { PickedImage } from "@/types/upload.types";
import { logger } from "@/utils/logger";
import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";

export interface UseImagePickerResult {
  /** Opens the gallery. Returns the picked image, or null if cancelled/denied. */
  pickImage: () => Promise<PickedImage | null>;
}

export function useImagePicker(): UseImagePickerResult {
  const pickImage = useCallback(async (): Promise<PickedImage | null> => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      logger.warn("Media library permission denied");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    const asset = result.assets[0];
    const fallbackName = `image-${asset.fileName ?? asset.uri.split("/").pop() ?? "upload"}`;
    const name = asset.fileName ?? fallbackName;
    const extension = name.split(".").pop()?.toLowerCase();
    const type =
      asset.mimeType ?? (extension === "png" ? "image/png" : "image/jpeg");

    return { uri: asset.uri, name, type };
  }, []);

  return { pickImage };
}
