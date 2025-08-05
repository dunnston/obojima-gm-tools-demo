import { useTranslation } from 'react-i18next';

export function useItemTranslation() {
  const { t, i18n } = useTranslation();

  const translatePotionName = (name: string): string => {
    if (i18n.language === 'fr') {
      const translatedName = t(`potions.names.${name}`, { defaultValue: name });
      return translatedName;
    }
    return name;
  };

  const translateIngredientName = (name: string): string => {
    if (i18n.language === 'fr') {
      const translatedName = t(`ingredients.names.${name}`, { defaultValue: name });
      return translatedName;
    }
    return name;
  };

  return {
    translatePotionName,
    translateIngredientName,
  };
}