import * as langExt from "@/data/language-extensions.json";

type LanguagesProps = {
  name: string;
  type: string;
  extensions: string[];
};

const extensionToLangName = (extension: string) => {
  const languages = Array.from(langExt) as LanguagesProps[];
  const lang = languages.find((lang) => lang.extensions && lang.extensions.includes(`.${extension}`));

  return lang ? (lang.name).toLocaleLowerCase() : "plaintext";
};

export default extensionToLangName;
