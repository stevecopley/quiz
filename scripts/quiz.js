// Holds the list of quizzes read from the config file
let quizzes = null;

// Main quiz object, holds current quiz data after laded from file
let quiz = {
    'title': 'Quiz',
    'language': null,
    'questions': [],
    'current': 0
}

// For tracking a timeout when needed
let feedbackTimeout = null;

// Showdown library options and convertor object
showdown.setOption( 'customizedHeaderId', true );
const converter = new showdown.Converter();


/** ***************************************************************
 * Pulls up the quiz list upon the first page load, then if a quiz is already
 * in progress, jumps to it
 */
async function initialiseQuiz() {
    const heading  = document.getElementById( 'main-heading' );
    const overview = document.getElementById( 'overview-link' );
    heading.addEventListener( 'click', showOverview );
    overview.addEventListener( 'click', showOverview );

    await loadQuizList();

    if( sessionStorage.getItem( 'currentQuiz' ) ) {
        loadQuiz( sessionStorage.getItem( 'currentQuiz' ) );
    }
    else {
        showOverview();
    }
}


/** ***************************************************************
 * Loads a list of quizzes from the master JSON list file and generates
 * the main nav based up the categories and quizzes loaded
 */
 async function loadQuizList() {
    const menuBlock = document.getElementById( 'main-nav-links' );

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


/**
 * Shows an overview of all quizzes, including any progress made during the
 * current session
 */
function showOverview() {
    const title = document.getElementById( 'title' );
    const infoBlock = document.getElementById( 'info' );
    const overBlock = document.getElementById( 'overview' );
    const quizBlock = document.getElementById( 'quiz' );
    const feedback  = document.getElementById( 'feedback' );

    // Setup UI
    closeMenu();
    title.innerHTML = 'Quiz Overview';
    infoBlock.className = 'show';
    overBlock.className = 'show';
    quizBlock.className = 'hide';
    feedback.className = 'hide';
    // Clear out previous
    overBlock.innerHTML = '';

    // We're no longer doing a quiz, so scrub it
    sessionStorage.removeItem( 'currentQuiz' );

    // Attempt to get progress from session
    let progress = sessionStorage.getItem( 'progress' );
    if( progress  ) progress = JSON.parse( progress );
    else            progress = {};

    // Work thru the quiz types and build the main nav from them
    Object.entries( quizzes ).forEach( ([quizType, quizList]) => {
        // Quiz type section header
        const typeHeading = document.createElement( 'h2' );
        typeHeading.textContent = quizType;
        overBlock.appendChild( typeHeading );

        // Quizzes for this type?
        if( quizList ) {
            // Yup, so start a list
            const quizTypeList = document.createElement( 'ul' );
            quizTypeList.className = 'overview-list';
            overBlock.appendChild( quizTypeList );

            // Run thru the quizzes in this category
            Object.entries( quizList ).forEach( ([quizName, quizURL]) => {
                const quizItem = document.createElement( 'li' );
                quizItem.innerText = quizName;

                // Has it been attempted this session?
                if( progress[quizURL] ) {
                    const questionList = document.createElement( 'ol' );
                    quizItem.appendChild( questionList );

                    // Prep stats for overall score calc.
                    let totalStars = 0;
                    let maxStars = 0;

                    // run thru the questions
                    Object.entries( progress[quizURL] ).forEach( ([qNum, questionInfo]) => {
                        const questionItem = document.createElement( 'li' );
                        questionItem.innerText = qNum;
                        // Style right/wrong based on attempts / correctness
                        questionItem.className = questionInfo.correct ? 'correct' : questionInfo.attempts > 0 ? 'wrong' : '';

                        // Setup stars
                        const starBlock = createStars( questionInfo.answers, true );
                        const numStars = getQuestionProgress( qNum, quizURL );
                        // Update stats for score calc
                        maxStars += questionInfo.answers;
                        totalStars += numStars;
                        // Alter class to show correct stars earned
                        starBlock.classList.remove( 'has0' );
                        starBlock.classList.add( 'has' + numStars );
                        questionItem.appendChild( starBlock );
                        // Can click directly to that question
                        questionItem.addEventListener( 'click', () => {
                            sessionStorage.setItem( 'currentQuestion', qNum );
                            loadQuiz( quizURL );
                        }, true );
                        questionList.appendChild( questionItem );
                    } );

                    // Calc the overall score, based on stars earned / max possible
                    const score = document.createElement( 'p' );
                    score.className = 'score';
                    score.innerText = `${Math.round( totalStars * 100 / maxStars )}%`;
                    quizItem.appendChild( score );
                }
                else {
                    // nope... no attempt made so far
                    const notStarted  = document.createElement( 'p' );
                    notStarted.innerText = 'Not attempted';
                    quizItem.appendChild( notStarted );
                }

                // Can click to the quiz
                quizItem.addEventListener( 'click', () => {
                    sessionStorage.setItem( 'currentQuestion', 0 );
                    loadQuiz( quizURL );
                }, true );
                quizTypeList.appendChild( quizItem );
            } );
        }
    } );

    // Link to clear all progress in all quizzes
    const clearBlock = document.createElement( 'p' );
    clearBlock.id = 'clear-all';
    const clearLink = document.createElement( 'a' );
    clearLink.innerText = 'Clear Progess in All Quizzes';
    clearLink.href = '#';
    clearLink.className= 'button low';
    clearLink.addEventListener( 'click', () => {
        sessionStorage.clear();
        initialiseQuiz();
    }, true );
    clearBlock.appendChild( clearLink );
    overBlock.appendChild( clearBlock );
}


/** ***************************************************************
 * Loads a quiz from a given URL (within the quizzes folder)
 * Quiz data is stored in a quiz object, and the session has objects created
 * to store answer progress.
 *
 * @param {string} url the URL of the quiz to load
 */
async function loadQuiz( url ) {
    const title = document.getElementById( 'title' );
    const infoBlock = document.getElementById( 'info' );
    const overBlock = document.getElementById( 'overview' );

    // Load the file if we can, otherwise bail
    const quizMD = await getMarkdown( 'quizzes/' + url );
    if( !quizMD ) return;

    // Save the fact that we're doing this quiz
    sessionStorage.setItem( 'currentQuiz', url );

    // Tidy up the display
    closeMenu();
    infoBlock.className = 'hide';
    overBlock.className = 'hide';

    // Break up the quiz MD based on HRs (three or more ---s)
    mdBlocks = quizMD.split( /^----*$/m );

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
        let question = { 'questionMD': parts[0].trim() };
        // Second is always the answers (if present)
        if( parts[1] ) {
            question['answersMD'] = parts[1].trim();
            // MD to HTML to be able to count the number of answers easily by no. of <li> tags
            const questionsHTML = converter.makeHtml( question.answersMD );
            question['answerCount'] = 0;
            // Does answer have an ordered list of answers in it? If so, count the list items (assumes only a single list!)
            if( questionsHTML.includes( '<ol>' ) ) question['answerCount'] = questionsHTML.split( '<li>' ).length - 1;
        }
        // Third is always the feedback (if present)
        if( parts[2] ) question['feedbackMD'] = parts[2].trim();

        // And add it to the question list
        quiz.questions.push( question );
    } );

    // Get the question progress stats ready to use
    setupQuestionProgress();

    // Build the progress bar
    buildQuestionNav();

    // And show the relevant question (continuing where we left off if saved)
    const currentQuestion = sessionStorage.getItem( 'currentQuestion' );
    showQuestion( currentQuestion !== null ? currentQuestion : 0 );

    // Finally, scroll to the top
    window.scroll( {
        top:  0,
        left: 0,
        behavior: 'smooth'
    } );
}



