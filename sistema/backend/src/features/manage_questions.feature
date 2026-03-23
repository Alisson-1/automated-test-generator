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

  Scenario: Successfully delete a question
    Given a question already exists with statement "A question to be fully deleted"
    When the teacher deletes the last created question
    Then the response status should be 204
    And the last created question should no longer exist in the repository

  Scenario: Fail to delete a question that does not exist
    When the teacher sends a DELETE request to "/api/questions/non-existent-id"
    Then the response status should be 404

  Scenario: Successfully delete a non-correct alternative
    Given a question with 3 alternatives already exists
    When the teacher deletes the last non-correct alternative of the last created question
    Then the response status should be 200
    And the response question should have 2 alternatives

  Scenario: Fail to delete the correct alternative
    Given a question already exists with statement "A question whose correct alternative is protected"
    When the teacher deletes the correct alternative of the last created question
    Then the response status should be 400

  Scenario: Fail to delete an alternative when only 2 remain
    Given a question already exists with statement "A question with minimum alternatives to delete"
    When the teacher deletes the last non-correct alternative of the last created question
    Then the response status should be 400

  Scenario: Fail to delete a non-existent alternative
    Given a question already exists with statement "A question for alternative deletion lookup"
    When the teacher sends a DELETE request to "/api/questions/:id/alternatives/non-existent-alt-id"
    Then the response status should be 404

  # GET /api/questions

  Scenario: Successfully list all questions when repository is empty
    When the teacher sends a GET request to "/api/questions"
    Then the response status should be 200
    And the response body should contain an empty list of questions

  Scenario: Successfully list all questions when questions exist
    Given a question already exists with statement "What is 1 + 1?"
    And a question already exists with statement "What is the capital of Brazil?"
    When the teacher sends a GET request to "/api/questions"
    Then the response status should be 200
    And the response body should contain 2 questions

  # POST /api/questions/:id/alternatives

  Scenario: Successfully add a non-correct alternative to a question
    Given a question already exists with statement "What is the color of the sky?"
    When the teacher sends a POST request to the last created question at "/api/questions/:id/alternatives" with:
      """json
      { "description": "Green", "correct": false }
      """
    Then the response status should be 201
    And the response question should have 3 alternatives

  Scenario: Successfully add a correct alternative, demoting the existing correct one
    Given a question already exists with statement "What is 5 times 5?"
    When the teacher sends a POST request to the last created question at "/api/questions/:id/alternatives" with:
      """json
      { "description": "25", "correct": true }
      """
    Then the response status should be 201
    And the response question should have 3 alternatives
    And the response question should have exactly 1 correct alternative

  Scenario: Fail to add an alternative to a non-existent question
    When the teacher sends a POST request to "/api/questions/non-existent-id/alternatives" with:
      """json
      { "description": "Some option", "correct": false }
      """
    Then the response status should be 404

  Scenario: Fail to add an alternative with a duplicate description
    Given a question already exists with statement "Which planet is closest to the sun?"
    When the teacher sends a POST request to the last created question at "/api/questions/:id/alternatives" with:
      """json
      { "description": "Option A", "correct": false }
      """
    Then the response status should be 400

  Scenario: Fail to add an alternative without a description
    Given a question already exists with statement "What is the speed of light?"
    When the teacher sends a POST request to the last created question at "/api/questions/:id/alternatives" with:
      """json
      { "correct": false }
      """
    Then the response status should be 400

  Scenario: Successfully import multiple questions in bulk
    When the teacher sends a POST request to "/api/questions/bulk" with:
      """json
      {
        "questions": [
          {
            "statement": "What is 1 + 1?",
            "alternatives": [
              { "description": "1", "correct": false },
              { "description": "2", "correct": true }
            ]
          },
          {
            "statement": "What is the capital of France?",
            "alternatives": [
              { "description": "London", "correct": false },
              { "description": "Paris", "correct": true }
            ]
          }
        ]
      }
      """
    Then the response status should be 207
    And the bulk result should have 2 created questions and 0 failures

  Scenario: Partially import questions, skipping invalid ones
    When the teacher sends a POST request to "/api/questions/bulk" with:
      """json
      {
        "questions": [
          {
            "statement": "Valid question",
            "alternatives": [
              { "description": "Option A", "correct": true },
              { "description": "Option B", "correct": false }
            ]
          },
          {
            "statement": "Invalid: no correct alternative",
            "alternatives": [
              { "description": "Option A", "correct": false },
              { "description": "Option B", "correct": false }
            ]
          }
        ]
      }
      """
    Then the response status should be 207
    And the bulk result should have 1 created questions and 1 failures

  Scenario: Fail bulk import when question duplicates an existing statement
    Given a question already exists with statement "Already exists"
    When the teacher sends a POST request to "/api/questions/bulk" with:
      """json
      {
        "questions": [
          {
            "statement": "Already exists",
            "alternatives": [
              { "description": "Yes", "correct": true },
              { "description": "No", "correct": false }
            ]
          },
          {
            "statement": "New unique question",
            "alternatives": [
              { "description": "Option A", "correct": true },
              { "description": "Option B", "correct": false }
            ]
          }
        ]
      }
      """
    Then the response status should be 207
    And the bulk result should have 1 created questions and 1 failures

  Scenario: Fail bulk import when two questions in the batch share the same statement
    When the teacher sends a POST request to "/api/questions/bulk" with:
      """json
      {
        "questions": [
          {
            "statement": "Duplicated statement",
            "alternatives": [
              { "description": "Option A", "correct": true },
              { "description": "Option B", "correct": false }
            ]
          },
          {
            "statement": "Duplicated statement",
            "alternatives": [
              { "description": "Option X", "correct": true },
              { "description": "Option Y", "correct": false }
            ]
          }
        ]
      }
      """
    Then the response status should be 207
    And the bulk result should have 1 created questions and 1 failures

  Scenario: Fail bulk import with empty questions array
    When the teacher sends a POST request to "/api/questions/bulk" with:
      """json
      { "questions": [] }
      """
    Then the response status should be 400
