const fs = require('fs')
const ejs = require('ejs')
const parse = require('./parse')
const render = require('./render')

// ------------
function openFile (fileName) {
  return fs.readFileSync(fileName, 'utf8')
}

// ------------
function ParseRawToHtml () {
  // arguments from CLI
  const fileName = process.argv[2]
  const outputName = fileName.split('.')[0] + '.html'
  // const outputName = process.argv[3]

  if (! fileName) {
    console.log('ERROR -- specify (arg1) valid input file')
    return
  }

  const parsedData = parse(openFile(fileName))

  const html = ejs.render( openFile('source/template.ejs'), {
    metadata: parsedData.metadata,
    content:  parsedData.content,
    renderer: render
  })

  fs.writeFileSync(outputName, html, 'utf8')
  console.log(`Success – ${fileName} parsed to ${outputName}\n`)
}


ParseRawToHtml()
