export type ConditionGrade =
  | 'Mint'
  | 'Near Mint'
  | 'Excellent'
  | 'Very Good'
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'Unspecified'

export interface GradeInfo {
  value: ConditionGrade
  meaning: string
}

/** The antiques-trade condition ladder, each with a plain-language meaning. */
export const CONDITION_GRADES: GradeInfo[] = [
  { value: 'Mint', meaning: 'Unused and as-new — original finish, no wear of any kind.' },
  { value: 'Near Mint', meaning: 'Virtually as-new — only the faintest trace of age, no real wear.' },
  { value: 'Excellent', meaning: 'Minor surface marks consistent with age; displays beautifully.' },
  { value: 'Very Good', meaning: 'Light, honest wear throughout; all original and structurally sound.' },
  { value: 'Good', meaning: 'Noticeable wear but complete and presentable; all parts present.' },
  { value: 'Fair', meaning: 'Visible damage, repairs, or replaced parts; sold as-is.' },
  { value: 'Poor', meaning: 'Significant damage or loss — for restoration or parts.' },
  { value: 'Unspecified', meaning: 'Not graded — see the notes and photos.' },
]

export function gradeMeaning(grade: ConditionGrade): string {
  return CONDITION_GRADES.find((g) => g.value === grade)?.meaning ?? ''
}
