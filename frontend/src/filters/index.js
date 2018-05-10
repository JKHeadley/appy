const urlParser = document.createElement('a')

export function domain(url) {
  urlParser.href = url
  return urlParser.hostname
}

export function count(arr) {
  return arr.length
}

export function prettyDate(date) {
  var a = new Date(date)
  return a.toDateString()
}

export function pluralize(time, label) {
  if (time === 1) {
    return time + label
  }

  return time + label + 's'
}

export function shortMessage(message, length) {
  if (message && message.length > (length || 40)) {
    message = message.slice(0, length || 40)
    message = message + '...'
  }
  return message
}

export function userList(users) {
  let list = ''
  for (let user of users) {
    if (list === '') {
      list = list + user.firstName
    } else {
      list = list + ', ' + user.firstName
    }
  }
  return list
}