/** ***************************************************************
 * Loads a given markdown file
 *
 * @param {string} url the URL of the markdown file to load
 * @returns the MD text from the file, null otherwise
 */
async function getMarkdown( url ) {
    const response = await fetch( url );
    if( response.status !== 200 ) return null;
    const md = await response.text();
    return md;
}


/** ***************************************************************
 * Loads a given JSON file
 *
 * @param {string} url the URL of the JSON file to load
 * @returns the JSON object obtained from the file, null otherwise
 */
async function getJSON( url ) {
    const response = await fetch( url );
    if( response.status !== 200 ) return null;
    const json = await response.json();
    return json;
}


/** ***************************************************************
 * Triggers a close of the menu after an option has been selected. For the mobile
 * menu, this is simply a case of unticking the checkbox that controls the menu
 * visibility (via CSS). For the desktop menu which relies on hover states, it's a
 * bit more clunky... Turn off mouse events to 'unhover', then back on again
 */
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


/**
 * Creates a DIV container with the appropriate numb er of child DIVs to act
 * as stars (via CSS)
 *
 * @param {number} numStars the number of stars required (1-4)
 * @param {boolean} small default false, if true adds 'small' to class list
 * @returns a DIV element with the stars inside
 */
function createStars( numStars, small=false ) {
    const starBlock = document.createElement( 'div' );
    starBlock.className = 'stars has0 from' + numStars + (small ? ' small' : '');
    let starsHTML = '';
    if( numStars >= 1 ) starsHTML += '<div class="star"></div>';
    if( numStars >= 2 ) starsHTML += '<div class="star"></div>';
    if( numStars >= 3 ) starsHTML += '<div class="star"></div>';
    if( numStars >= 4 ) starsHTML += '<div class="star"></div>';
    starBlock.innerHTML = starsHTML;
    return starBlock;
}


