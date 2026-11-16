import type { XpTrackerPreview } from '../types.ts'

// VOL. IV. An interactive preview of the check-in loop with sample data:
// a survey goes to the TabNet classifier, the predicted lifestyle class earns
// XP, and a daily check-in extends the streak.
export const realWorldXpPreview: XpTrackerPreview = {
  notice: 'Interactive preview · sample data',
  hint: 'Pick a survey, then log the check-in',
  xpPerLevel: 500,
  start: { level: 7, xp: 320, streak: 12 },
  weekDays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  daysDone: 4,
  profiles: [
    {
      id: 'active',
      label: 'Survey A',
      survey: [
        { label: 'Sleep', value: '7.5 h' },
        { label: 'Steps', value: '11,400' },
        { label: 'Workouts this week', value: '4' },
      ],
      prediction: {
        classLabel: 'Active',
        probabilities: [
          { label: 'Active', value: 0.81 },
          { label: 'Balanced', value: 0.15 },
          { label: 'Sedentary', value: 0.04 },
        ],
      },
      xpAward: 240,
    },
    {
      id: 'balanced',
      label: 'Survey B',
      survey: [
        { label: 'Sleep', value: '6.5 h' },
        { label: 'Steps', value: '6,900' },
        { label: 'Workouts this week', value: '2' },
      ],
      prediction: {
        classLabel: 'Balanced',
        probabilities: [
          { label: 'Active', value: 0.22 },
          { label: 'Balanced', value: 0.64 },
          { label: 'Sedentary', value: 0.14 },
        ],
      },
      xpAward: 150,
    },
    {
      id: 'sedentary',
      label: 'Survey C',
      survey: [
        { label: 'Sleep', value: '5.5 h' },
        { label: 'Steps', value: '2,300' },
        { label: 'Workouts this week', value: '0' },
      ],
      prediction: {
        classLabel: 'Sedentary',
        probabilities: [
          { label: 'Active', value: 0.05 },
          { label: 'Balanced', value: 0.23 },
          { label: 'Sedentary', value: 0.72 },
        ],
      },
      xpAward: 60,
    },
  ],
  labels: {
    profileSwitcher: 'Sample survey',
    survey: 'Survey answers',
    prediction: 'Predicted lifestyle',
    model: 'TabNet classifier',
    level: 'Level',
    xp: 'XP',
    streak: 'Streak',
    streakUnit: 'days',
    log: 'Log check-in',
    logged: 'Checked in',
    reset: 'Reset preview',
    award: 'Award',
    weekComplete: 'Week complete',
  },
}
