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

  Scenario: Successfully update an entire question
    Given a question already exists with statement "What is the boiling point of water?"
    When the teacher sends a PATCH request to the last created question at "/api/questions/:id" with:
      """json
      {
        "statement": "What is the boiling point of water at sea level?",
        "alternatives": [
          { "description": "90°C", "correct": false },
          { "description": "100°C", "correct": true },
          { "description": "110°C", "correct": false }
        ]
      }
      """
    Then the response status should be 200
    And the response body should contain a question with statement "What is the boiling point of water at sea level?"
    And the response question should have 3 alternatives

  Scenario: Successfully update only the statement of a question
    Given a question already exists with statement "Who wrote Hamlet?"
    When the teacher sends a PATCH request to the last created question at "/api/questions/:id/statement" with:
      """json
      {
        "statement": "Who wrote Romeo and Juliet?"
      }
      """
    Then the response status should be 200
    And the response body should contain a question with statement "Who wrote Romeo and Juliet?"

  Scenario: Successfully update the description of an alternative
    Given a question already exists with statement "What color is the sky?"
    When the teacher sends a PATCH request to the first alternative of the last created question with description "Red"
    Then the response status should be 200
    And the first alternative of the response question should have description "Red"

  Scenario: Fail to update a question that does not exist
    When the teacher sends a PATCH request to "/api/questions/non-existent-id" with:
      """json
      {
        "statement": "Some new statement"
      }
      """
    Then the response status should be 404

  Scenario: Fail to update a question with a duplicate statement
    Given a question already exists with statement "Question Alpha"
    And a question already exists with statement "Question Beta"
    When the teacher sends a PATCH request to the last created question at "/api/questions/:id/statement" with:
      """json
      {
        "statement": "Question Alpha"
      }
      """
    Then the response status should be 409

  Scenario: Fail to update alternatives with duplicate descriptions
    Given a question already exists with statement "A question with alternatives"
    When the teacher sends a PATCH request to the last created question at "/api/questions/:id" with:
      """json
      {
        "alternatives": [
          { "description": "Same", "correct": true },
          { "description": "Same", "correct": false }
        ]
      }
      """
    Then the response status should be 400

  Scenario: Fail to update a question with no correct alternative
    Given a question already exists with statement "A question to lose its correct alternative"
    When the teacher sends a PATCH request to the last created question at "/api/questions/:id" with:
      """json
      {
        "alternatives": [
          { "description": "Option A", "correct": false },
          { "description": "Option B", "correct": false }
        ]
      }
      """
    Then the response status should be 400

  Scenario: Fail to update a question with fewer than 2 alternatives
    Given a question already exists with statement "A question to shrink its alternatives"
    When the teacher sends a PATCH request to the last created question at "/api/questions/:id" with:
      """json
      {
        "alternatives": [
          { "description": "Only option", "correct": true }
        ]
      }
      """
    Then the response status should be 400

  Scenario: Fail to update alternative description to an existing one in the same question
    Given a question already exists with statement "A multi-alternative question"
    When the teacher sends a PATCH request to the first alternative of the last created question with description "Option B"
    Then the response status should be 400

  Scenario: Ignore correct field when updating alternative description endpoint
    Given a question already exists with statement "A question with a single correct alternative"
    When the teacher sends a PATCH request to the first alternative of the last created question with correct false and description "Option A updated"
    Then the response status should be 200
    And the first alternative of the response question should still be correct
