declare module "n3" {
  export interface Term {
    termType: string;
    value: string;
    language?: string;
    datatype?: Term;
  }

  export interface Quad {
    subject: Term;
    predicate: Term;
    object: Term;
    graph: Term;
  }

  export const DataFactory: {
    namedNode(value: string): Term;
    literal(value: string, languageOrDatatype?: string | Term): Term;
    quad(subject: Term, predicate: Term, object: Term, graph?: Term): Quad;
    defaultGraph(): Term;
  };

  export class Writer {
    constructor(options?: { prefixes?: Record<string, string>; baseIRI?: string });
    addQuad(quad: Quad): void;
    addQuad(subject: Term, predicate: Term, object: Term, graph?: Term): void;
    end(callback: (error: Error | null, result: string) => void): void;
  }
}
