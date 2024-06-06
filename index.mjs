import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

const openai = new OpenAI({
  apiKey: 'sk-proj-jzBI4eFDxedk20lKgkqPT3BlbkFJkqw0hpeqZS6YkjwGZrgu',
});

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});


// Ex 1: Fill in the blank
app.get('/generate-sentences-1', async (req, res) => {
  const prompt = "Generate five sentences with a blank for prepositions,\
  Contain different type of preposition, including: Prepositions of Time, Prepositions of Place, Prepositions of Movement and Direction, Prepositions of Possession and Association, Other Prepositionswith difficulty increasing from level 1 to level 5, each sentence having only 01 blank.\
  Here are the examples for each level:\
  'People listened to a lot of jazz ___ the 1920s. Answer: During\
  The shop is right ___ the apartment. Answer: Beneath\
  A big pile of clothes was on the floor so she had to walk ___ it. Answer: Around.\
  They allocated a budget ___ renovation of the public library. Answer: Toward\
  He talked ___ enthusiasm. Anwswer: with\
  Noted: When answering, please provide sentences only, no need words of exchange information or numbering the sentences.\
  Ensure they are formatted without any unnecessary empty lines or gaps between them.";

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const sentences = chatCompletion.choices[0].message.content.trim().split('\n').map(sentence => sentence.trim());
    res.json({ sentences });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/evaluate-answers-1', async (req, res) => {
  const { answers, sentences } = req.body;

  const evaluationPromises = sentences.map(async (sentence, index) => {
    const answer = answers[`answer${index}`];
    const sentenceWithAnswer = sentence.replace('___', answer);
    const prompt = `Evaluate the following sentence with a preposition filled in: "${sentenceWithAnswer}". Is the preposition usage correct? Start your response with "Correct" or "Incorrect" and explain briefly in less than 20 words. For example, if the sentence is 'The cat is sleeping on the bed.', your response should be: 'Correct, "on" accurately indicates the surface where the cat is sleeping, fitting both grammatically and contextually.`;

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      });

      const evaluation = chatCompletion.choices[0].message.content.trim();

   
      const isCorrect = evaluation.toLowerCase().startsWith('correct');
      const isIncorrect = evaluation.toLowerCase().startsWith('incorrect');
      const correct = isCorrect && !isIncorrect;


      const explanation = evaluation.replace(/^(Correct|Incorrect)\s*[:,]?\s*/i, '').trim();

      return { sentence: sentenceWithAnswer, userAnswer: answer, correct, explanation };
    } catch (error) {
      console.error('Error:', error);
      return { sentence: sentenceWithAnswer, userAnswer: answer, correct: false, explanation: 'Error in evaluation.' };
    }
  });

  const evaluations = await Promise.all(evaluationPromises);
  res.json(evaluations);
});

///