/** ***************************************************************
 * Setup the question nav progress bar, based on the number of questions
 * in the current quiz. The first marker is always assumed to be an intro
 * so displays an (i) symbol. otherwise it's a question. This results in
 * Q1 having an index of 1, Q2, index of 2, etc.
 *
 * Click event handlers are added to each question marker to show the question,
 * and to the next / previous markers
 */
function buildQuestionNav() {
    const questionMarkers = document.getElementById( 'question-markers' );
    // Scrub any previous markers
    questionMarkers.innerHTML = '';

    // Work through all the questions in the list
    for( let i = 0; i < quiz.questions.length; i++ ) {
        // Let's make a new marker
        const questionIndicator = document.createElement( 'li' );

        if( i == 0 ) {
            // This is the intro, so we have an icon
            const icon = document.createElement( 'img' );
            icon.src = 'images/info.svg';
            questionIndicator.appendChild( icon );
        }
        else {
            // An actual question, so show the number
            questionIndicator.innerHTML = i;
            // Setup the appropriate amount of stars for the question
            const starBlock = createStars( quiz.questions[i].answerCount );
            questionIndicator.appendChild( starBlock );
        }

        // Click event handlers
        questionIndicator.addEventListener( 'click', () => { showQuestion( i ); } );

        // And tack on the new marker
        questionMarkers.appendChild( questionIndicator );

        // Show the correct amount of previously earned stars (if any )
        if( i > 0 ) updateQuestionStars( i );
    }

    // Link to go to previous question and doc swipe handler
    const prevIndicator = document.getElementById( 'prev-question' );
    if( prevIndicator.getAttribute( 'hasListener' ) != 'true' ) {
        prevIndicator.addEventListener( 'click',   () => { showQuestionWithOffset( -1 ); } );
        document.addEventListener( 'swiped-right', () => { showQuestionWithOffset( -1 ); } );
        prevIndicator.setAttribute( 'hasListener', 'true' );
    }

    // Link to go to next question and doc swipe handler
    const nextIndicator = document.getElementById( 'next-question' );
    if( nextIndicator.getAttribute( 'hasListener' ) != 'true' ) {
        nextIndicator.addEventListener( 'click',  () => { showQuestionWithOffset( 1 ); } );
        document.addEventListener( 'swiped-left', () => { showQuestionWithOffset( 1 ); } );
        nextIndicator.setAttribute( 'hasListener', 'true' );
    }
}


/** ***************************************************************
 * Switch to another question based on a given offset from the current question
 *
 * @param {number} offset the offset to add to the current question, e.g. -1
 */
function showQuestionWithOffset( offset ) {
    // Do we know where we are already?
    let currentQuestion = sessionStorage.getItem( 'currentQuestion' );
    currentQuestion = currentQuestion === null ? 0 : parseInt( currentQuestion );

    // Where are we going to?
    let questionToShow = currentQuestion + offset;
    // Force into valid range
    questionToShow = Math.min( Math.max( 0, questionToShow ), quiz.questions.length - 1 );

    // And off we go
    showQuestion( questionToShow );
}


