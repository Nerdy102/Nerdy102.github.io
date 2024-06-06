// Exercise 1: Generate fill-in-the-blank exercises
document.getElementById('generate-sentences-1').addEventListener('click', async () => {
  console.log('Generate fill-in-the-blank exercises button clicked');
  try {
    const response = await fetch('/generate-sentences-1');
    const data = await response.json();
    console.log('Sentences received:', data);

    const form = document.getElementById('exercise-form-1');
    const container = document.getElementById('sentences-container-1');
    container.innerHTML = '';

    data.sentences.forEach((sentence, index) => {
      const div = document.createElement('div');
      div.innerHTML = `${index + 1}. ${sentence.replace('___', `<input type="text" name="answer${index}" class="blank">`)}`;
      container.appendChild(div);
    });

    form.style.display = 'block';
  } catch (error) {
    console.error('Error fetching sentences:', error);
    alert('Failed to generate sentences. Please try again.');
  }
});

document.getElementById('exercise-form-1').addEventListener('submit', async (event) => {
  event.preventDefault();
  console.log('Fill-in-the-blank answers submitted');

  try {
    const formData = new FormData(event.target);
    const answers = {};
    const sentences = [];

    formData.forEach((value, key) => {
      const index = key.replace('answer', '');
      answers[key] = value;

      const sentenceElement = document.querySelector(`input[name="${key}"]`).parentElement;
      const sentenceHTML = sentenceElement.innerHTML.split('. ')[1].trim();
      const sentenceText = sentenceHTML.replace(/<input.*?>/, '___');
      const sentenceWithAnswer = sentenceText.replace('___', value);

      sentences.push(sentenceWithAnswer);
    });

    console.log('Answers:', answers);
    console.log('Sentences:', sentences);

    const response = await fetch('/evaluate-answers-1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, sentences })
    });

    const feedback = await response.json();
    console.log('Feedback received:', feedback);

    const feedbackContainer = document.getElementById('feedback-container-1');
    feedbackContainer.innerHTML = '';

    feedback.forEach((item, index) => {
      const div = document.createElement('div');
      const feedbackText = item.correct ? 'Correct' : 'Incorrect';
      div.innerHTML = `${index + 1}. ${item.sentence} - 
      <span class="feedback ${item.correct ? 'correct' : 'incorrect'}">${feedbackText}: ${item.explanation}</span>`;
      feedbackContainer.appendChild(div);
    });

    feedbackContainer.style.display = 'block';
  } catch (error) {
    console.error('Error submitting answers:', error);
    alert('Failed to submit answers. Please try again.');
  }
});

