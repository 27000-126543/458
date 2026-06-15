import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./zh";
import en from "./en";

i18n.use(initReactI18next).init({
  resources: {
    zh: { common: zh },
    en: { common: en },
  },
  lng: "zh",
  fallbackLng: "zh",
  defaultNS: "common",
  ns: ["common"],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
