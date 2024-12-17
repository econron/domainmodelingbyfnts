import { Result, ok, err } from 'neverthrow';

// ドメインエラー型
export type DomainError = 'TeacherNotActiveError' | 'InvalidTimeError' | "Failed to save lesson";

// 初期状態の型
export interface LessonBase {
  teacher_id: string;
}

// 教師が検証された状態
export interface TeacherValidatedLesson extends LessonBase {
  teacher_status: 'active';
}

// 時間が検証された状態
export interface TimeValidatedLesson extends TeacherValidatedLesson {
  start_at: number;
  end_at: number;
}

// 完成されたレッスン状態
export interface OpenedLesson extends TimeValidatedLesson {
  status: 'opened';
}

// 教師の状態を検証し、次の状態に遷移
export function validateTeacherStatus(lesson: LessonBase, status: string): Result<TeacherValidatedLesson, DomainError> {
  return status === 'active'
    ? ok({ ...lesson, teacher_status: 'active' })
    : err('TeacherNotActiveError');
}

// 時間を検証し、次の状態に遷移
export function validateLessonTimes(lesson: TeacherValidatedLesson, startAt: number, endAt: number): Result<TimeValidatedLesson, DomainError> {
  const now = Date.now();
  return startAt > now && endAt > startAt
    ? ok({ ...lesson, start_at: startAt, end_at: endAt })
    : err('InvalidTimeError');
}

// 最終的にレッスンを開く状態に遷移
export function createOpenedLesson(lesson: TimeValidatedLesson): OpenedLesson {
  return { ...lesson, status: 'opened' };
}
