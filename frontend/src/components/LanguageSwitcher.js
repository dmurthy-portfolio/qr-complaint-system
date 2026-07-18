import React from "react";
import { useLanguage } from "../context/LanguageContext";

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">🌐</span>

      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition ${
          language === "en"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        English
      </button>

      <button
        onClick={() => setLanguage("kn")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition ${
          language === "kn"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
}

export default LanguageSwitcher;