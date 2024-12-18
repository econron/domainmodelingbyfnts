import express from 'express';
import { getTeacherById, saveLesson } from './repository';
import { 
  DomainError, 
  LessonBase, 
  OpenedLesson, 
  validateTeacherStatus, 
  validateLessonTimes, 
  createOpenedLesson 
} from './domain';
import { Result, ResultAsync } from 'neverthrow';

const app = express();
app.use(express.json());

const saveLessonAsync = (lesson: OpenedLesson): ResultAsync<OpenedLesson, DomainError> =>
  ResultAsync.fromPromise(
    saveLesson(lesson).then(result => {
      if (result.isOk()) {
        return lesson; // 成功時に lesson を返す
      } else {
        throw result.error; // エラーをスローする
      }
    }),
    (error) => error as DomainError
  );

async function openLessonWorkflow(
  teacherId: string,
  startAt: number,
  endAt: number
): Promise<Result<OpenedLesson, DomainError>> {
  const lessonBase: LessonBase = { teacher_id: teacherId };

  // 状態遷移フロー
  return (await getTeacherById(teacherId))
    .andThen((teacher) => validateTeacherStatus(lessonBase, teacher.status))
    .andThen((teacherValidatedLesson) => validateLessonTimes(teacherValidatedLesson, startAt, endAt))
    .map((timeValidatedLesson) => createOpenedLesson(timeValidatedLesson))
    .asyncAndThen((openedLesson) => saveLessonAsync(openedLesson).map(() => openedLesson));
}
  
// エンドポイント
app.post('/lesson/open', async (req, res) => {
  const { teacher_id, start_at, end_at } = req.body;

  const result = await openLessonWorkflow(teacher_id, start_at, end_at);

  result
    .map((lesson) => res.status(201).json(lesson))
    .mapErr((error) => {
      const status = error === 'InvalidTimeError' ? 400 : 422;
      res.status(status).json({ error });
    });
});

// サーバー起動
app.listen(3000, () => console.log('Server is running on http://localhost:3000'));
