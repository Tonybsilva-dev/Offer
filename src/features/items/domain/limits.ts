export const ITEM_LIMITS = {
  titleMax: 40,
  fullNameMax: 120,
  brandMax: 60,
  descriptionMax: 5000,
  extraImagesMax: 10,
  tagsMax: 15,
  tagMax: 30,
  specsMax: 60,
  detailsMax: 20,
} as const;

export const IMAGE_NAME_PATTERN = /^[A-Za-z0-9_-]{8,40}\.(jpg|png|webp|avif)$/;
