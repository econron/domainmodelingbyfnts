-- Teacher Table
CREATE TABLE teacher (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  status VARCHAR(255) NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
) ENGINE=InnoDB;

-- Student Table
CREATE TABLE student (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  deleted_at BIGINT NULL
) ENGINE=InnoDB;

-- Lesson Table
CREATE TABLE lesson (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  teacher_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(255),
  status VARCHAR(255) NOT NULL,
  start_at BIGINT NOT NULL,
  end_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  CONSTRAINT fk_lesson_teacher FOREIGN KEY (teacher_id) REFERENCES teacher(id),
  CONSTRAINT fk_lesson_student FOREIGN KEY (student_id) REFERENCES student(id)
) ENGINE=InnoDB;

-- LessonReport Table
CREATE TABLE lesson_report (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  lesson_id VARCHAR(255) NOT NULL UNIQUE,
  feedback_comments TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  CONSTRAINT fk_report_lesson FOREIGN KEY (lesson_id) REFERENCES lesson(id)
) ENGINE=InnoDB;

-- Insert into Teacher Table
INSERT INTO teacher (id, status, created_at, updated_at)
VALUES
  ('teacher_1', 'active', 1710000000000, 1710000000000),
  ('teacher_2', 'inactive', 1710000001000, 1710000001000),
  ('teacher_3', 'active', 1710000002000, 1710000002000);

-- Insert into Student Table
INSERT INTO student (id, banned, created_at, updated_at, deleted_at)
VALUES
  ('student_1', FALSE, 1710000000000, 1710000000000, NULL),
  ('student_2', TRUE, 1710000001000, 1710000001000, 1710000001500),
  ('student_3', FALSE, 1710000002000, 1710000002000, NULL);
