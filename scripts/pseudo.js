var _self = window;

var Pseudo = (function (_self) {

	var _ = {

        highlightAll: function () {
            const selector = 'code.language-pseudo, .language-pseudo code';
			const elements = Array.prototype.slice.apply( document.querySelectorAll( selector ) );

            elements.forEach( element => {
                _.highlightElement( element );
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


        highlightLine: function ( line ) {
            const commandType = _.parseLine( line );
            // console.log( commandType );
            let code = _.expandCommand( commandType, line );
            // console.log( code );
            return code;
        },


        parseLine: function ( line ) {
            line = line.trim();
            const words = line.split( ' ' );

            switch( words[0] ) {
                case 'function':
                case 'endfunction':
                case 'start':
                    return 'block';

                case 'end':
                    if( !words[1] || words[1] == 'functon' ) return 'block';
                    else if( words[1] == 'if' )              return 'decision';
                    else                                     return 'loop';

                case 'say':
                case 'show':
                    return 'output';

                case 'get':
                case 'ask':
                    return 'input';
        
                case 'is':
                case 'if':
                case 'else':
                case 'otherwise':
                case 'endif':
                    return 'decision';

                case 'forever':
                case 'repeat':
                case 'until':
                case 'do':
                case 'while':
                case 'endrepeat':
                case 'endwhile':
                    return 'loop';
            } 

            return 'action';
        },


        expandCommand: function ( type, line ) {
            if( line.length == 0 ) return '';
            return line.replace( /^(\s*)(\S.*)$/, `$1<span class="${type}">$2</span>` );
        }
	};


	_self.Pseudo = _;

	return _;

}(_self));

