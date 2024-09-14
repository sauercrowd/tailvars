window.VARWIND_DEFAULT_PROPERTY_ALIASES = {
    'p': 'padding',
    'pl': 'padding-left',
    'pr': 'padding-right',
    'pt': 'padding-top',
    'pb': 'padding-bottom',
    'px':['padding-left', 'padding-right'],
    'py': ['padding-top', 'padding-bottom'],
    'm': 'margin',
    'ml': 'margin-left',
    'mr': 'margin-right',
    'mt': 'margin-top',
    'mb': 'margin-bottom',
    'mx': ['margin-left', 'margin-right'],
    'my': ['margin-top', 'margin-bottom'],
    'd': 'display',
    'bg': 'background',
}

window.VARWIND_EXTRA_PROPERTY_ALIASES = {}

window.VARWIND_DEFAULT_PREFIX_ALIASES = {
    'hover': ':hover',
    'focus': ':focus',
    'active': ':active',
    'disabled': ':disabled',
    'after': '::after',
    'before': '::before',
    'first-child': ':first-child',
    'last-child': ':last-child',
    'odd': ':nth-child(odd)',
    'even': ':nth-child(even)',
    'enabled': ':enabled',
    'checked': ':checked',
    'valid': ':valid',
    'invalid': ':invalid',
    'required': ':required',
    'indeterminate': ':indeterminate',
    'visited': ':visited',
    'empty': ':empty',
    'default': ':default',
    'fullscreen': ':fullscreen',
    'autofill': ':autofill',
}

window.VARWIND_EXTRA_PREFIX_ALIASES = {}

// [value] ->> @media [value] { ... }
window.VARWIND_DEFAULT_MEDIA_QUERIES = {
    'sm': '(min-width: 640px)',
    'md': '(min-width: 768px)',
    'lg': '(min-width: 1024px)',
    'xl': '(min-width: 1280px)',
}

window.VARWIND_EXTRA_MEDIA_QUERIES = {}

const ATTRIBUTE_NAME = 'x-css-vars';

let classNameCounter = 0;
function generateClassName() {
    return `${ATTRIBUTE_NAME}-${classNameCounter++}`;
}


function processAttributeValue(value) {
    const allUtitlities = value.split(' ').map((v) => v.trim()).filter((v) => v !== '');

    const parsedStyleDefinitions = [];

    let hasMediaQuery = false;

    for(const utility of allUtitlities){
        const utilityParts = utility.split(':');
        let mediaQuery = undefined;
        let prefix = undefined;
        let value = undefined;

        if(utilityParts.length > 3){
            console.error('Invalid tailvars class', utility);
            return;
        }

        for(let index = 0; index < utilityParts.length; index++){
            const part = utilityParts[index];

            if (index === utilityParts.length - 1) {
            value = part;
            } else if (part.startsWith('@')) {
            hasMediaQuery = true;
            mediaQuery = part;
            } else {
            prefix = part;
            }
        }

        parsedStyleDefinitions.push({ mediaQuery: mediaQuery || null, prefix: prefix || null, value });
    }

    return parsedStyleDefinitions;
}

function resolveCssValue(value){
    const maybeSplittedVar = value.split('--');

    if(maybeSplittedVar.length == 2){
	const [propertyOrAlias, value] = maybeSplittedVar;

	const property = resolveAlias(propertyOrAlias);

	if(property instanceof Array){
	    return property.map((p) => ({p, v: `var(--${value})`}))
	}

	return [{p: property, v: `var(--${value})`}]
    }

    const maybeSplittedLiteral = value.split('-[');

    if(maybeSplittedLiteral.length == 2){
	const [propertyOrAlias, rawValue] = maybeSplittedLiteral;

	const value = rawValue.slice(0, -1); // strip last character ']'

	const property = resolveAlias(propertyOrAlias);


	if(property instanceof Array){
	    return property.map((p) => ({p, v: value}))
	}


	return [{p: property, v: value}]
    }

    console.error('Invalid tailvars value', value);
    return [];
}

const NOT_SET_KEY = '__null';

function createTreeForMediaQuery(parsedStyleDefinitions) {
    const tree = {};

    for(const { mediaQuery, prefix, value } of parsedStyleDefinitions){
	const mediaKey = mediaQuery || NOT_SET_KEY;
	const prefixKey = prefix || NOT_SET_KEY;

	if (tree[mediaKey] === undefined) {
	    tree[mediaKey] = {};
	}

	if(tree[mediaKey][prefixKey] === undefined){
	    tree[mediaKey][prefixKey] = [];
	}

	for(const item of resolveCssValue(value)){
	    tree[mediaKey][prefixKey].push(item);
	}
    }
    return tree;
}

function resolveMediaQuery(mediaQueryRaw){
    const mediaQuery = mediaQueryRaw.slice(1); // strip '@'



    return window.VARWIND_EXTRA_MEDIA_QUERIES[mediaQuery] ||
           window.VARWIND_DEFAULT_MEDIA_QUERIES[mediaQuery] ||
           mediaQuery;
}

function resolvePrefix(prefix){
    return window.VARWIND_EXTRA_PREFIX_ALIASES[prefix] ||
           window.VARWIND_DEFAULT_PREFIX_ALIASES[prefix] ||
           prefix;
}


function resolveAlias(alias){
    return window.VARWIND_EXTRA_PROPERTY_ALIASES[alias] ||
           window.VARWIND_DEFAULT_PROPERTY_ALIASES[alias] ||
           alias;
}

