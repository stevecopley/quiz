let quiz = {
    'title': 'Quiz',
    'language': null,
    'questions': [],
    'current': 0
}

let feedbackTimeout = null;


showdown.setOption( 'customizedHeaderId', true );
const converter = new showdown.Converter();


async function initialiseQuiz() {
    loadQuizList();

    if( sessionStorage.getItem( 'currentQuiz' ) ) {
        loadQuiz( sessionStorage.getItem( 'currentQuiz' ) );
    }
    else {
        sessionStorage.clear();
    }
}


async function loadQuizList() {
    const title = document.getElementById( 'title' );
    const infoBlock = document.getElementById( 'info' );
    const quizBlock = document.getElementById( 'quiz' );
    const menuBlock = document.getElementById( 'main-nav-links' );

    title.innerHTML = 'Select a Quiz';
    infoBlock.className = 'show';
    quizBlock.className = 'hide';

    // Load the file
    quizzes = await getJSON( 'quizzes/list.json' );
    if( !quizzes ) return;

    // Clear out current nav menu items
    const menuItems = document.querySelectorAll( '.main-nav-section' );
    menuItems.forEach( item => { item.remove(); } );

    // Work thru the quiz types and build the main nav from them
    Object.entries( quizzes ).forEach( ([quizType, quizList]) => {
        const menuSection = document.createElement( 'li' );
        menuSection.className = 'main-nav-section';
        menuSection.innerHTML = quizType;
        menuBlock.appendChild( menuSection );

        if( quizList ) {
            const menuItems = document.createElement( 'ul' );
            menuSection.appendChild( menuItems );

            Object.entries( quizList ).forEach( ([quizName, quizURL]) => {
                const menuItem = document.createElement( 'li' );
                const menuLink = document.createElement( 'a' );
                menuItems.appendChild( menuItem );
                menuItem.appendChild( menuLink );
                menuLink.textContent = quizName;
                menuLink.href = '#';
                menuLink.addEventListener( 'click', () => { 
                    sessionStorage.setItem( 'currentQuestion', 0 );
                    loadQuiz( quizURL ); 
                } );
            } );    
        }
    } );
}


async function loadQuiz( url ) {
    const title = document.getElementById( 'title' );
    const infoBlock = document.getElementById( 'info' );

    // Load the file
    const quizMD = await getMarkdown( 'quizzes/' + url );
    if( !quizMD ) {
        sessionStorage.clear();
        initialiseQuiz();
        return;
    }

    // Tidy up
    closeMenu();
    infoBlock.className = 'hide';

    // Break it up based on HRs
    mdBlocks = quizMD.split( '---' );

    // First block contains our title as an H1 and other info, seperated by '--'?
    if( mdBlocks[0].trim().substring( 0, 2 ) == '# ' ) {
        const quizInfoBlock = mdBlocks.shift().trim();
        const quizInfo = quizInfoBlock.split( '--' );
        // First part is an H1 and is the title
        quiz.title = quizInfo[0].trim().substring( 2 );
        // Second part is the language if relevant
        if( quizInfo[1] ) quiz.language = quizInfo[1].trim();
    }
    
    title.innerHTML = quiz.title;
    quiz.questions = [];

    // Work thru the questions
    mdBlocks.forEach( block => {
        // Break up the question into parts based on '--'
        parts = block.trim().split( '--' );

        // First part is always the question
        let question = { 'question': parts[0].trim() };
        // Second is always the answers (if present)
        if( parts[1] ) question['answers'] = parts[1].trim();
        // Third is always the correct answer (if present)
        if( parts[2] ) question['correct'] = parseInt( parts[2].trim() );
        // Forth is always the feedback (if present)
        if( parts[3] ) question['feedback'] = parts[3].trim();
        // And add it to the question list
        quiz.questions.push( question );
    } );

    // Build the progress bar
    buildQuestionNav();

    sessionStorage.setItem( 'currentQuiz', url );
    showQuestion( sessionStorage.getItem( 'currentQuestion' ) ? sessionStorage.getItem( 'currentQuestion' ) : 0 );
}

async function getMarkdown( url ) {
    const response = await fetch( url );
    if( response.status !== 200 ) return null;
    const md = await response.text();
    return md;
}


async function getJSON( url ) {
    const response = await fetch( url );
    if( response.status !== 200 ) return null;
    const json = await response.json();
    return json;
}


function closeMenu() {
    // Close the mobile menu
    const menuToggle = document.getElementById( 'toggle' );
    if( menuToggle ) menuToggle.checked = false;
   
    // Close desktop menu
    const dropdowns = document.querySelectorAll( '.main-nav-section' );
    dropdowns.forEach( dropdown => {
        // Ignore mouse for a short time to remove :hover state
        dropdown.style.pointerEvents = 'none';
        // Then re-enable
        setTimeout( () => { dropdown.style.pointerEvents = 'all'; }, 100 );
    } );
}

