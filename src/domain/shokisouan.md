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