// Exercise 2: Analyze prepositions
document.addEventListener('DOMContentLoaded', function() {
  // Adding CSS dynamically
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: 'Roboto', sans-serif;
      background-color: #1c1c1c;
      color: #f8f9fa;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #333;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .hidden {
      display: none;
    }
    .highlight {
      background-color: transparent;
      color: inherit;
      padding: 0 4px;
      border-radius: 3px;
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error {
      color: #dc3545;
      font-weight: bold;
    }
    .result {
      margin-top: 20px;
      background-color: #444;
      padding: 15px;
      border-radius: 8px;
    }
    #analysisForm {
      margin-bottom: 20px;
    }
    #analysisForm label, #analysisForm input, #analysisForm button {
      display: block;
      width: 100%;
      margin-bottom: 10px;
    }
    #analysisForm input, #analysisForm button {
      padding: 10px;
      font-size: 16px;
    }
    #analysisForm button {
      background-color: #007bff;
      color: white;
      border: none;
      cursor: pointer;
    }
    #analysisForm button:hover {
      background-color: #0056b3;
    }
  `;
  document.head.appendChild(style);

  document.getElementById('analysisForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const sentence = document.getElementById('sentenceInput').value.trim();
    const resultSection = document.getElementById('resultSection');
    const analysisResult = document.getElementById('analysisResult');
    const spinner = document.getElementById('spinner');

    spinner.classList.remove('hidden');
    resultSection.classList.add('hidden');

    fetch('/analyze-prepositions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      analysisResult.innerHTML = data.analysis 
        ? formatAnalysis(data.analysis) 
        : 'No prepositions found.';
      spinner.classList.add('hidden');
      resultSection.classList.remove('hidden');
    })
    .catch(error => {
      console.error('Error:', error);
      analysisResult.innerHTML = `<span class="error">Failed to analyze the sentence: ${error.message}</span>`;
      spinner.classList.add('hidden');
      resultSection.classList.remove('hidden');
    });
  });

  function formatAnalysis(analysis) {
    const parts = analysis.split('Corrected sentence:');
    const prepositionAnalysis = parts[0];
    const corrections = parts[1] ? `<br><strong>Corrections:</strong> ${parts[1]}` : '';

    return `<strong>Analysis:</strong><br> ${prepositionAnalysis}<br>${corrections}`;
  }
});


// Exercise 3: Multiple Choice
document.getElementById('generate-exercise-3').addEventListener('click', async () => {
  console.log('Generate multiple-choice exercises button clicked');
  try {
    const response = await fetch('/generate-exercise-3');
    const data = await response.json();
    console.log('Questions received:', data);

    const form = document.getElementById('exercise-form-3');
    const container = document.getElementById('questions-container-3');
    container.innerHTML = '';

    data.sentences.forEach((sentenceObj, index) => {
      const div = document.createElement('div');
      const sentenceWithInput = sentenceObj.question.replace('___', `<input type="text" name="answer${index}" class="blank" pattern="[a-cA-C]" maxlength="1" required>`);
      div.innerHTML = `${sentenceWithInput}`;
      container.appendChild(div);

      const answerInput = document.createElement('input');
      answerInput.type = 'hidden';
      answerInput.name = `correctAnswer${index}`;
      answerInput.value = sentenceObj.answer;
      container.appendChild(answerInput);
    });

    form.style.display = 'block';
  } catch (error) {
    console.error('Error fetching questions:', error);
    alert('Failed to generate questions. Please try again.');
  }
});

document.getElementById('exercise-form-3').addEventListener('submit', async (event) => {
  event.preventDefault();
  console.log('Multiple-choice answers submitted');

  try {
    const formData = new FormData(event.target);
    const answers = {};
    const sentences = [];

    formData.forEach((value, key) => {
      if (key.startsWith('correctAnswer')) {
        const index = key.replace('correctAnswer', '');
        sentences.push({ question: document.querySelector(`input[name="correctAnswer${index}"]`).parentElement.innerText.trim(), answer: value });
      } else {
        answers[key] = value;
      }
    });

    console.log('Answers:', answers);
    console.log('Sentences:', sentences);

    const response = await fetch('/evaluate-answers-3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, sentences })
    });

    const feedback = await response.json();
    console.log('Feedback received:', feedback);

    const feedbackContainer = document.getElementById('feedback-container-3');
    feedbackContainer.innerHTML = '';

    feedback.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = `feedback-item ${item.correct ? 'correct' : 'incorrect'}`;

      const icon = item.correct ? '✔️' : '❌';
      const feedbackText = item.correct ? 'Wow!!! You aced that like a pro! Your hard work totally paid off.' : 'Incorrect. Great energy, but it’s like herding cats with you. Let’s focus.';

      div.innerHTML = `<strong>${index + 1}. ${icon} The correct answer is: ${item.answer}.</strong> ${feedbackText}`;
      feedbackContainer.appendChild(div);
    });

    feedbackContainer.style.display = 'block';
  } catch (error) {
    console.error('Error submitting answers:', error);
    alert('Failed to submit answers. Please try again.');
  }
});


// Exercise 4: Generate story with blanks for prepositions
document.getElementById('generate-story').addEventListener('click', async () => {
  console.log('Generate story with blanks button clicked');
  try {
    const response = await fetch('/generate-story');
    const data = await response.json();
    console.log('Story received:', data);

    const form = document.getElementById('exercise-form-4');
    const container = document.getElementById('story-container');
    container.innerHTML = '';

    const storyParts = data.story.split('___');
    const storyHtml = storyParts.map((part, index) => {
      if (index < storyParts.length - 1) {
        return `${part}<input type="text" name="answer${index}" class="blank">`;
      }
      return part;
    }).join('');

    const div = document.createElement('div');
    div.innerHTML = storyHtml;
    container.appendChild(div);

    const storyTemplateInput = document.createElement('input');
    storyTemplateInput.type = 'hidden';
    storyTemplateInput.name = 'storyTemplate';
    storyTemplateInput.value = data.story;
    form.appendChild(storyTemplateInput);

    form.style.display = 'block';
  } catch (error) {
    console.error('Error fetching story:', error);
    alert('Failed to generate story. Please try again.');
  }
});

document.getElementById('exercise-form-4').addEventListener('submit', async (event) => {
  event.preventDefault();
  console.log('Story answers submitted');

  try {
    const formData = new FormData(event.target);
    const answers = {};
    formData.forEach((value, key) => {
      if (key.startsWith('answer')) {
        answers[key] = value;
      }
    });

    const storyTemplate = formData.get('storyTemplate');

    console.log('Answers:', answers);
    console.log('Story Template:', storyTemplate);

    const response = await fetch('/evaluate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, storyTemplate })
    });

    const feedback = await response.json();
    console.log('Feedback received:', feedback);

    const feedbackContainer = document.getElementById('feedback-container-4');
    feedbackContainer.innerHTML = '';

    feedback.forEach((item, index) => {
      const div = document.createElement('div');
      const feedbackText = item.correct ? 'Correct' : 'Incorrect';
      div.innerHTML = `${index + 1}. ${item.sentence} - 
      <span class="feedback ${item.correct ? 'correct' : 'incorrect'}">${feedbackText}: ${item.explanation}</span>`;
      feedbackContainer.appendChild(div);
    });

    feedbackContainer.style.display = 'block';
  } catch (error) {
    console.error('Error submitting answers:', error);
    alert('Failed to submit answers. Please try again.');
  }
});



