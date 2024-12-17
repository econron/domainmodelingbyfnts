import { Result, ok, err } from 'neverthrow';
import express, { Request, response, Response } from 'express';

export function helloworld(req: Request): string {
  subfunc();
  subfunc2();
  return 'Hello World';
  
  /**
   * request -> validatedRequest
   * validatedRequest -> validatedDomain
   * validatedDomain -> workflow
   * workflow -> response
   */
}

/**
 * 
 */
function subfunc() {
  console.log('subfunc');
}

interface Empty {
  kind: "Empty"
}

interface Cons<T> {
  kind: "Cons"
  head: T
  tail: List<T>
}

export type List<T> = Empty | Cons<T>

type map = <T, U>(f: (a: T) => U, xs: List<T>) => List<U>

export const map: map = (f, xs) => {
  switch (xs.kind) {
    case "Empty":
      return { kind: "Empty" }
    case "Cons":
      return { kind: "Cons", head: f(xs.head), tail: map(f, xs.tail) }
  }
}

// Result型により失敗可能性のある計算を一本道に合成できる
function itsUnder100(n: number): Result<number, Error> {
  return n <= 100 ? ok(n) : err(new Error('100より大きい数字です'))
}

function itsEven(n: number): Result<number, Error> {
  return n % 2 == 0 ? ok(n) : err(new Error("奇数です"))
}

function itsPositive(n: number): Result<number, Error> {
  return n > 0 ? ok(n) : err(new Error("負数です"))
}

function toString(n: number): Result<string, Error> {
  return n.toString() ? ok(n.toString()) : err(new Error("文字列変換に失敗しました"))
}

const result = ok(96).andThen(itsUnder100).andThen(itsEven).andThen(itsPositive).andThen(toString)

function subfunc2() {
  console.log('subfunc2 is executing');
  result.match(
    (n) => console.log(`Result (success): ${n}`),
    (error) => console.error(`Result (error): ${error.message}`)
  );
}

/**
 * lesson
 * - id
 * - start_date
 * - end_date
 * - teacher_id
 * - student_id
 * - created_at
 * - updated_at
 * 
 * teacher
 * - id
 * - status
 *   - active
 *   - inactive
 * - created_at
 * - updated_at
 * 
 * student
 * - id
 * - created_at
 * - updated_at
 * - deleted_at
 * 
 * lesson_report
 * - id
 * - lesson_id
 * - feedback_comments
 * - created_at
 * - updated_at
 * 
 * 生徒
 * 講師
 * の両方がアサインされている
 * → レッスンとして妥当
 * 
 * openedLesson
 * - validatedStartAt
 * - validatedEndAt
 * - validatedTutorId
 * 
 * bookedLesson
 * - validatedStartAt
 * - validatedEndAt
 * - validatedTutorId
 * - validatedStudentId
 * 
 * lessonChangedHistory
 * - lessonId
 * - action
 * 
 * レッスンレポートまで提出されたら「正当なレッスン」となる。
 * ない場合は返金対象のレッスンとなる。
 * 
 *  nothing -> open -> booked -> open ・・・
 *         open    book      cancel    
 * 
 * nothing -> open
 *  activeTutorId | inactiveTutorError
 *  validatedStartAt (now < startat) | invalidStartAtError
 *  validatedEndAt (startat < endat) | invalidEndAtError
 * 
 * open -> booked
 *  activeTutorId | inactiveTutorError
 *  enabledStudent | unabledStudent
 *    unbanned | banned
 *    exists | deleted
 *  validatedStartAt (now < startat) | invalidStartAtError
 *  validatedEndAt (startat < endat) | invalidEndAtError
 * 
 * bookAction -> sendEmailToTheStudent, sendTutorEmailToTheTutor
 * 
 * booked -> open
 *  cancelable(now < startat - 1h) | uncancelableError
 * 
 * cancelAction -> sendEmailToTheStudent, sendTutorEmailToTheTutor
 * 
 */