module.exports = render


// Get the HTML string for an object
function render(item) {
  if (item.macro) {
    return renderMacro(item)
  }
  return renderTag(item)
}

// class -> string
function getClass(item, baseClass = "") {
  baseClass += item.class ? ' ' + item.class : ''
  return baseClass ? ` class="${baseClass}"` : ''
}

// items that are a single tag
function renderTag(item) {
  return `<${item.tag + getClass(item)}>${item.text}</${item.tag}>`
}

// macro items
function renderMacro (item) {
  switch (item.macro) {

    case 'slideStart' :
      return `<div${getClass(item, 'slide')}><div class="content">`
      break

    case 'slideEnd' :
      return `</div></div>`
      break

    case 'task' :
      return `<p><span class="task-button" onclick="taskButton(event)"><span class="check">×</span></span>${item.text}</p>`
      break

    case 'img' :
      return `<img src="${item.text}" ${getClass(item)}>`

  }
}