/** ***************************************************************
 * Displays the given question to the user, coniguring the answers with click
 * event handlers, updating the progress nav, and storing the progress in
 * the session
 *
 * @param {number} qNum the question to display
 */
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
    quesBlock.innerHTML = question.questionMD ? converter.makeHtml( question.questionMD ) : 'MISSING QUESTION TEXT';
    answBlock.innerHTML = question.answersMD  ? converter.makeHtml( question.answersMD )  : '';
    message.innerHTML   = question.feedbackMD ? converter.makeHtml( question.feedbackMD ) : '';

    // Code syntax highlighting
    processCodeBlocks( [quesBlock, answBlock, message] );

    // Add event handlers to answers, but not for intro (qNum 0)
    if( qNum > 0 ) {
        // Grab the answer <li> elements
        const answers = answBlock.querySelectorAll( 'li' );
        const numAnswers = answers.length;
        let correctAnswerElement = null;

        for( let aNum = 1; aNum <= numAnswers; aNum++ ) {
            // First answer is always the correect one (however, answers displayed in rand order)
            const isCorrect = aNum == 1;
            const ansElem = answers[aNum-1];

            ansElem.addEventListener( 'click', (e) => { markAnswer( e, qNum, isCorrect ); } );
            // Randomise the order of display... If two get the same order, it's no big deal!
            ansElem.style.order = Math.floor( Math.random() * 99 );
            // Save a ref. to the correct answer for later
            if( isCorrect ) correctAnswerElement = ansElem;
        }

        // If questions answered already, update the UI of the answers
        if( getQuestionProgress( qNum ) > 0 && correctAnswerElement !== null ) {
            setAnswerState( correctAnswerElement, true );
            showFeedback();
        }
    }

    // Update progress bar
    updateQuestionNav( qNum );

    // Save where we're at
    sessionStorage.setItem( 'currentQuestion', qNum );
}

/**
 * Use Prism syntax highlighting for code blocks with some tweaks to enable
 * line highlighting, etc.
 */
