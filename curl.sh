curl -X POST http://localhost:3000/lesson/open \
  -H "Content-Type: application/json" \
  -d '{
    "teacher_id": "teacher_1",
    "start_at": 1710003600000,
    "end_at": 1710007200000
  }'
