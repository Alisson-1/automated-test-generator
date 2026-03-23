Feature: Generate Proofs
  Teachers can generate randomized proof instances from an exam,
  receiving a PDF (base64) and an answer key CSV.

  Background:
    Given the exam repository is empty
    And the question repository is empty

  Scenario: Successfully generate a single proof in letters mode
    Given a question already exists with statement "What is the capital of France?"
    And an exam already exists with title "Geography Exam" in "letters" mode
    When the teacher generates 1 proof for the last created exam with header:
      """json
      {
        "discipline": "Geography",
        "teacher": "Prof. Smith",
        "date": "2026-03-23"
      }
      """
    Then the response status should be 200
    And the response should contain a base64 pdf
    And the response should contain a csv

  Scenario: Successfully generate a single proof in powers-of-2 mode
    Given a question already exists with statement "What is 2 + 2?"
    And an exam already exists with title "Math Exam" in "powers-of-2" mode
    When the teacher generates 1 proof for the last created exam with header:
      """json
      {
        "discipline": "Mathematics",
        "teacher": "Prof. Jones",
        "date": "2026-03-23"
      }
      """
    Then the response status should be 200
    And the response should contain a base64 pdf
    And the response should contain a csv

  Scenario: Successfully generate multiple proofs
    Given a question already exists with statement "Question One"
    And a question already exists with statement "Question Two"
    And an exam already exists with title "Multi-question Exam" using the last 2 questions
    When the teacher generates 3 proofs for the last created exam with header:
      """json
      {
        "discipline": "Science",
        "teacher": "Prof. Brown",
        "date": "2026-03-23"
      }
      """
    Then the response status should be 200
    And the csv should have 3 data rows

  Scenario: CSV answer key uses letters format for letters mode
    Given a question already exists with statement "Which option is correct?"
    And an exam already exists with title "Letters Exam" in "letters" mode
    When the teacher generates 1 proof for the last created exam with header:
      """json
      {
        "discipline": "Logic",
        "teacher": "Prof. White",
        "date": "2026-03-23"
      }
      """
    Then the response status should be 200
    And the csv first data row answer key should not be a plain number

  Scenario: CSV answer key uses numeric sum for powers-of-2 mode
    Given a question already exists with statement "Sum-based question"
    And an exam already exists with title "Powers Exam" in "powers-of-2" mode
    When the teacher generates 1 proof for the last created exam with header:
      """json
      {
        "discipline": "Math",
        "teacher": "Prof. Black",
        "date": "2026-03-23"
      }
      """
    Then the response status should be 200
    And the csv first data row answer key should be a numeric value

  Scenario: Successfully generate proofs with optional header fields
    Given a question already exists with statement "Optional header question"
    And an exam already exists with title "Exam with Full Header" in "letters" mode
    When the teacher generates 1 proof for the last created exam with header:
      """json
      {
        "discipline": "Physics",
        "teacher": "Prof. Green",
        "date": "2026-03-23",
        "institution": "State University",
        "examValue": "10.0"
      }
      """
    Then the response status should be 200
    And the response should contain a base64 pdf

  Scenario: Fail to generate proofs for a non-existent exam
    When the teacher sends a POST request to "/api/exams/non-existent-id/generate-proofs" with:
      """json
      {
        "count": 1,
        "header": {
          "discipline": "History",
          "teacher": "Prof. Gray",
          "date": "2026-03-23"
        }
      }
      """
    Then the response status should be 404

  Scenario: Fail to generate proofs with count of zero
    Given a question already exists with statement "A question for count validation"
    And an exam already exists with title "Count Zero Exam" in "letters" mode
    When the teacher sends a POST request to generate proofs for the last created exam with count 0

    Then the response status should be 400

  Scenario: Fail to generate proofs with count exceeding 500
    Given a question already exists with statement "A question for max count validation"
    And an exam already exists with title "Count Max Exam" in "letters" mode
    When the teacher sends a POST request to generate proofs for the last created exam with count 501

    Then the response status should be 400

  Scenario: Fail to generate proofs with missing discipline
    Given a question already exists with statement "A question for header validation"
    And an exam already exists with title "Missing Discipline Exam" in "letters" mode
    When the teacher sends a POST request to the last created exam at "/api/exams/:id/generate-proofs" with:
      """json
      {
        "count": 1,
        "header": {
          "teacher": "Prof. X",
          "date": "2026-03-23"
        }
      }
      """
    Then the response status should be 400

  Scenario: Fail to generate proofs with missing teacher
    Given a question already exists with statement "A question for teacher validation"
    And an exam already exists with title "Missing Teacher Exam" in "letters" mode
    When the teacher sends a POST request to the last created exam at "/api/exams/:id/generate-proofs" with:
      """json
      {
        "count": 1,
        "header": {
          "discipline": "Biology",
          "date": "2026-03-23"
        }
      }
      """
    Then the response status should be 400

  Scenario: Fail to generate proofs with missing date
    Given a question already exists with statement "A question for date validation"
    And an exam already exists with title "Missing Date Exam" in "letters" mode
    When the teacher sends a POST request to the last created exam at "/api/exams/:id/generate-proofs" with:
      """json
      {
        "count": 1,
        "header": {
          "discipline": "Chemistry",
          "teacher": "Prof. Y"
        }
      }
      """
    Then the response status should be 400