function processCodeBlocks( blocks ) {
    // Sort out the syntax highlighting for inline as well as blocks of code
    const codeBlocks = document.querySelectorAll( 'code' );
    codeBlocks.forEach( block => {
        block.classList.add( quiz.language );
        block.classList.add( 'language-' + quiz.language );
    } );

    blocks.forEach( block => {
        let blockHTML = block.innerHTML;
        // Look for [#nnn] blocks above <pre> code blocks
        blockHTML = blockHTML.replace( /<p>\[#([0-9\-]+)\]<\/p>[\n]?<pre>/g,
                                       `<pre class="line-numbers" data-line="$1">` );
        block.innerHTML = blockHTML;
    } );

    Prism.highlightAll();
    if( quiz.language == 'scratch' ) Scratch.highlightAll();
}

/**
 * Create objects in the session to track question progress so far. Existing records
 * are left untouched, otherwise a fresh, shiny record is created
 */
function setupQuestionProgress() {
    // Attempt to get progress from session
    let progress = sessionStorage.getItem( 'progress' );
    if( progress ) progress = JSON.parse( progress );
    else           progress = {};

    // Attempt to get the URL of current quiz. Bail out if missing
    const currentQuiz = sessionStorage.getItem( 'currentQuiz' );
    if( !currentQuiz ) return;

    // Tracking our progress for this quiz already? If not, create a record
    if( !progress || !progress[currentQuiz] ) progress[currentQuiz] = {};

    // Work through the questions in the quiz object (setup from loading quiz), excluding intro at index 0
    for (let i = 1; i < quiz.questions.length; i++) {
        // Do we have info for this ques already? If not, create record. Also do this if num ans has chnaged
        if( !progress[currentQuiz][i] || progress[currentQuiz][i].answers != quiz.questions[i].answerCount ) {
            progress[currentQuiz][i] = {
                "answers": quiz.questions[i].answerCount,
                "correct": false,
                "attempts": 0
            }
        }
    }

    // Save back into the session
    sessionStorage.setItem( 'progress', JSON.stringify( progress ) );
}


/**
 * Updates the attempt count and answered state of a given question in the session
 *
 * @param {number} qNum the question to update the status of
 * @param {boolean} isCorrect true if the question has been answered correctly
 */
function updateQuestionProgress( qNum, isCorrect ) {
    // Attempt to get the URL of current quiz.
    const currentQuiz = sessionStorage.getItem( 'currentQuiz' );
    // Attempt to get progress from session
    let progress = sessionStorage.getItem( 'progress' );
    // Bail out if anything amiss
    if( !progress || !currentQuiz ) return;

    // JSONify it
    progress = JSON.parse( progress );
    // Bail out if anything amiss
    if( !progress[currentQuiz] || !progress[currentQuiz][qNum] ) return;

    // Set ques status
    if( progress[currentQuiz][qNum].attempts < progress[currentQuiz][qNum].answers ) progress[currentQuiz][qNum].attempts++;
    progress[currentQuiz][qNum].correct = isCorrect;

    // Save back into the session
    sessionStorage.setItem( 'progress', JSON.stringify( progress ) );
}


/**
 * Calculates and retursn a number relating to how well a question has been
 * answered. Value ranges from 0 to the number of possible answers, i.e. it
 * is a 'star' rating:
 *  0 - not answered correctly yet
 *  1 - all attemots incorrect until last
 *  ...
 *  max - correct first time
 *
 * @param {number} qNum the question to get the status of
 * @param {text} quizURL the URL of the quiz. Default null and if so, current quiz
 * @returns the number of 'stars' a question's answer has earnt
 */
function getQuestionProgress( qNum, quizURL=null ) {
    // Attempt to get the URL of current quiz, if not given
    if( quizURL === null ) quizURL = sessionStorage.getItem( 'currentQuiz' );
    // Attempt to get progress from session
    let progress = sessionStorage.getItem( 'progress' );
    // Bail out if anything amiss
    if( !progress || !quizURL ) return 0;

    // JSONify it
    progress = JSON.parse( progress );
    // Bail out if anything amiss
    if( !progress[quizURL] || !progress[quizURL][qNum] ) return 0;

    // Calculate ques progress (e.g. if 3 answers: 3 = right first time, 2 = right after 1 mistake,
    // 1 = right after 2 mistakes, 0 = not yet right)
    if( progress[quizURL][qNum].correct ) {
        return progress[quizURL][qNum].answers + 1 - progress[quizURL][qNum].attempts;
    }
    else {
        return 0;
    }
}


/** ***************************************************************
 * Updates the nav bar, highlighting the current questuion and those
 * near it (for mobile views, only close neighbours are shown in the
 * nav due to limited screen width - handled by classes and CSS)
 *
 * @param {number} qNum the current question number (0-max)
 */
 function updateQuestionNav( qNum ) {
    const maxQ = quiz.questions.length - 1;

    if( qNum < 0 || qNum > maxQ  ) return;

    const markers = document.getElementById( 'question-markers' ).children;
    const nextQuesButton = document.getElementById( 'next-question' );

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

    // Clear highlighted next button
    nextQuesButton.classList.remove( 'highlight' );
}


/**
 * Updates the classes of the given question marker so that the correct number
 * of stars is shown (via CSS)
 *
 * @param {number} qNum the question number to update
 */
function updateQuestionStars( qNum ) {
    const maxQ = quiz.questions.length - 1;

    if( qNum < 0 || qNum > maxQ  ) return;

    // Marker elemenst
    const markers = document.getElementById( 'question-markers' ).children;
    // The stars container of the marker specific to the question
    const starBlock = markers.item( qNum ).querySelector( '.stars' );

    // HOw mnay stars have they earned?
    const stars = getQuestionProgress( qNum );
    // Update the UI to match
    starBlock.className = 'stars has' + stars + ' from' + quiz.questions[qNum].answerCount;
}



/** ***************************************************************
 * Marks an answer correct or not, giving feedback and
 * updating other status data / UI
 *
 * @param {object} e the click event (from which can get the target)
 * @param {number} qNum the question number (1-max)
 * @param {boolean} isCorrect true if correct, false otherwise
 */
 function markAnswer( e, qNum, isCorrect ) {
    showFeedback( isCorrect );
    setAnswerState( e.target, isCorrect );

    // Highlight the 'next' button if question correct
    const maxQ = quiz.questions.length - 1;
    if( isCorrect && qNum < maxQ ) {
        const nextQuesButton = document.getElementById( 'next-question' );
        nextQuesButton.classList.add( 'highlight' );
    }

    updateQuestionProgress( qNum, isCorrect );
    updateQuestionStars( qNum );
}



/**
 * Gives feedback for a given question and answer status (shown via CSS)
 * An incorrect question triggers a feedback panel which is only shown for a
 * short time. A correct answer's feedback panel remains in view until the
 * next question is loaded. Non right/wrong feedback can also be shown in the
 * case of previously answered questions
 *
 * @param {boolean / null} isCorrect null for non-themed feedback, true/false otherwise
 */
function showFeedback( isCorrect=null ) {
    const feedback = document.getElementById( 'feedback' );

    if( isCorrect === true ) {
        if( feedbackTimeout ) {
            clearTimeout( feedbackTimeout );
            feedbackTimeout = null;
        }
        feedback.className = 'show correct';
        // And celebrate with some stars!
        showStarShower( feedback );
    }
    else if( isCorrect === false ) {
        feedback.className = 'show wrong';
        feedbackTimeout = setTimeout( () => { feedback.className = 'hide'; }, 2000 );
    }
    else {
        feedback.className = 'show';
    }

    if( feedback.getAttribute( 'hasListener' ) != 'true' ) {
        feedback.addEventListener( 'click', () => { feedback.className = 'hide'; } );
        feedback.setAttribute( 'hasListener', 'true' );
    }
}


/**
 * Updates the visual state of a given answer, styling it via CSS classes.
 * If an answer is correct, all other answers are marked as wrong
 *
 * @param {object} ansElem the <li> to highlight
 * @param {boolean} isCorrect true if answered correctly
 */
function setAnswerState( ansElem, isCorrect ) {
    const answerList = document.getElementById( 'answers' ).querySelector( 'ol' );
    const answers = answerList ? answerList.querySelectorAll( 'li' ) : null;

    if( answers ) {
        if( isCorrect ) {
            // Mark all other answers as wrong as we have the correct answer now
            answers.forEach( answer => { answer.className = 'wrong'; } );
            ansElem.className = 'correct';
        }
        else {
            ansElem.className = 'wrong';
        }
    }
}


/**
 * Show a bunch of star particles coing from the correct answer
 * feedback panel, after a short delay to allow of the panel to
 * animate in
 */
function showStarShower( panel ) {
    setTimeout( () => {
        for( let i = 0; i < 30; i++ ) {
            createParticle( panel );
        }
    }, 500 );
}


/**
 * Creates a particle div (that can be styled via CSS as needed) that shoots out of a
 * given element, e.g. to celebrate a correct answer
 *
 * @param {element} parent The element to shoot the particle out of
 */
function createParticle( parent ) {
    const winHeight = window.innerHeight;
    const cx = parent.clientWidth / 2;    // Centre of element width

    const size = (Math.random() * 20) + 5;
    // Place at top edge, somewhere along width
    let x = (Math.random() * parent.clientWidth) - (size / 2);
    let y = -(size / 2);
    let a = Math.random() * 360;

    // Sideways speed based on x position - go left if on left, right if on right
    const dx = Math.random() * ((x - cx) / 10);
    let dy = (Math.random() * 20) + 10;
    const da = (Math.random() * 30) - 15;

    // Setup the div
    const particle = document.createElement( 'div' );
    particle.className = 'particle';
    particle.style.height = `${size}px`;
    particle.style.width = `${size}px`;
    particle.style.top = `${y}px`;
    particle.style.left = `${x}px`;
    particle.style.transform = `rotate(${a}deg)`;

    // Attach to element
    parent.append( particle );

    // Animate
    const particleTimer = setInterval( () => {
        // Update position and spin
        x += dx;
        y -= dy--; // Fall down
        a += da;
        particle.style.top = `${y}px`;
        particle.style.left = `${x}px`;
        particle.style.transform = `rotate(${a}deg)`;

        // Off bottom of window?
        if( y > winHeight ) {
            // Kill and quit the animation
            particle.remove();
            clearInterval( particleTimer );
        }
    }, 1000 / 30 );
}