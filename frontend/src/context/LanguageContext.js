import { createContext, useContext, useState } from "react";

import en from "../locales/en";
import kn from "../locales/kn";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {

  const [language, setLanguage] = useState("en");

  const translations = language === "en" ? en : kn;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}