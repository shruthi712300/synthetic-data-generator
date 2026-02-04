var cookie = getCookie('authToken');
console.log(cookie);
if (cookie == '') {
  window.location.href = "/login";
}


function getCookie(name) {
  var value = "; " + document.cookie;
  if (value.indexOf(name) == -1) {
    var _cookie = '';
    return _cookie;
  }
  var parts = value.split("; " + name + "=");
  console.log(parts);
  if (parts.length == 2) return parts.pop().split(";").shift();
}

