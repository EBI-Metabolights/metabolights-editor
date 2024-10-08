export class TemplateRowCollection {
    nmr: Record<string, any>;
    lcms: Record<string, any>;
    gcms: Record<string, any>;
    dims: Record<string, any>;
  
    constructor(
      nmr: Record<string, any> = {},
      lcms: Record<string, any> = {},
      gcms: Record<string, any> = {},
      dims: Record<string, any> = {}
    ) {
      this.nmr = nmr;
      this.lcms = lcms;
      this.gcms = gcms;
      this.dims = dims;
    }
  }