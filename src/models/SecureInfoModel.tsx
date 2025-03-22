class SecureInfoModel {
    private _iv!: string;
  
    public get iv(): string {
      return this._iv;
    }
  
    public set iv(value: string) {
      this._iv = value;
    }
  }
  
  export const secureInfoModel = new SecureInfoModel();
  