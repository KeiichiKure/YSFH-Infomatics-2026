import { Section } from './LessonParts';
import { InformationChoiceLab } from './InformationChoiceLab';
import { DataLab } from './DataLab';
export function MediaImpactLab({ basePath }: { basePath: string }) {
  return <Section number={4} question="広がりの速さと、情報の確かさは別。出典を確かめ、実際の記録を判断に活かそう。">
    <InformationChoiceLab />
    <DataLab basePath={basePath} />
  </Section>;
}
