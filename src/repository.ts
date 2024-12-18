import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import { Result, ok, err } from 'neverthrow';
import { DomainError, OpenedLesson } from './domain/domain';
import { uuidv7 } from "uuidv7";

// データベースインターフェース
interface Database {
  teacher: { id: string; status: string };
  lesson: {
    id: string;
    teacher_id: string;
    status: string;
    start_at: number;
    end_at: number;
    created_at: number;
    updated_at: number;
  };
}

export const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: createPool({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'fpddd',
      port: 13306,
    })
  })
});

// 教師の取得
export async function getTeacherById(teacherId: string): Promise<Result<{ id: string; status: string }, DomainError>> {
  const teacher = await db
    .selectFrom('teacher')
    .select(['id', 'status'])
    .where('id', '=', teacherId)
    .executeTakeFirst();

  return teacher ? ok(teacher) : err('TeacherNotActiveError');
}

// レッスンをDBに保存
export async function saveLesson(lesson: OpenedLesson): Promise<Result<void, DomainError>> {
  try {
    const now = Date.now();
    await db
      .insertInto('lesson')
      .values({
        id: uuidv7(),
        teacher_id: lesson.teacher_id,
        status: lesson.status,
        start_at: lesson.start_at,
        end_at: lesson.end_at,
        created_at: now,
        updated_at: now,
      })
      .execute();

    return ok(undefined);
  } catch (e) {
    console.error(e);
    return err('TeacherNotActiveError');
  }
}