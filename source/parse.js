module.exports = parseDocument

function parseDocument(data) {
  // split the input txt document into lines
  const lines = data.split('\n').map(item => item.trim())

  const frontMatterDivider = lines.findIndex(x => x === grammar.frontMatterFlag);
  console.log(frontMatterDivider)


  // parse JSON metadat from the first line
  // parse each line and only keep the ones that dont return null
  return { metadata: parseFrontMatter(lines.slice(0, Math.max(frontMatterDivider, 0))),
           content: lines.slice(frontMatterDivider  + 1).map(parseLine).filter(item => item)
         }
}

//----------------------------------------------------------------
// grammar rules
//----------------------------------------------------------------
const grammar = {
  // Determines the end of the front matter (metadata)
  frontMatterFlag: ":::",

  // Delimeter between keys and values in the front matter
  frontMatterDelim: ":",

  // Flags the token as the name of a class
  classFlag: "@",

  // Delimeter between class names
  classListDelim: '.',

  // Flags the whole line as void
  commentFlag: "//",

  // Flags to wrap inline elements
  inlineFlags: {
    '*' : 'em',
    '~' : 'strong',
    '|' : 'a',
  },

  // Flags to wrap inline elements
  // no flag will resut in p
  blockLevelFlags: {
    '#' : 'h1',
    '##' : 'h2',
    '###' : 'h3',
    '####' : 'h4',
    '#####' : 'h5',
    '-' : 'li',
    '•' : 'li',
    '>' : 'blockquote',
  },

  // Flags for multi-element chunks, or for special cases
  macroFlags: {
    '===' : 'slideStart',
    '!==' : 'slideEnd',
    '[]' : 'task',
    'IMG' : 'img',
  }
}

//----------------------------------------------------------------
// parses the frontmatter
//----------------------------------------------------------------
function parseFrontMatter(lines) {
  let frontMatter = {}
  lines.forEach(item => {
    let [key, val] = item.split(grammar.frontMatterDelim)
    frontMatter[key.trim()] = val.trim()
  })
  console.log(frontMatter)
  return frontMatter;
}

//----------------------------------------------------------------
// parses each line of the input data
//----------------------------------------------------------------
function parseLine(line) {
  if (line.length === 0) return null
  if (line.startsWith(grammar.commentFlag)) return null

  const macro = makeMacro(line)
  if (macro) return macro

  return makeElem(line)
}


//----------------------------------------------------------------
// makes an js object with required dat to make block-level html elems
//----------------------------------------------------------------
function makeElem(line) {
  // split the line into spaceDelimeted tokens
  const tokens = line.split(' ')
  let pos = 0

  let result = {
    tag: 'p', // default is paragrpah tag
    text: ''
  }

  // is the first token a html flag (ie # for h1)
  if (isElement(tokens[pos])) {
    result.tag = grammar.blockLevelFlags[tokens[pos]]
    pos++
  }

  // is the first token a class flag (is @)
  if (isClass(tokens[pos])) {
    result.class = extractClass(tokens[pos])
    pos++
  }

  result.text = tokens.slice(pos)
                      .reduce((accum, token) => accum + ' ' + parseContentToken(token))

  return result;
}

//----------------------------------------------------------------
// handles collapsing inline flags to the proper html tag
//----------------------------------------------------------------
function parseContentToken(token) {
  let output = token

  for (let flag in grammar.inlineFlags) {
    if (token.startsWith(flag)) {
      let text = output.substring(1)
      output = openInlineTag(grammar.inlineFlags[flag], text)
    }

    if (token.endsWith(flag)) {
      let text = output.substring(0, output.length - 1)
      output = closeInlineTag(grammar.inlineFlags[flag], text)
    }
  }
  return output;
}

//----------------------------------------------------------------
// Trys to make a macro (slideStart, slideEnd)
//----------------------------------------------------------------
function makeMacro(line) {
  let pos = 0;
  const tokens = line.split(' ')
  for (let macro in grammar.macroFlags) {

    if (tokens[pos].startsWith(macro)) {
      let output = { macro: grammar.macroFlags[macro] }
      pos++;

      if (tokens[pos]) {
        if (isClass(tokens[pos])){
          output.class = extractClass(tokens[pos])
          pos++;
        }

        if(tokens[pos]) {
          output.text = tokens.slice(pos).reduce((accum, token) => accum + ' ' + parseContentToken(token))
        }
      }
      return output;
    }
  }
}


//----------------------------------------------------------------
// helpers
//----------------------------------------------------------------
function isElement(token){
  return grammar.blockLevelFlags.hasOwnProperty(token);
}

function isClass(token) {
  return token[0] === grammar.classFlag
}

function extractClass(token) {
    return token.substr(1, token.length).split(grammar.classListDelim).join(' ').trim();
}

function openInlineTag(tag, text){
  return `<${tag}>${text}`
}

function closeInlineTag(tag, text){
  return `${text}</${tag}>`
}
