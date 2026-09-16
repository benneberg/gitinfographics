import { DocSection, SectionType } from '@gitinfographics/parser';
export declare const SEC_PATTERNS: Record<SectionType, RegExp>;
export declare function classifySec(s: DocSection | (Partial<DocSection> & {
    title: string;
})): SectionType;
//# sourceMappingURL=classifier.d.ts.map