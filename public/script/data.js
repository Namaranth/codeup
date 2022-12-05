export class errorData {

  constructor(source) {
    this.source = source;
  }

  systemPermission = () => {
    var systemError = ["<windows.h>", "<filesystem>", "<fstream>", "vim", "system", "fopen", "fclose", "fgetc", "fputc", "fgets", "fputs", "fscanf", "fprintf", "fread", "fwrite", "fseek", 'ftell', "rewind", "feof", "ferror", "fflush", "sleep", "malloc", "remove", "rename"]
    for(var i = 0; i < systemError.length; i++) {
      if(source.includes(systemError[i])) {
        return true;
      };
    }
  }
}

