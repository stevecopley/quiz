var _self = window;

var Scratch = (function (_self) {

	var _ = {

        highlightAll: function () {
            const selector = 'code.language-scratch, .language-scratch code';
			const elements = Array.prototype.slice.apply( document.querySelectorAll( selector ) );

            elements.forEach( element => {
                _.highlightElement( element );
                _.postProcess( element );
			} );
		},


		highlightElement: function ( element ) {
			const code = element.textContent;
            if( !code ) return;

            const lines = code.trim().split( '\n' );

            let highlightedCode = '';
            lines.forEach( line => {
                highlightedCode += _.highlightLine( line ) + '\n';
            } );

            element.innerHTML = highlightedCode;
		},


        postProcess: function ( element ) {
            _.processStages( element );
            _.processStageItems( element );
        },


        processStages: function ( element ) {
			const stages = Array.prototype.slice.apply( element.querySelectorAll( '.stage' ) );

            stages.forEach( stage => {
                const headers = stage.querySelectorAll( 'header' );
                if( headers.length > 0 ) {
                    const header = headers[0];
                    const backValues = header.querySelectorAll( '.value' );
                    if( backValues.length > 0 ) {
                        const backVal = backValues[0].textContent;
                        // Is this a colour hex code?
                        if( backVal[0] == '#' ) stage.style.backgroundColor = backVal;
                        // Or an image?
                        else stage.style.backgroundImage = `url('images/scratch/stages/${backVal}.svg')`;
                    }
                }
			} );
        },


        processStageItems: function ( element ) {
			const items = Array.prototype.slice.apply( element.querySelectorAll( '.stage-item' ) );

            items.forEach( item => {
                let info = {
                    x:     0,
                    y:     0,
                    angle: 0,
                    size:  100,
                    name:  'turtle',
                    col:   '#f00',
                    opac:  1.0,
                    say:   '',
                    num:   1
                }

                const attrs = Array.prototype.slice.apply( item.querySelectorAll( '.value' ) );

                attrs.forEach( attr => {
                    const attrVal = attr.textContent;

                    let xVal = attrVal.match( /x:\s*(-*[0-9]+)/ );
                    let yVal = attrVal.match( /y:\s*(-*[0-9]+)/ );
                    let aVal = attrVal.match( /(a|\bangle\b):\s*(-*[0-9]+)/ );
                    let sVal = attrVal.match( /(s|\bsize\b):\s*([0-9]+)/ );
                    let oVal = attrVal.match( /(o|\bopacity\b):\s*([0-9\.]+)/ );
                    let iVal = attrVal.match( /(i|\bimage\b):\s*([A-Za-z0-9]+)/ );
                    let cVal = attrVal.match( /(c|\bcol\b|\bcolour\b):\s*(#?[A-Za-z0-9]+)/ );
                    let mVal = attrVal.match( /(m|\bmessage\b|\bsay\b):\s*([A-Za-z0-9\s\.\!\?]+)/ );
                    let nVal = attrVal.match( /(n|\bnum\b|\bnumber\b):\s*([0-9]+)/ );

                    if( xVal !== null ) { xVal = xVal[1]; info.x     = xVal; attr.innerHTML = xVal; attr.classList.add( 'item-x' ); }
                    if( yVal !== null ) { yVal = yVal[1]; info.y     = yVal; attr.innerHTML = yVal; attr.classList.add( 'item-y' ); }
                    if( aVal !== null ) { aVal = aVal[2]; info.angle = aVal; attr.innerHTML = aVal; attr.classList.add( 'item-angle' ); }
                    if( sVal !== null ) { sVal = sVal[2]; info.size  = sVal; attr.innerHTML = sVal; attr.classList.add( 'item-size' ); }
                    if( oVal !== null ) { oVal = oVal[2]; info.opac  = oVal; attr.innerHTML = oVal; attr.classList.add( 'item-opacity' ); }
                    if( iVal !== null ) { iVal = iVal[2]; info.name  = iVal; attr.innerHTML = iVal; attr.classList.add( 'item-image' ); }
                    if( cVal !== null ) { cVal = cVal[2]; info.col   = cVal; attr.innerHTML = cVal; attr.classList.add( 'item-colour' ); }
                    if( mVal !== null ) { mVal = mVal[2]; info.say   = mVal; attr.innerHTML = mVal; attr.classList.add( 'item-say' ); }
                    if( nVal !== null ) { nVal = nVal[2]; info.num   = nVal; attr.innerHTML = nVal; attr.classList.add( 'item-number' ); }
                } );

                let cssVars = '';
                cssVars += `--item-x:       ${info.x}; `;
                cssVars += `--item-y:       ${info.y}; `;
                cssVars += `--item-angle:   ${info.angle}; `;
                cssVars += `--item-size:    ${info.size}; `;
                cssVars += `--item-opacity: ${info.opac}; `;
                cssVars += `--item-colour:  ${info.col}; `;
                cssVars += `--item-image:   url('../images/scratch/sprites/${info.name}.svg'); `;

                item.style = cssVars;
			} );
        },


        highlightLine: function ( line ) {
            // Tokenise the line of code into a tree
            const tokens = _.parseLine( line );
            // Expand into HTML code
            let code = _.expandCommand( tokens );
            // Sort out colours to have actual colour from the value
            code = _.processColours( code );
            // Sort out variable styling, using %....% to identify them from normal value
            code = _.processVariables( code );

            return code;
        },


        parseLine: function ( line ) {
            let token = _.tokenise( line.trim() );

            if( token.op === null ) return null;

            for( let i = 0; i < token.args.length; i++ ) {
                const argToken = _.parseLine( token.args[i] );
                if( argToken ) token.args[i] = argToken;
            }

            return token;
        },


        tokenise: function ( line ) {
            const groupStarters = '([{';
            const groupEndings  = ')]}';

            let token = {
                op: null,
                args: []
            };
            let fragment = '';
            let depth = 0;

            // Bail out if empty line
            if( line.trim().length == 0 ) return token;

            // Bail out if no more groupings
            let groupings = false;
            groupStarters.split( '' ).forEach( starter => {
                if( line.includes( starter ) ) groupings = true;
            } );
            if( !groupings ) {
                token.op = line;
                return token;
            }

            // Ok, must have some groupings to parse...
            line.trim().split( '' ).forEach( character => {
                // End of a non-grouped word? Must be the operator
                if( character === ' ' && depth == 0 && fragment !== '' ) {
                    token.op = fragment;
                    fragment = '';
                }
                else {
                    // Save char (as long as not leading spaces)
                    if( fragment !== '' || character !== ' ' ) {
                        fragment += character;
                    }

                    // Start of a group?
                    if( groupStarters.includes( character ) ) {
                        depth++;
                    }
                    // End of a group?
                    else if( groupEndings.includes( character ) ) {
                        depth--;

                        // top-level group?
                        if( depth == 0 ) {
                            // Yep, so grab contents and start over
                            token.args.push( fragment.slice( 1, -1 ) );
                            fragment = '';
                        }
                    }
                }
            } );

            return token;
        },


        expandCommand: function ( token ) {
            // Check if we're dealing with an empty line
            if( token === null ) return '<div class="gap"></div>';

            // Find out what type of block we're looking at
            let block = _.identifyBlock( token.op );

            // Build out the HTML based on the block type
            let code = '';
            // Start a new DIV for all non-ending blocks
            if( !block.ending )    code += `<div class="${block.type} ${block.category}">`;
            // If it's a container, wrap the command up in the HEADER
            if( block.container )  code += '<header>';
            // If it's an ending, put the command in the footer (e.g. for loop image)
            if( block.ending )     code += `<footer>`;
            // Add in the actual command
            code += block.command;
            // Terminate blocks
            if( block.container )  code += '</header>';
            if( block.ending )     code += '</footer>';
            // Wrap up all blocks, except if we're just opening a container
            if( !block.container ) code += '</div>';

            // Any args for this current block?
            for( let i = 0; i < token.args.length; i++ ) {
                // Recursively expand them
                let argCode = _.expandCommand( token.args[i] );

                // Incorporate the expanded code
                if( argCode ) {
                    // What marker are we looking for? {1}, {2}, etc. for plain values; [1], [2], etc. for 'menu' values; #1$, etc. for colours
                    const valueMarker = `{${i + 1}}`;
                    const menuMarker  = `[${i + 1}]`;
                    const colMarker   = `_${i + 1}_`;

                    // Plain value? Just chuck it in
                    if( code.includes( valueMarker ) ) {
                        code = code.replace( valueMarker, argCode );
                    }
                    // Colour? Just chuck it in
                    else if( code.includes( colMarker ) ) {
                        argCode = argCode.replace( 'class="value', 'class="colour value' );
                        code = code.replace( colMarker, argCode );
                    }
                    // Menu marker? Add in an extra class to the arg DIV - bit cludgy!
                    else if( code.includes( menuMarker ) ) {
                        argCode = argCode.replace( 'class="value', 'class="menu value' );
                        code = code.replace( menuMarker, argCode );
                    }
                }
            }

            // Clean up any unused markers (e.g. for sprites without specified attrs)
            for( let i = 1; i < 10; i++ ) {
                const valueMarker = `{${i + 1}}`;
                const menuMarker  = `[${i + 1}]`;
                const colMarker   = `_${i + 1}_`;

                code = code.replace( valueMarker, '' );
                code = code.replace( colMarker,   '' );
                code = code.replace( menuMarker,  '' );
            }

            // Includes an image?
            if( code.includes( '{i}' ) && block.image ) code = code.replace( '{i}', `<img src="images/scratch/${block.image}">` );

           return code;
        },


        processColours: function ( code ) {
            // <div class="colour value ">BLUE</div>
            code = code.replace( /<div\s*?class="\s*?(colour|value)\s+(colour|value)\s*?">(.+?)<\/div>/g,
                                 '<div class="value colour" style="--back-col: $3;">&nbsp;</div>' );
            return code;
        },


        processVariables: function ( code ) {
            // <div class="value ">%score%</div>
            code = code.replace( /<div\s*?class="\s*?value\s*?">%(.+?)%<\/div>/g,
                                 '<div class="value variable">$1</div>' );
            return code;
        },




        identifyBlock: function ( cmd ) {

            let block = {
                type:      'block',
                category:  '',
                command:   '',
                image:     null,
                container: false,
                ending:    false
            };

            // What have we got?
            switch( cmd ) {

                // Stage --------------------------------------

                case 'stage':
                    block.type      = 'stage';
                    block.category  = 'container';
                    block.command   = '{1}';
                    block.container = true;
                    break;

                case 'endstage':
                    block.type     = 'stage';
                    block.ending   = true;
                    break;


                // Sprites --------------------------------------

                case 'sprite':
                    block.type     = 'stage-item';
                    block.category = 'sprite noinfo';
                    block.command  = '{i} {1} {2} {3} {4} {5} {6}';
                    block.image    = 'sprites/turtle.svg';
                    break;

                case 'spriteinfo':
                    block.type     = 'stage-item';
                    block.category = 'sprite showinfo';
                    block.command  = '{i} {1} {2} {3} {4} {5} {6}';
                    block.image    = 'sprites/turtle.svg';
                    break;

                // Stage Markers --------------------------------------

                case 'arrow':
                    block.type     = 'stage-item';
                    block.category = 'arrow';
                    block.command  = '{1} {2} {3} {4} {5}';
                    break;

                case 'circle':
                    block.type     = 'stage-item';
                    block.category = 'circle';
                    block.command  = '{1} {2} {3} {4} {5}';
                    break;

                case 'square':
                    block.type     = 'stage-item';
                    block.category = 'square';
                    block.command  = '{1} {2} {3} {4} {5}';
                    break;

                case 'number':
                    block.type     = 'stage-item';
                    block.category = 'number';
                    block.command  = '{1} {2} {3} {4} {5}';
                    break;


                // Question --------------------------------------

                case 'question':
                    block.type     = 'question';
                    block.command  = '{1} {2} {i}';
                    block.image    = 'icons/tick.svg';
                    break;


                // Events --------------------------------------

                case 'onflag':
                    block.type     = 'block';
                    block.category = 'events starter';
                    block.command  = 'when {i} clicked';
                    block.image    = 'icons/flag.svg';
                    break;

                case 'onkey':
                    block.type     = 'block';
                    block.category = 'events starter';
                    block.command = 'when [1] key pressed';
                    break;

                case 'onclick':
                    block.type     = 'block';
                    block.category = 'events starter';
                    block.command = 'when this sprite clicked';
                    break;

                case 'onmsg':
                    block.type     = 'block';
                    block.category = 'events starter';
                    block.command = 'when I receive [1]';
                    break;

                case 'broad':
                    block.type     = 'block';
                    block.category = 'events';
                    block.command = 'broadcast [1]';
                    break;

                case 'broadwait':
                    block.type     = 'block';
                    block.category = 'events';
                    block.command = 'broadcast [1] and wait';
                    break;


                // Motion --------------------------------------

                case 'move':
                    block.type     = 'block';
                    block.category = 'motion';
                    block.command = 'move {1} steps';
                    break;

                case 'setx':
                    block.type     = 'block';
                    block.category = 'motion';
                    block.command = 'set x to {1}';
                    break;

                case 'sety':
                    block.type     = 'block';
                    block.category = 'motion';
                    block.command = 'set y to {1}';
                    break;

                case 'changex':
                    block.type     = 'block';
                    block.category = 'motion';
                    block.command = 'change x by {1}';
                    break;

                case 'changey':
                    block.type     = 'block';
                    block.category = 'motion';
                    block.command = 'change y by {1}';
                    break;

                case 'point':
                    block.type     = 'block';
                    block.category = 'motion';
                    block.command = 'point in direction {1}';
                    break;

                case 'turnCW':
                    block.type     = 'block';
                    block.category = 'motion';
                    block.command = 'turn {i} {1} degress';
                    block.image   = 'icons/right.svg';
                    break;

                case 'turnCCW':
                    block.type     = 'block';
                    block.category = 'motion';
                    block.command = 'turn {i} {1} degrees';
                    block.image   = 'icons/left.svg';
                    break;

                case 'goto':
                    block.type     = 'block';
                    block.category = 'motion';
                    block.command = 'goto x: {1} y: {2}';
                    break;


                // Looks --------------------------------------

                case 'show':
                    block.type     = 'block';
                    block.category = 'looks';
                    block.command = 'show';
                    break;

                case 'hide':
                    block.type     = 'block';
                    block.category = 'looks';
                    block.command = 'hide';
                    break;

                case 'say':
                    block.type     = 'block';
                    block.category = 'looks';
                    block.command = 'say {1}';
                    break;

                case 'saysec':
                    block.type     = 'block';
                    block.category = 'looks';
                    block.command = 'say {1} for {2} seconds';
                    break;

                case 'size':
                    block.type     = 'block';
                    block.category = 'looks';
                    block.command = 'set size to {1} %';
                    break;

                case 'chsize':
                    block.type     = 'block';
                    block.category = 'looks';
                    block.command = 'change size by {1}';
                    break;


                // Sound --------------------------------------

                case 'play':
                    block.type     = 'block';
                    block.category = 'sounds';
                    block.command  = 'play sound [1]';
                    break;

                case 'playdone':
                    block.type     = 'block';
                    block.category = 'sounds';
                    block.command  = 'play sound [1] until done';
                    break;

                case 'stopsound':
                    block.type     = 'block';
                    block.category = 'sounds';
                    block.command  = 'stop all sounds';
                    break;


                // Control --------------------------------------

                case 'wait':
                    block.type     = 'block';
                    block.category = 'control';
                    block.command   = 'wait {1} seconds';
                    break;

                case 'waituntil':
                    block.type     = 'block';
                    block.category = 'control';
                    block.command   = 'wait until {1}';
                    break;

                case 'forever':
                    block.type     = 'block';
                    block.category = 'control container final';
                    block.command   = 'forever';
                    block.container = true;
                    break;

                case 'repeat':
                    block.type     = 'block';
                    block.category = 'control container';
                    block.command   = 'repeat {1}';
                    block.container = true;
                    break;

                case 'repuntil':
                    block.type     = 'block';
                    block.category = 'control container';
                    block.command   = 'repeat until {1}';
                    block.container = true;
                    break;

                case 'endrep':
                    block.type     = 'block';
                    block.ending    = true;
                    block.command   = '{i}';
                    block.image     = 'icons/repeat.svg';
                    break;

                case 'if':
                    block.type     = 'block';
                    block.category = 'control container';
                    block.command   = 'if {1} then';
                    block.container = true;
                    break;

                case 'else':
                    block.type     = 'block';
                    block.category = 'control splitter';
                    block.command   = 'else';
                    break;

                case 'endif':
                    block.type     = 'block';
                    block.ending    = true;
                    break;

                case 'stop':
                    block.type     = 'block';
                    block.category = 'control final';
                    block.command   = 'stop [all]';
                    break;

                case 'stopthis':
                    block.type     = 'block';
                    block.category = 'control final';
                    block.command   = 'stop [this script]';
                    break;

                case 'stopother':
                    block.type     = 'block';
                    block.category = 'control';
                    block.command   = 'stop [other scripts in sprite]';
                    break;

                case 'onclone':
                    block.type     = 'block';
                    block.category = 'control starter';
                    block.command = 'when I start as a clone';
                    break;

                case 'clone':
                    block.type     = 'block';
                    block.category = 'control';
                    block.command = 'create a clone of [myself]';
                    break;

                case 'delclone':
                    block.type     = 'block';
                    block.category = 'control final';
                    block.command = 'delete this clone';
                    break;


                // Sensing --------------------------------------

                case 'ask':
                    block.category = 'sensing';
                    block.command = 'ask {1} and wait';
                    break;


                case 'touch':
                    block.type     = 'sub-block';
                    block.category = 'sensing logic';
                    block.command  = 'touching [1] ?';
                    break;

                case 'pointer':
                    block.type     = 'value';
                    block.category = 'sensing';
                    block.command  = 'mouse pointer';
                    break;

                case 'edge':
                    block.type     = 'value';
                    block.category = 'sensing';
                    block.command  = 'edge';
                    break;

                case 'touchcol':
                    block.type     = 'sub-block';
                    block.category = 'sensing logic';
                    block.command  = 'touching color _1_ ?';
                    break;

                case 'key':
                    block.type     = 'sub-block';
                    block.category = 'sensing logic';
                    block.command  = 'key [1] pressed?';
                    break;

                case 'mouse':
                    block.type     = 'sub-block';
                    block.category = 'sensing logic';
                    block.command  = 'mouse down?';
                    break;


                // Operators --------------------------------------

                case '+':
                    block.type     = 'sub-block';
                    block.category = 'operator';
                    block.command  = '{1} + {2}';
                    break;

                case '-':
                    block.type     = 'sub-block';
                    block.category = 'operator';
                    block.command  = '{1} - {2}';
                    break;

                case '*':
                    block.type     = 'sub-block';
                    block.category = 'operator';
                    block.command  = '{1} * {2}';
                    break;

                case '/':
                    block.type     = 'sub-block';
                    block.category = 'operator';
                    block.command  = '{1} / {2}';
                    break;

                case '=':
                    block.type     = 'sub-block';
                    block.category = 'operator logic';
                    block.command  = '{1} = {2}';
                    break;

                case '>':
                    block.type     = 'sub-block';
                    block.category = 'operator logic';
                    block.command  = '{1} &gt; {2}';
                    break;

                case '<':
                    block.type     = 'sub-block';
                    block.category = 'operator logic';
                    block.command  = '{1} &lt; {2}';
                    break;

                case 'contains':
                    block.type     = 'sub-block';
                    block.category = 'operator logic';
                    block.command  = '{1} contains {2} ?';
                    break;

                case 'and':
                    block.type     = 'sub-block';
                    block.category = 'operator logic boolean';
                    block.command  = '{1} and {2}';
                    break;

                case 'or':
                    block.type     = 'sub-block';
                    block.category = 'operator logic boolean';
                    block.command  = '{1} or {2}';
                    break;

                case 'not':
                    block.type     = 'sub-block';
                    block.category = 'operator logic boolean';
                    block.command  = 'not {1}';
                    break;

                case 'join':
                    block.type     = 'sub-block';
                    block.category = 'operator function';
                    block.command  = 'join {1} {2}';
                    break;

                case 'rand':
                    block.type     = 'sub-block';
                    block.category = 'operator function';
                    block.command  = 'pick random {1} to {2}';
                    break;

                case 'letter':
                    block.type     = 'sub-block';
                    block.category = 'operator function';
                    block.command  = 'letter {1} of {2}';
                    break;

                case 'len':
                    block.type     = 'sub-block';
                    block.category = 'operator function';
                    block.command  = 'length of {1}';
                    break;

                // Variables --------------------------------------

                case 'set':
                    block.type     = 'block';
                    block.category = 'variables';
                    block.command  = 'set [1] to {2}';
                    break;

                case 'change':
                    block.type     = 'block';
                    block.category = 'variables';
                    block.command  = 'change [1] by {2}';
                    break;

                // Values --------------------------------------

                case 'x':
                    block.type     = 'value';
                    block.category = 'motion';
                    block.command  = 'x value';
                    break;

                case 'y':
                    block.type     = 'value';
                    block.category = 'motion';
                    block.command  = 'y value';
                    break;

                case 'dir':
                    block.type     = 'value';
                    block.category = 'motion';
                    block.command  = 'direction';
                    break;

                case 'size':
                    block.type     = 'value';
                    block.category = 'looks';
                    block.command  = 'size';
                    break;

                case 'ans':
                    block.type     = 'value';
                    block.category = 'sensing';
                    block.command  = 'answer';
                    break;

                case 'mx':
                    block.type     = 'value';
                    block.category = 'sensing';
                    block.command  = 'mouse x';
                    break;

                case 'my':
                    block.type     = 'value';
                    block.category = 'sensing';
                    block.command  = 'mouse y';
                    break;


                // Other --------------------------------------

                case '':
                    block.type     = 'gap';
                    break;

                default:
                    block.type     = 'value';
                    block.command  = cmd;
            }

            return block;
        }
	};


	_self.Scratch = _;

	return _;

}(_self));