function buildQuestionNav() {
    const questionMarkers = document.getElementById( 'question-markers' );
    questionMarkers.innerHTML = '';

    // Work through all the questions in the list
    for( let i = 0; i < quiz.questions.length; i++ ) {
        const questionIndicator = document.createElement( 'li' );
        if( i == 0 ) {
            const icon = document.createElement( 'img' );
            icon.src = 'images/info.svg';
            questionIndicator.appendChild( icon );
        }
        else {
            questionIndicator.innerHTML = i;
        }
        questionIndicator.addEventListener( 'click', () => { showQuestion( i ); } );
        questionMarkers.appendChild( questionIndicator );
    }

    // Link to go to previous question
    const prevIndicator = document.getElementById( 'prev-question' );
    prevIndicator.addEventListener( 'click', prevQuestion );

    // Link to go to next question
    const nextIndicator = document.getElementById( 'next-question' );
    nextIndicator.addEventListener( 'click', nextQuestion );
}


function prevQuestion() {
    if( currentQuestion > 0 ) showQuestion( currentQuestion - 1 );
}


function nextQuestion() {
    if( currentQuestion < quiz.questions.length - 1 ) showQuestion( currentQuestion + 1 );
}


function showQuestion( qNum ) {
    const quizBlock = document.getElementById( 'quiz' );
    const quesBlock = document.getElementById( 'question' );
    const answBlock = document.getElementById( 'answers' );
    const feedback = document.getElementById( 'feedback' );
    const message  = document.getElementById( 'feedback-message' );
 
    quizBlock.className = 'show';
    feedback.className = 'hide';

    // Force question no. into valid range
    qNum = Math.min( Math.max( 0, qNum ), quiz.questions.length - 1 );

    // Pick out the question
    const question = quiz.questions[qNum];

    // Show it to the user
    quesBlock.innerHTML = converter.makeHtml( question['question'] );
    answBlock.innerHTML = question['answers'] ? converter.makeHtml( question['answers'] ) : '';
    message.innerHTML = question['feedback'] ? converter.makeHtml( question['feedback'] ) : '';

    // Sort out the syntax highlighting for inline as well as blocks of code
    const codeBlocks = document.querySelectorAll( 'code' );
    codeBlocks.forEach( block => { 
        block.classList.add( quiz.language ); 
        block.classList.add( 'language-' + quiz.language ); 
    } );
    Prism.highlightAll();

    // Add event handlers to answers
    const answers = answBlock.querySelectorAll( 'li' );
    for( let i = 0; i < answers.length; i++ ) {
        answers[i].addEventListener( 'click', () => { checkAnswer( i + 1 ); } );
    }

    // Update progress bar
    updateQuestionNav( qNum );

    // Save where we're at
    currentQuestion = qNum;  
    sessionStorage.setItem( 'currentQuestion', qNum );      
}


function updateQuestionNav( qNum ) {
    const maxQ = quiz.questions.length - 1;

    if( qNum < 0 || qNum > maxQ  ) return;

    const markers = document.getElementById( 'question-markers' ).children;

    // Clear out previous config
    for( const marker of markers ) marker.className = '';

    // Show the markers around the current
    const qFirst = Math.min( Math.max( 0, qNum - 1 ), Math.max( 0, maxQ - 3 ) );
    const qLast  = Math.min( Math.max( 3, qNum + 1 ), maxQ );
    for( i = qFirst; i <= qLast; i++ ) {
        markers.item( i ).className = 'show';
    }

    // Always show the ends of the range
    markers.item( 0 ).className    = 'show';
    markers.item( maxQ ).className = 'show';
    if( qFirst >= 2 )       markers.item( 0 ).classList.add( 'start' );
    if( qLast <= maxQ - 2 ) markers.item( maxQ ).classList.add( 'end' );

    // Highlight current
    markers.item( qNum ).className = 'show current';
}


function checkAnswer( aNum ) {
    const feedback = document.getElementById( 'feedback' );
    const answerList = document.getElementById( 'answers' ).querySelector( 'ol' );
    const answers = answerList ? answerList.querySelectorAll( 'li' ) : null;

    if( aNum == quiz.questions[currentQuestion].correct ) {
        if( feedbackTimeout ) {
            clearTimeout( feedbackTimeout );
            feedbackTimeout = null;
        }
        feedback.className = 'show correct';
        if( answers ) {
            answers.forEach( answer => { answer.className = 'wrong'; } );
            answers[aNum-1].className = 'correct';
        }
    }
    else {
        feedback.className = 'show wrong';
        feedbackTimeout = setTimeout( () => { feedback.className = 'hide'; }, 2000 );
        if( answers ) answers[aNum-1].className = 'wrong';
    }
}

