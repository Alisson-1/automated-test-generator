Feature: Manage Exams
  Teachers can create exams by selecting previously registered questions
  and specifying an identifier mode (letters or powers-of-2).

  Background:
    Given the exam repository is empty
    And the question repository is empty

  Scenario: Successfully create an exam with letters identifier mode
    Given a question already exists with statement "What is the capital of France?"
    When the teacher creates an exam with title "Geography Exam" using the last created question in "letters" mode
    Then the response status should be 201
    And the response body should contain an exam with title "Geography Exam"
    And the response exam should have identifier mode "letters"
    And the response exam should have an id

  Scenario: Successfully create an exam with powers-of-2 identifier mode
    Given a question already exists with statement "What is 2 + 2?"
    When the teacher creates an exam with title "Math Exam" using the last created question in "powers-of-2" mode
    Then the response status should be 201
    And the response body should contain an exam with title "Math Exam"
    And the response exam should have identifier mode "powers-of-2"

  Scenario: Successfully create an exam with multiple questions
    Given a question already exists with statement "Question One"
    And a question already exists with statement "Question Two"
    When the teacher creates an exam with title "Multi-question Exam" using the last 2 created questions in "letters" mode
    Then the response status should be 201
    And the response exam should have 2 question ids

  Scenario: Fail to create an exam with an empty title
    Given a question already exists with statement "Some question"
    When the teacher creates an exam with title "" using the last created question in "letters" mode
    Then the response status should be 400

  Scenario: Fail to create an exam with no questions
    When the teacher sends a POST request to "/api/exams" with:
      """json
      {
        "title": "Empty Exam",
        "questionIds": [],
        "identifierMode": "letters"
      }
      """
    Then the response status should be 400

  Scenario: Fail to create an exam with an invalid identifier mode
    Given a question already exists with statement "A question for invalid mode"
    When the teacher creates an exam with title "Invalid Mode Exam" using the last created question in "invalid-mode" mode
    Then the response status should be 400

  Scenario: Fail to create an exam with a non-existent question id
    When the teacher sends a POST request to "/api/exams" with:
      """json
      {
        "title": "Bad Question Exam",
        "questionIds": ["non-existent-id"],
        "identifierMode": "letters"
      }
      """
    Then the response status should be 404

  Scenario: Fail to create an exam with duplicate question ids
    Given a question already exists with statement "A repeated question"
    When the teacher creates an exam with title "Duplicate Questions Exam" using the last created question twice
    Then the response status should be 400

  # GET /api/exams

  Scenario: Successfully list all exams when repository is empty
    When the teacher lists all exams
    Then the response status should be 200
    And the response body should contain an empty list of exams

  Scenario: Successfully list all exams when exams exist
    Given a question already exists with statement "Q for listing"
    And an exam already exists with title "First Exam"
    And an exam already exists with title "Second Exam"
    When the teacher lists all exams
    Then the response status should be 200
    And the response body should contain 2 exams

  # GET /api/exams/:id

  Scenario: Successfully get an exam by id
    Given a question already exists with statement "Q for get by id"
    And an exam already exists with title "Targeted Exam"
    When the teacher sends a GET request to the last created exam
    Then the response status should be 200
    And the response body should contain an exam with title "Targeted Exam"

  Scenario: Fail to get an exam that does not exist
    When the teacher sends a GET request to "/api/exams/non-existent-id"
    Then the response status should be 404

  # PATCH /api/exams/:id

  Scenario: Successfully update the title of an exam
    Given a question already exists with statement "Q for title update"
    And an exam already exists with title "Old Title"
    When the teacher sends a PATCH request to the last created exam with:
      """json
      { "title": "New Title" }
      """
    Then the response status should be 200
    And the response body should contain an exam with title "New Title"

  Scenario: Successfully update the identifier mode of an exam
    Given a question already exists with statement "Q for mode update"
    And an exam already exists with title "Mode Exam"
    When the teacher sends a PATCH request to the last created exam with:
      """json
      { "identifierMode": "powers-of-2" }
      """
    Then the response status should be 200
    And the response exam should have identifier mode "powers-of-2"

  Scenario: Fail to update an exam with no fields provided
    Given a question already exists with statement "Q for empty update"
    And an exam already exists with title "Stable Exam"
    When the teacher sends a PATCH request to the last created exam with:
      """json
      {}
      """
    Then the response status should be 400

  Scenario: Fail to update an exam that does not exist
    When the teacher sends a PATCH request to "/api/exams/non-existent-id" with:
      """json
      { "title": "Ghost Exam" }
      """
    Then the response status should be 404

  Scenario: Fail to update an exam with a non-existent question id
    Given a question already exists with statement "Q for bad update"
    And an exam already exists with title "Exam to Break"
    When the teacher sends a PATCH request to the last created exam with:
      """json
      { "questionIds": ["non-existent-id"] }
      """
    Then the response status should be 404

  # DELETE /api/exams/:id

  Scenario: Successfully delete an exam
    Given a question already exists with statement "Q for deletion"
    And an exam already exists with title "Exam to Delete"
    When the teacher deletes the last created exam
    Then the response status should be 204
    And the last created exam should no longer exist in the repository

  Scenario: Fail to delete an exam that does not exist
    When the teacher sends a DELETE request to "/api/exams/non-existent-id"
    Then the response status should be 404
