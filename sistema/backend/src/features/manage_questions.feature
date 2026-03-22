Feature: Manage Questions
  Teachers can create questions with a statement and a set of alternatives,
  where at least one alternative must be marked as correct.

  Background:
    Given the question repository is empty

  Scenario: Successfully create a question with valid data
    When the teacher sends a POST request to "/api/questions" with:
      """json
      {
        "statement": "What is the capital of France?",
        "alternatives": [
          { "description": "Paris", "correct": true },
          { "description": "London", "correct": false },
          { "description": "Berlin", "correct": false }
        ]
      }
      """
    Then the response status should be 201
    And the response body should contain a question with statement "What is the capital of France?"
    And the response question should have 3 alternatives
    And the response question should have an id

  Scenario: Fail to create a question without a statement
    When the teacher sends a POST request to "/api/questions" with:
      """json
      {
        "statement": "",
        "alternatives": [
          { "description": "Option A", "correct": true },
          { "description": "Option B", "correct": false }
        ]
      }
      """
    Then the response status should be 400

  Scenario: Fail to create a question with fewer than 2 alternatives
    When the teacher sends a POST request to "/api/questions" with:
      """json
      {
        "statement": "Only one option?",
        "alternatives": [
          { "description": "Only option", "correct": true }
        ]
      }
      """
    Then the response status should be 400

  Scenario: Fail to create a question with no correct alternative
    When the teacher sends a POST request to "/api/questions" with:
      """json
      {
        "statement": "Which option is correct?",
        "alternatives": [
          { "description": "Option A", "correct": false },
          { "description": "Option B", "correct": false }
        ]
      }
      """
    Then the response status should be 400

  Scenario: Fail to create a question with duplicate alternative descriptions
    When the teacher sends a POST request to "/api/questions" with:
      """json
      {
        "statement": "Pick the unique option",
        "alternatives": [
          { "description": "Same text", "correct": true },
          { "description": "Same text", "correct": false }
        ]
      }
      """
    Then the response status should be 400

  Scenario: Fail to create a question with a duplicate statement
    Given a question already exists with statement "What is 2 + 2?"
    When the teacher sends a POST request to "/api/questions" with:
      """json
      {
        "statement": "What is 2 + 2?",
        "alternatives": [
          { "description": "3", "correct": false },
          { "description": "4", "correct": true }
        ]
      }
      """
    Then the response status should be 409
