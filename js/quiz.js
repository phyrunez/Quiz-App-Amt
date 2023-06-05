const API_URL = 'https://opentdb.com/api.php'

const SECONDS_PER_QUESTIONS = 10

class Quiz {
    constructor({ numOfQuestions, selectedCategory, difficulty, selectedOptionType, isTimed } = {}) {
        this.numOfQuestions = numOfQuestions > 20 ? 20 : numOfQuestions
        this.isTimed = isTimed || false;
        this.selectedCategory = selectedCategory;
        this.difficulty = difficulty
        this.selectedOptionType = selectedOptionType;
        this.curQuestionIndex = 0;
        this.answers = [];
        this.questionNumber = document.querySelector('#question_number')
        this.questionH1 = document.querySelector('.question_h1')
        this.optionsContainer = document.querySelector('#options_container')
        this.nextBtn = document.querySelector('#next')
        this.prevBtn = document.querySelector('#prev')
        this.submitBtn = document.querySelector('#submit')
        this.quizSummaryPage = document.querySelector('#quizSummary')
        this.quizSection = document.querySelector('#quiz_section')
        this.homePage = document.querySelector('#welcome')
        this.correctScore = document.querySelector('#correct_score')
        this.wrongScore = document.querySelector('#wrong_score')
        this.totalScore = document.querySelector('#total_score')
        this.restartBtn = document.querySelector('#restart_quiz')
        this.welcomeBtn = document.querySelector("#welcome-page")
        this.timerEl = document.querySelector("#timer")
    }

    getQuestionsFromApi() {
        return new Promise((resolve, reject) => {
            fetch(`${API_URL}?amount=${this.numOfQuestions}&category=${this.selectedCategory}&difficulty=${this.difficulty}&type=${this.selectedOptionType}`)
            .then(resp => {
                const data = resp.json()
                return data
            })
            .then(data => {
                console.log(data?.results)
                const transformedResp = data?.results.map((item) => {
                    const options = this.shuffleOptions([...item.incorrect_answers, item.correct_answer])
                    return {...item, options, selectedAnswer: "" }
                })
                this.questions = transformedResp
                this.curQuestion = this.questions[this.curQuestionIndex]
                resolve({})
                localStorage.setItem('UserChoice', JSON.stringify(data?.results))
            })
            .catch(err => {
                reject({})
                alert(err)
            })
        })
    }

    beginQuiz() {
        this.time = this.numOfQuestions * SECONDS_PER_QUESTIONS
        this.timeInMill = this.time * 1000
        if(this.isTimed) {
            this.timer = setTimeout(() => this.endQuiz(), this.timeInMill)
            this.interval = setInterval(() => this.setTimer(), 1000)
        }
        this.loadQuestions()
    }

    handleNextQuestion() {
        this.nextBtn.setAttribute("disabled", true);
        if(this.curQuestionIndex >= this.numOfQuestions) return
        this.prevBtn.removeAttribute("disabled");
        this.curQuestionIndex++
        this.curQuestion = this.questions[this.curQuestionIndex]
        this.loadQuestions()
        if(this.questions[this.curQuestionIndex].selectedAnswer !== "") this.nextBtn.removeAttribute("disabled")
    }

    handlePrevQuestion() {
        if(!this.curQuestionIndex) {
            this.prevBtn.setAttribute("disabled", true);
            return
        }
        this.nextBtn.removeAttribute("disabled");
        this.curQuestionIndex--
        this.curQuestion = this.questions[this.curQuestionIndex]
        this.loadQuestions()
    }

    selectedAnswer(answer) {
        this.questions[this.curQuestionIndex].selectedAnswer = answer
        this.answers[this.curQuestionIndex] = answer.toLowerCase() === this.questions[this.curQuestionIndex].correct_answer.toLowerCase()
        if (this.numOfQuestions > 1 && this.numOfQuestions !== this.answers.length) {
            this.nextBtn.removeAttribute("disabled")
        }
        if(this.numOfQuestions === this.answers.length) {
            this.submitBtn.removeAttribute("disabled")
        }
        console.log(this.questions[this.curQuestionIndex], answer)
    }

    endQuiz() {
        this.correctAnswers = this.answers.filter(ans => Boolean(ans)).length
        this.wrongAnswers = this.numOfQuestions - this.correctAnswers
        this.quizSection.classList.add('display');
        this.correctScore.textContent = this.correctAnswers;
        this.wrongScore.textContent = this.wrongAnswers;
        this.totalScore.textContent = this.numOfQuestions;
        this.quizSummaryPage.classList.remove('display');
        if(this.timer) {
            clearTimeout(this.timer);
            clearInterval(this.interval);
        }
    }

    shuffleOptions(options) {
        for (let i = options.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * i)
            const temp = options[i]
            options[i] = options[j]
            options[j] = temp
          }
        return options;
    }

    loadQuestions() {
        this.questionNumber = document.querySelector('#question_number')
        this.questionNumber.textContent = this.curQuestionIndex + 1;
        this.questionH1.textContent = this.curQuestion.question.replace(/&quot;/g,'"', /&#039;/g,"'")
        let options = ''
        this.curQuestion.options.forEach((i) => {
            const isSelected = this.curQuestion.selectedAnswer === i
            options += `<div class="option">   
                            <input type="radio" name="answer" value="${i}" onchange="chosenAnswer(event)" class=${isSelected ? "checked-answer" : "unchecked-answer"} />
                            <label for="questionA" class="adjustLabel">${i}</label>
                        </div>`
        })
        this.optionsContainer.innerHTML = options;
        const selectedOptionElement = document.querySelector(".checked-answer")
        if(selectedOptionElement){
            selectedOptionElement.setAttribute(
                "checked" , true
            )
        }

        if(!this.isTimed) {
            this.timerEl.classList.add('display')
        }else {
            this.setTimer(false)
        }
    }

    setTimer(reduceTime = true) {
        if(reduceTime) this.time -= 1
        let minutes = Math.floor(this.time / (60));
        let seconds = this.time > 60 ? this.time % 60 : this.time
        if(minutes.toString().length === 1) minutes = minutes.toString().padStart(2, 0)
        if(seconds.toString().length === 1) seconds = seconds.toString().padStart(2, 0)
        this.timerEl.innerHTML = `${minutes}:${seconds}`
    }
}
