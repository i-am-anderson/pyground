declare module 'file-icons-js' {
  interface FileIcons {
    getClass: (name: string) => string | null;
    getClassSync: (name: string) => string | null;
    getClassWithColor: (name: string) => string | null;
  }

  const icons: FileIcons;
  export = icons;
}