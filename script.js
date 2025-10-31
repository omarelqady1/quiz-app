// Api URL = https://opentdb.com/api.php?amount=50&category=9&difficulty=easy&type=multiple
'use strict'


const formElement = document.getElementById('loginForm');
const container = document.querySelector('.container');

class User{
    #name;
    #score;
    constructor()
    {
        this.name = null;
        this._score = 0;
    }

    _setName(name)
    {
        this.#name = name;
    }
    _setScore(score)
    {
        this.#score = score;
    }

    getName()
    {
        return this.#name;
    }
    
    getScore()
    {
        return this.#score;
    }
}

class Questions
{
    async loadQuestions()
    {
        try{
            const data = await fetch('https://opentdb.com/api.php?amount=50&category=9&difficulty=easy&type=multiple');
            const response = await data.json();
            return response.results;
        }
        catch(err)
        {
            console.log(err.message);
            return[];
        }
    }
}




class App{
    #user = new User();
    #answers = [];
    #correctAnswers = [];
    _questions;
    #currIndex = 0;
    #score = 0;
    #optionsPerQuestion = [];


    constructor()
    {
        formElement.addEventListener('submit' , async function(e){
            e.preventDefault();
            const name = document.querySelector('#username').value;
            this.#user._setName(name);

            await this.init();
            this._generateQuestion(this._questions[this.#currIndex]);
        }.bind(this));
        
        console.log(this._questions);
    }
    
    async init()
    {
        await this._fetchQuestions();
    }
    
    async _fetchQuestions()
    {
        const questionInstance = new Questions();
        const data = await questionInstance.loadQuestions();
        this._questions = this._getRandomQuestions(data , 10);
        console.log(this._questions);
    }
    
    _getRandomQuestions(arr, count) {
        const selected = [];
        const usedIndices = new Set();
        
        while (selected.length < count) {
            const randomIndex = Math.floor(Math.random() * arr.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                selected.push(arr[randomIndex]);
            }
        }
        return selected;
    } 

    _restartQuiz()
    {
        this.#currIndex = 0;
        this._generateQuestion(this._questions[this.#currIndex]);
    }

      
    _generateQuestion(question , showAnswer = false)
    {
        if(this.#currIndex === 10){
            container.innerHTML =  `
            <div class="results-container" id="resultsSection">
                <div class="results-box">
                <h2 class="results-title">🏁 Quiz Finished!</h2>

                <p class="results-score">
                    You scored 
                    <span class="results-score-value">${this.#score}</span> / 
                    <span class="results-total">${10}</span>
                </p>

                <div class="results-buttons">
                    <button class="btn results-btn" id="showCorrectAnswersBtn">Show Correct Answers</button>
                    <button class="btn results-btn" id="restartQuizBtn">Restart Quiz</button>
                </div>
                </div>
            </div>
            `;

            document.querySelector('#restartQuizBtn').addEventListener('click' , this._restartQuiz.bind(this));
            document.querySelector('#showCorrectAnswersBtn').addEventListener('click' , this._showCorrectAnswers.bind(this));
            console.log("ues");

            return;
        }
         let options;

        if (showAnswer) {
            options = this.#optionsPerQuestion[this.#currIndex];
        } else {
            options = [question.correct_answer, ...question.incorrect_answers]
            .sort(() => Math.random() - 0.5);
            this.#optionsPerQuestion[this.#currIndex] = options;
            this.#correctAnswers.push(options.findIndex(el => el === question.correct_answer));
        }
        
        
        container.innerHTML = '';
        const markup = 
        `
        <div class="quiz-container hidden" id="quizContainer">
        <div class="quiz-box">
        <h2 class="question-text" id="questionText">${question.question}</h2>
        
        <form id="answersForm" class="answers">
        ${options.map((ans , i) =>{
            if (showAnswer) {
                return `
                <label class="answer-option review-${this._checkAnswer(i)}">
                <input type="radio" name="answer" value="${i+1}" disabled />
                <span>${ans}</span>
        </label>
                `;
            }
            else{
                return` <label class="answer-option">
                <input type="radio" name="answer" value = "${i+1}" class = "input__ans"/>
                <span>${ans}</span>
                </label>
                `
            }
            
        }         
    ).join('')}
    </form>
    <button id="nextBtn" class="btn next-btn">${showAnswer
        ? (this.#currIndex === 9 ? 'Done' : 'Next Question')
        : (this.#currIndex === 9 ? 'Finish Quiz' : 'Next')}</button>
        
        </div>
        </div>
        `
        container.insertAdjacentHTML('afterbegin' , markup);
        console.log(options);
        
        let ansIndex;
        document.querySelector('#answersForm').addEventListener('change' , function(e){
            const ans = e.target.closest('.input__ans');
            if(!ans)return;
            ansIndex = +ans.value-1;
            console.log(ans.value);
        }.bind(this));

        
        document.querySelector('#nextBtn').addEventListener('click'   , async function(){
            if(showAnswer && this.#currIndex === 9){
                this._generateLastMarkup();
                return;
            }
            if(showAnswer){
                this.#currIndex++;
                this._generateQuestion(this._questions[this.#currIndex] , showAnswer);
                return;
            }
            if(!(ansIndex+1)){
                alert('Please Choose An Answer');
                return;
            }
            this.#currIndex++;
            this.#answers.push(ansIndex);
            
            if(options[ansIndex] === question.correct_answer){
                this.#score++;
            }

            
            this._generateQuestion(this._questions[this.#currIndex]);
            console.log(this.#answers);
        }.bind(this))

    }

    _showCorrectAnswers()
    {
        this.#currIndex = 0;
        this._generateQuestion(this._questions[this.#currIndex] , true);
    }

    _checkAnswer(idx)
    {
        if (idx === this.#correctAnswers[this.#currIndex] && idx === this.#answers[this.#currIndex]) {
             return 'correct'; 
            } else if (idx !== this.#correctAnswers[this.#currIndex] && idx === this.#answers[this.#currIndex]) {
                return 'wrong'; 
            }
            if (idx === this.#correctAnswers[this.#currIndex]) {
                return 'correct';
            }
            return '';
    }

    async _startNewQuiz()
    {
        this.#answers = [];
        this.#correctAnswers = [];
        this._questions;
        this.#currIndex = 0;
        this.#score = 0;
        await this.init();
        this._generateQuestion(this._questions[this.#currIndex]);
    }

    _generateLastMarkup()
    {
        const markup = 
        `

    
        <div class="ty-box">
            <h2 class="ty-title">🎉 Thank you for solving the quiz ${this.#user.getName()}</h2>


            <div class="ty-actions">
            <button class="ty-start-btn" id="startNewQuizBtn">Start New Quiz</button>
            </div>
        </div>


        `
        container.innerHTML = '';
        container.insertAdjacentHTML('afterbegin' , markup);

        document.querySelector('#startNewQuizBtn').addEventListener('click' , this._startNewQuiz.bind(this));
    }
    
}


const app = new App();