// Exercise 2: Analyze prepositions in a sentence
app.post('/analyze-prepositions', async (req, res) => {
  const { sentence } = req.body;
  const prompt = `Detect and analyze all of the prepositions in the following content: "${sentence}".\
  When answering, please provide the explaination only, no need  words of exchange information or numbering the sentences.\
  Make it less than 100 word and use simple wording choice for english learning beginer. DO NOT REPEAT THE INPUT SENTENCES.\
  Answer Format: 'Preposition' + 'its function'
  \
  \
  \
  Please remember and well-noted: There are types of preposition:\
    1. Preposition of time: a word that helps indicate a specific time period, such as a date on the calendar, a day of the week, or the time at which something occurs. The three main prepositions of time—“at,” “on,” and “in”—are essential for expressing different aspects of time. “At” is used for specific times like hours, minutes, precise times of the day, and holidays lasting two or more days, such as Christmas or Easter. “On” is used for days of the week, specific dates, and one-day holidays or festivals like Independence Day. “In” is used for months, seasons, years, decades, centuries, and lengths of time, such as “in the past” or “in an hour.” Additionally, there are other prepositions of time like “by,” “until,” “from…to,” “since,” “for,” “before,” “after,” “during,” “between,” “within,” and “past,” each serving unique purposes in time-related expressions. However, certain time expressions, such as “tomorrow,” “today,” “yesterday,” “tonight,” and phrases with “this,” “last,” “next,” and “every,” do not require a preposition at all.'
    2. Prepositions of Place: are used to indicate the location or position of someone or something. Based on their meaning, these prepositions can be categorized into five groups. The first group includes prepositions that show location, such as “on,” “at,” and “in.” The second group encompasses prepositions indicating horizontal position, including “above,” “over,” “below,” “under,” “on,” and “beneath.” The third group consists of prepositions that denote distance, such as “near,” “beside,” “next to,” “by,” and “beyond.” The fourth group contains prepositions used to show direction, like “up,” “down,” “in front of,” and “behind.” Finally, the fifth group includes prepositions for enclosed areas, such as “in,” “within,” “inside,” and “outside.” \
    3. Prepositions of Direction and Movement, as their names suggest, show a movement from one place to another or indicate a particular direction. These prepositions are used to describe the movement of a person or object from one place to another and are always associated with motion, typically used with verbs of motion. \
    They are especially useful when giving directions, describing a location, or providing spatial orientation.\
     Based on their meaning, prepositions of direction and movement can be classified into two groups: prepositions that show the destination of a movement and prepositions that show movement relative to something else. For example, in “The manager walked into the office,” the noun after the preposition ‘into’ shows the destination, which is ‘the office,’ while “The manager walked around the office” means that ‘the manager’ was already in the office and moved throughout it. Common prepositions of movement and direction include: “across,” “along,” “past,” “around,” “through,” “up,” “down,” “into,” “out of,” “off,” “onto,” “over,” “under,” “toward,” “to,” and “away from.” Each preposition has a specific function: “Across” shows movement from one side to another, such as “She walked across the street.” “Along” indicates movement in a linear direction, like “Joe and Molly walked along the street.” “Past” denotes movement to the further side of something, for example, “The bookstore is just past the pharmacy.” “Around” (or “round” in British English) suggests movement in a curved line, as in “The children ran around the living room.” “Through” implies movement into one side and out of the other, as seen in “The train went through a tunnel.” “Up” and “down” are used to describe movement to higher or lower positions, respectively, such as “He pulled his socks up” and “We started running down the hill.” “Into” shows a direction towards a position inside something, like “Mary walked into the house,” while “out of” is its opposite, as in “Jessica is coming out of the building.” “Off” indicates separation or removal, as in “Try not to fall off the ladder.” “Onto” shows movement to a surface or position, like “We went onto the roof to fix the antenna.” “Over” suggests movement from one side to another, such as “Let’s walk over that bridge.” “Under” is used to describe a lower position, for example, “The basement is located under the first floor.” “Toward” (or “towards”) shows movement in the direction of something, like “I was walking toward the door.” “To” indicates movement in the direction of something, synonymous with “toward,” as in “She walked to school.” “Away from” shows movement in the opposite direction, such as “She drove away from her house quickly.” Understanding these prepositions and their specific uses can greatly enhance your ability to describe movement and direction accurately in English.
    5. Prepositions are used to convey various relationships between elements in a sentence, including comparison, contrast, purpose, \
    intention, manner, and more. Prepositions of comparison and contrast help in analyzing qualities and characteristics of two or more entities. \
    For example, “beside” in “She always felt lazy beside her overachiever friend” compares her laziness to her friend’s achievements, \
    while “over” in “The company’s profits have increased significantly over its competitors” shows a comparison in performance. \
    To indicate similarity, prepositions like “as,” “like,” and “near to” are used, as in “Emma’s singing voice is as a bird’s melody.\
    ” Differences are highlighted using “from,” “unlike,” and “to,” such as “The results are different from expectations.” \
    Contrast is expressed with “amidst,” “despite,” and “in spite of,” for example, “She gave an excellent presentation despite feeling nervous.\
    ”Prepositions also show purpose and intention. “For” indicates purpose, as in “I bought a new bike for exercise,” while intention is expressed with “for” and “toward,” such as “I have a surprise for you.”\
     Manner is indicated by “with,” “by,” and “in,” like “He talked with enthusiasm.” Instruments used for actions are introduced by “with,” “by,” and “by means of,” such as “I wrote the letter with a pen.” \
     Mediums are indicated with “on,” “over,” “via,” and “through,” as in “I received the news via email.” Agency, or the performer of an action, is shown by “by,” like in “The plan was approved by the committee.”\
     Prepositions of origin and material show sources and composition, using “from,” “of,” “with,” and “(out) of,” such as “The necklace is made (out) of 18-karat gold.” Topics are introduced with “about,” “over,” “on,” “of,” “regarding,” “concerning,” “as per,” and “in terms of,” like “a movie about aliens.”\
      Inclusion and exclusion are marked by prepositions like “on,” “among,” “under,” “including,” “beyond,” “outside,” “beside,” “other than,” “except,” “but,” “excluding,” “aside from,” and “apart from,” for instance, “He is on the special task force” and “Everyone was invited to the party except Tom.\
      ”Cause and reason use “from,” “of,” “under,” “because of,” “due to,” “about,” “for,” “by virtue of,” “on account of,” and “owing to,” as in “The concert was cancelled due to the singer’s illness.” Consumption is expressed with “on,” such as “She’s on a gluten-free diet.” \
      Responsibility uses “on,” “with,” and “under,” like “This one’s on me.” Company and presence are shown with “with,” “on,” “plus,” and “along with,” as in “I’m at the mall with my friends.” Absence is indicated with “without,” \
      as in “I can’t believe he left without me.”Support and opposition use “with,” “for,” “behind,” “against,” “versus,” and “up against,” like “I said I’ll be with you no matter the consequences” and “The two teams will compete against each other on Sunday.” \
      Targets are indicated by “with,” “at,” and “on,” such as “The robbers started shooting at the guard.” Examples are introduced with “like” and “such as,” for instance, “I read world classics like War and Peace in my free time.”Stereotypes and attributions use “as,” “for,” “like,” “unlike,” “at,” and “of,” such as “Do you think of Shakespeare as a poet or as a playwright?” and “It was sweet of you to come.” Preferences use “over,” “before,” “above,” and “at the expense of,” like “I would always choose pizza over a burger.” Boundaries are indicated with “beyond,” “outside,” “past,” and “within,” as in “The decision is beyond my level of authority.” Amounts and approximate amounts are shown with “for,” “of,” “near,” and “close to,” like “There was an increase of 10% in child labor” and “It’s near 50 degrees in the summertime.”Levels and ranges use “at,” “from,” “beyond,” “over,” “above,” “below,” “under,” “from…to,” “throughout,” “within,” and “between,” such as “The hike starts at 6,000 feet above sea level” and “I’d watch anything from romance to horror.” Parameters are shown by “by,” “per,” “to,” and “in,” like “The books are sorted by year of publication.” Mathematics uses “plus,” “minus,” “less,” “by,” and “times,” for example, “Her paycheck this month was $2,000 less taxes.” Addition is expressed with “on,” “to,” “in addition to,” and “on top of,” like “Add some sugar to the coffee.”Exchange and substitution use “for,” “in return for,” “rather than,” and “instead of,” such as “I bought the poster for a dollar” and “I’ll have the salad instead of the fries.” Representation uses “for” and “on behalf of,” like “I speak for the families of students.” State and rank use “in,” “under,” “over,” “above,” “under,” and “below,” for instance, “The building is still under construction” and “Jenny works under the senior partner.” Change and condition use “to,” “into,” “toward,” “in case of,” and “in the event of,” such as “The caterpillar transformed into a beautiful butterfly” and “In case of an emergency, please call 911 immediately.” Sequence uses “after,” “before,” “following,” and “ahead of,” like “He went to work after finishing his breakfast.” Alignment and reference use “as per,” “in line with,” “in alignment with,” “according to,” and “with respect to,” such as “As per the contract, the project must be completed within six months” and “According to the weather forecast, it will be sunny and warm tomorrow.”
    `;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const analysis = chatCompletion.choices[0].message.content.trim();
    if (!analysis || analysis.toLowerCase().includes('no prepositions found') || analysis === '') {
      res.json({ analysis: "Your sentence does not contain prepositions, please check it again." });
    } else {
      res.json({ analysis });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/////


// Ex 3: Multiple-choice questions
app.get('/generate-exercise-3', async (req, res) => {
  const prompt = "Generate five multiple-choice sentences with a blank for prepositions and three options (a, b, c),\
  with difficulty increasing from level 1 to level 5, each sentence having only one blank. \
  Provide the correct answers as well. Format the response as follows:\
  \n\n1. Sentence ___.\n• a) option1\n• b) option2\n• c) option3\nAnswer: correct_option\n\n. \
  Numbering the sentence. Ensure they are formatted without any unnecessary empty lines or gaps between them.";

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = chatCompletion.choices[0].message.content.trim();
    const sentences = content.split('\n\n').map(block => {
      const [question, answer] = block.split('\nAnswer:');
      return { question: question.trim(), answer: answer.trim().charAt(0).toUpperCase() };
    });

    res.json({ sentences });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/evaluate-answers-3', async (req, res) => {
  const { answers, sentences } = req.body;

  const evaluationPromises = sentences.map(async (sentenceObj, index) => {
    const answer = answers[`answer${index}`].trim().toUpperCase();
    const correctAnswer = sentenceObj.answer;
    const isCorrect = answer === correctAnswer;
    const explanation = isCorrect ? 'Wow!!! You aced that like a pro! Your hard work totally paid off.' : 'Incorrect. Great energy, but it’s like herding cats with you. Let’s focus.';

    return { question: sentenceObj.question, userAnswer: answer, answer: correctAnswer, correct: isCorrect, explanation };
  });

  const evaluations = await Promise.all(evaluationPromises);
  res.json(evaluations);
});

/////
// Ex 4: Story Completion
app.get('/generate-story', async (req, res) => {
  const prompt = "Generate a short story with blanks for prepositions. Ensure the story only has exactly 08 blanks, again 08 blanks. Example: “Once upon a time, there was a little girl who lived ___ a small village. Every day, she walked ___ the woods to visit her grandmother. One day, she found a mysterious box ___ a tree. She opened it and found a key. She wondered what the key was ___ and decided to keep it ___ her pocket. Later that day, she saw an old chest ___ her grandmother’s attic. She used the key to open it and found treasure ___ gold coins and jewelry. She was very happy and shared the treasure ___ her family.” Answers: 1. in, 2. through, 3. under, 4. for, 5. in, 6. in, 7. of, 8. with. Just show me the passage only, no need words of informaiton";

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const story = chatCompletion.choices[0].message.content.trim();
    res.json({ story });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/evaluate-story', async (req, res) => {
  const { answers, storyTemplate } = req.body;

  const storyParts = storyTemplate.split('___');
  const evaluationPromises = Object.keys(answers).map(async (key, index) => {
    const userAnswer = answers[key];
    const sentenceWithAnswer = storyParts[index] + userAnswer + storyParts[index + 1];

    const prompt = `Evaluate the following sentence with a preposition filled in: "${sentenceWithAnswer}". Is the preposition usage correct? Start your response with "Correct" or "Incorrect" and explain why that preposition useage briefly in less than 30 words. Use easy words. Eg: Prepositions are serving to connect nouns, pronouns, or noun phrases to other words in a sentence, thereby indicating relationships such as time, place, direction, and manner. `;

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      });

      const evaluation = chatCompletion.choices[0].message.content.trim();
      const correct = evaluation.toLowerCase().startsWith('correct');
      const explanation = evaluation.replace(/^(Correct|Incorrect)\s*[:,]?\s*/i, '').trim();
      const correctPrepositionMatch = explanation.match(/"(.*?)"/);
      const correctPreposition = correctPrepositionMatch ? correctPrepositionMatch[1] : '';

      return { sentence: sentenceWithAnswer, userAnswer, correct, explanation, correctPreposition };
    } catch (error) {
      console.error('Error:', error);
      return { sentence: sentenceWithAnswer, userAnswer, correct: false, explanation: 'Error in evaluation.', correctPreposition: '' };
    }
  });

  const evaluations = await Promise.all(evaluationPromises);
  res.json(evaluations);
});









app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

