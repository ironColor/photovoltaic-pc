declare namespace Land {
  type Item = {
    landId: number;
    landName: string;
    landType: number;
    landPoints: {
      serial: number;
      alt: number;
      lon: number;
      lat: number;
    };
    regionAddress: string;
    updateTime: string;
  };
}
