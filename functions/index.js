const sendResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  }
}

const validateInput = (data) => {
  const body = JSON.parse(data);
  const { email, password } = body
  return !(!email || !password || password.length < 8);
}

module.exports = {
  sendResponse, validateInput
};
