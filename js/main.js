const CATEGORY_URL = 'https://opentdb.com/api_category.php'

let quiz;

const selectedQuestionOption = document.querySelector('#num_selector')
const selectedCategoryOption = document.querySelector('#category_selector')
const selectedDifficultyOption = document.querySelector('#difficulty_selector')
const selectedOptionType = document.querySelector('#option-type_selector')
let selectOption = "";
const length = 20;
let counter = 0
while (counter < length) {
        selectOption += `<option value="${counter + 1}">${counter + 1}</option>`;
        counter++;
}
selectedQuestionOption.innerHTML = selectOption;

const startQuiz = async (e) => {
    const numOfQuestions = document.querySelector('#num_selector')
    const selectedCategory = document.querySelector('#category_selector')
    const difficulty = document.querySelector('#difficulty_selector')
    const selectedOptionType = document.querySelector('#option-type_selector')
    const welcome = document.querySelector('#welcome')
    const quizSection = document.querySelector("#quiz_section")
    const quizStartBtn = document.querySelector("#start_quiz")
    const isTimed = document.getElementById('is-timed')
    
    quizStartBtn.textContent = "Getting Questions..."
    quizStartBtn.style.width = '200px'
    quiz = new Quiz({
        numOfQuestions: +numOfQuestions.value,
        selectedCategory: selectedCategory.value,
        difficulty: difficulty.value,
        selectedOptionType: selectedOptionType.value,
        isTimed: isTimed.checked
    })
    
    try {
        await quiz.getQuestionsFromApi()
        quiz.beginQuiz()
        // await quiz.handleQuizCategory()
        quizStartBtn.textContent = "Start Quiz"
    }catch(err) {
        quizStartBtn.textContent = "Start Quiz"
        console.log(err)
    }
    
    const getDataFromLocal = JSON.parse(localStorage.getItem('UserChoice'))
    console.log(getDataFromLocal)
    if(getDataFromLocal.length > 0) {
        welcome.classList.add("display");
        quizSection.classList.remove("display")
    }else{
        window.alert('The Question combination you selected is unavailable, please select another one')
        welcome.classList.add("display");
    } 
}

const prevQuestion = () => {
    quiz.handlePrevQuestion()
}

const handleSubmit = () => {
    quiz.endQuiz()
}

const nextQuestion = () => {
    quiz.handleNextQuestion()
}

const chosenAnswer = (event) => {
    const answer = event.target.value
    quiz.selectedAnswer(answer)
}

const handleQuizCategory = async () => {
    try {
        let selectCategoryOption = ""
        const res = await fetch(`${CATEGORY_URL}`)
        const data = await res.json()
        selectCategoryOption = data?.trivia_categories.map((item) => {
            return `<option value="${item.id}">${item.name}</option>`
        })
        selectedCategoryOption.innerHTML = selectCategoryOption
    }catch(err) {
        console.log(err)
    }
}
handleQuizCategory()

const handleQuizDifficulty = async () => {
    try {
        let selectDifficultyOption = ""
        const res = await fetch('https://opentdb.com/api.php?amount=20')
        const data = await res.json()
        selectDifficultyOption = data?.results.map(item => item.difficulty)
        let newArray = selectDifficultyOption.filter((item, index) => selectDifficultyOption.indexOf(item) === index)
        let htmlDiffOption = newArray.map((i) => {
            return `<option>${i}</option>`
        })
        selectedDifficultyOption.innerHTML = htmlDiffOption
    }catch(err) {
        console.log(err)
    }
}
handleQuizDifficulty()

const handleQuizOptionType = async () => {
    try {
        let selectOptionType = ""
        const res = await fetch('https://opentdb.com/api.php?amount=20')
        const data = await res.json()
        console.log(data?.results)
        selectOptionType = data?.results.map(item => item.type)
        let newArray = selectOptionType.filter((item, index) => selectOptionType.indexOf(item) === index)
        let htmlDiffOption = newArray.map((i) => {
            return `<option>${i}</option>`
        })
        selectedOptionType.innerHTML = htmlDiffOption
    }catch(err) {
        console.log(err)
    }
}
handleQuizOptionType()

const welcomePage = () => {
    const welcome = document.getElementById("welcome")
    const quizSummary = document.getElementById("quizSummary")
    quiz = undefined;
    welcome.classList.remove('display')
    quizSummary.classList.add('display')
}