const ELEMENT_TO_CLASS_MAP = new WeakMap();

function applyStyles(targetElements){
    for(const element of targetElements){
	const attributeValue = element.getAttribute(ATTRIBUTE_NAME);

	const parsedStyleDefinitions = processAttributeValue(attributeValue);

	const mediaQueryTree = createTreeForMediaQuery(parsedStyleDefinitions);

	let moreSpecificClassContent = '';
	let leastSpecificClassContent = '';

	let styles = {};

	let generatedClassName = undefined;

	for(const mediaQuery of Object.keys(mediaQueryTree)){
	    const mediaQueryStyles = mediaQueryTree[mediaQuery];

	    for(const prefix of Object.keys(mediaQueryStyles)){
		const styleDefinitions = mediaQueryStyles[prefix];

		if(prefix === NOT_SET_KEY && mediaQuery === NOT_SET_KEY){
		    for(const {p, v} of styleDefinitions){
			styles[p] = v;
		    }

		}else{
		    // determine classname
		    if(!ELEMENT_TO_CLASS_MAP.has(element)){

			let generatedClassName = generateClassName();
			ELEMENT_TO_CLASS_MAP.set(element, generatedClassName);

			const styleElement = document.createElement('style');
			styleElement.classList.add(generatedClassName);
			document.head.appendChild(styleElement);
		    }

		    generatedClassName = ELEMENT_TO_CLASS_MAP.get(element);

		    let currentClassContent = "";

		    if(mediaQuery !== NOT_SET_KEY){
			const cssMediaQuery = resolveMediaQuery(mediaQuery);
			currentClassContent += `@media ${cssMediaQuery} { \n`;
		    }

		    if(prefix !== NOT_SET_KEY){
			// translate prefix to css selector
			const cssPrefix = resolvePrefix(prefix);
			currentClassContent += `.${generatedClassName}${cssPrefix} { \n`;
		    }else{
			currentClassContent += `.${generatedClassName} { \n`;
		    }

		    for(const {p, v} of styleDefinitions){
			currentClassContent += `${p}: ${v}; \n`;
		    }

		    currentClassContent += "}\n";

		    if(mediaQuery !== NOT_SET_KEY){
			currentClassContent += "}";
		    }

		    if(prefix !== NOT_SET_KEY && mediaQuery === NOT_SET_KEY){
			moreSpecificClassContent += currentClassContent + " ";
		    }else{
			leastSpecificClassContent += currentClassContent + " ";
		    }

		}
	    }
	}

	let prefixClassContent = "";

	const useClass = leastSpecificClassContent !== '' || moreSpecificClassContent !== ''

	if(useClass){
	    prefixClassContent += "\n";
	    prefixClassContent += `.${generatedClassName} { \n`;
	}

	for (const [key, value] of Object.entries(styles)) {
	    if(!useClass){
		element.style.setProperty(key, value);
	    }else{
		prefixClassContent += `${key}: ${value}; \n`;
	    }
	}

	if(useClass){
	    prefixClassContent += "}\n";
	}

	const classContent = prefixClassContent + leastSpecificClassContent + moreSpecificClassContent;

	if(!useClass){
	    return;
	}

	// add styles to the style element
	const styleElement = document.querySelector(`style.${generatedClassName}`);
	styleElement.innerHTML = classContent;

	// attach the class to the element
	element.classList.add(generatedClassName);
    }
}

function onStylesheetsLoaded(callback) {
    const stylesheets = [...document.styleSheets];
    if (stylesheets.every(sheet => sheet.cssRules !== null)) {
        callback();
    } else {
        window.addEventListener('load', callback);
    }
}

function initializeStyles() {
    requestAnimationFrame(() => {
        applyStyles(document.querySelectorAll(`[${ATTRIBUTE_NAME}]`));
    });
}

function handleDevToolsChanges() {
    const allNodes = document.querySelectorAll(`[${ATTRIBUTE_NAME}]`);

    for(const node of allNodes){
        const oldValue = node.getAttribute(ATTRIBUTE_NAME);
        Object.defineProperty(node, ATTRIBUTE_NAME, {
            get: function() {
                return this.getAttribute(ATTRIBUTE_NAME);
            },
            set: function(newValue) {
                this.setAttribute(ATTRIBUTE_NAME, newValue);
                requestAnimationFrame(() => applyStyles([this]));
            }
        });
        // Trigger the setter to apply initial styles
        node[ATTRIBUTE_NAME] = oldValue;
    };
}



function setupObserver(){
    // Create a MutationObserver to watch for changes in the x-css-vars attribute
    const observer = new MutationObserver(mutations => {
        for(const mutation of mutations){
            if (mutation.type === 'attributes' && mutation.attributeName === ATTRIBUTE_NAME) {
            const updatedNodes = mutation.target.querySelectorAll(`[${ATTRIBUTE_NAME}]`);
            applyStyles(updatedNodes);
            }
        }
        });

        observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: [ATTRIBUTE_NAME]
    });
}

// Start observing the document with the configured parameters
if (document.readyState === 'loading') {
  // If not, add an event listener
    document.addEventListener('DOMContentLoaded', () => {
        onStylesheetsLoaded(() => {
                initializeStyles();
            setupObserver();
                handleDevToolsChanges();
        });
    });
} else {
    onStylesheetsLoaded(() => {
        initializeStyles();
        setupObserver();
        handleDevToolsChanges();
    });
}

