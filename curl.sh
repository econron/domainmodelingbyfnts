start_at=$(($(date +%s000) + 3600000))
end_at=$(($start_at + 1500000))

curl -X POST http://localhost:3000/lesson/open \
  -H "Content-Type: application/json" \
  -d "{
    \"teacher_id\": \"teacher_1\",
    \"start_at\": $start_at,
    \"end_at\": $end_at
  }"
