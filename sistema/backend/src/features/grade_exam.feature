Feature: Grade Exam
  Teachers can grade student responses against an answer key CSV,
  producing a grade report CSV with per-question and total scores.

  Scenario: Grade letters-mode exam in strict mode — all correct
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1,q2\n1,A,B",
        "studentResponsesCsv": "student_identifier,proof_number,q1,q2\nJohn Doe,1,A,B",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report should contain a "reportCsv" field
    And the report should show student "John Doe" with total score "10.00"

  Scenario: Grade letters-mode exam in strict mode — one wrong answer
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1,q2\n1,A,B",
        "studentResponsesCsv": "student_identifier,proof_number,q1,q2\nJane,1,A,A",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report should show student "Jane" with total score "5.00"

  Scenario: Grade letters-mode exam in strict mode — all wrong
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nBob,1,B",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report should show student "Bob" with total score "0.00"

  Scenario: Grade letters-mode exam in lenient mode — partial credit for missed selection
    # Answer key = "A/C" → max letter C → total alternatives = 3 (A, B, C)
    # Student answers "A" → missed C (1 error) → score = (3-1)/3 * 3 = 2.00
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A/C",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nAlice,1,A",
        "gradingMode": "lenient",
        "examValue": 3
      }
      """
    Then the response status should be 200
    And the report should show student "Alice" with total score "2.00"

  Scenario: Grade letters-mode exam in lenient mode — perfect answer gives full score
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A/C",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nAlice,1,A/C",
        "gradingMode": "lenient",
        "examValue": 3
      }
      """
    Then the response status should be 200
    And the report should show student "Alice" with total score "3.00"

  Scenario: Grade powers-of-2 exam in strict mode — correct answer
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,6",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nCarlos,1,6",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report should show student "Carlos" with total score "10.00"

  Scenario: Grade powers-of-2 exam in strict mode — wrong answer
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,6",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nCarlos,1,4",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report should show student "Carlos" with total score "0.00"

  Scenario: Grade powers-of-2 exam in lenient mode — one bit wrong
    # Answer key = "7" (111 in binary, 3 alternatives)
    # Student answers "5" (101) → bit 1 wrong → 1 error → score = (3-1)/3 * 9 = 6.00
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,7",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nDiana,1,5",
        "gradingMode": "lenient",
        "examValue": 9
      }
      """
    Then the response status should be 200
    And the report should show student "Diana" with total score "6.00"

  Scenario: Grade exam with multiple students and different proofs
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A\n2,B",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nStudent1,1,A\nStudent2,2,B",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report should show student "Student1" with total score "10.00"
    And the report should show student "Student2" with total score "10.00"

  Scenario: Student with unknown proof number receives zero
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nGhost,99,A",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report should show student "Ghost" with total score "0.00"

  Scenario: Report CSV contains a header row and one row per student
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1,q2\n1,A,B",
        "studentResponsesCsv": "student_identifier,proof_number,q1,q2\nEva,1,A,B",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report CSV should have 2 rows

  Scenario: Report CSV contains correct per-question scores
    # 2 questions, strict: q1 right (5.00), q2 wrong (0.00), total 5.00
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1,q2\n1,A,B",
        "studentResponsesCsv": "student_identifier,proof_number,q1,q2\nJohn,1,A,C",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report should show student "John" with question 1 score "5.00"
    And the report should show student "John" with question 2 score "0.00"

  Scenario: Per-question lenient scores sum to the correct total
    # 2 questions, lenient letters mode, examValue=9 (4.50 per question)
    # allKeyAnswers = ["A/C", "B"] → max letter C (index 2) → total_alts = 3
    # q1: key="A/C", student="A" → missed C (1 error) → (3-1)/3 * 4.50 = 3.00
    # q2: key="B",   student="B" → perfect         → (3-0)/3 * 4.50 = 4.50
    # total = 7.50
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1,q2\n1,A/C,B",
        "studentResponsesCsv": "student_identifier,proof_number,q1,q2\nEva,1,A,B",
        "gradingMode": "lenient",
        "examValue": 9
      }
      """
    Then the response status should be 200
    And the report should show student "Eva" with question 1 score "3.00"
    And the report should show student "Eva" with question 2 score "4.50"
    And the report should show student "Eva" with total score "7.50"

  Scenario: Report CSV header has correct column names for a 2-question exam
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1,q2\n1,A,B",
        "studentResponsesCsv": "student_identifier,proof_number,q1,q2\nEva,1,A,B",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report CSV header should be "student_identifier,proof_number,q1_score,q2_score,total_score"

  Scenario: examValue defaults to 10 when not provided
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nFred,1,A",
        "gradingMode": "strict"
      }
      """
    Then the response status should be 200
    And the report should show student "Fred" with total score "10.00"

  Scenario: Empty student answer scores zero in strict mode
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nGary,1,",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report should show student "Gary" with total score "0.00"

  Scenario: Empty student answer receives partial credit in lenient mode
    # key="A/C", student="" → keySet={A,C}, studentSet={} → 2 errors, total_alts=3
    # score = (3-2)/3 * 6 = 2.00
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A/C",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nGary,1,",
        "gradingMode": "lenient",
        "examValue": 6
      }
      """
    Then the response status should be 200
    And the report should show student "Gary" with total score "2.00"

  Scenario: Strict mode accepts multi-letter correct answer
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A/C",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nHana,1,A/C",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report should show student "Hana" with total score "10.00"

  Scenario: Strict mode rejects partial selection of multi-letter answer
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A/C",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nHana,1,A",
        "gradingMode": "strict",
        "examValue": 10
      }
      """
    Then the response status should be 200
    And the report should show student "Hana" with total score "0.00"

  Scenario: Missing answerKeyCsv field returns 400
    When the teacher grades the exam with:
      """json
      {
        "studentResponsesCsv": "student_identifier,proof_number,q1\nEva,1,A",
        "gradingMode": "strict"
      }
      """
    Then the response status should be 400

  Scenario: Missing studentResponsesCsv field returns 400
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A",
        "gradingMode": "strict"
      }
      """
    Then the response status should be 400

  Scenario: Invalid gradingMode returns 400
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1\n1,A",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nEva,1,A",
        "gradingMode": "invalid"
      }
      """
    Then the response status should be 400

  Scenario: Answer key CSV with only a header row and no data returns 400
    When the teacher grades the exam with:
      """json
      {
        "answerKeyCsv": "proof_number,q1",
        "studentResponsesCsv": "student_identifier,proof_number,q1\nEva,1,A",
        "gradingMode": "strict"
      }
      """
    Then the response status should be 400
