import TextRecognition from '@react-native-ml-kit/text-recognition';

/** Runs on-device OCR (Google ML Kit) on a local image — the image never leaves the device. */
export async function recognizeTextFromImage(imageUri: string): Promise<string> {
  const result = await TextRecognition.recognize(imageUri);
  return result.text;
}
