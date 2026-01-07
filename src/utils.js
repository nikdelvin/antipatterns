// utils.js - ANTIPATTERN: Utility file that does random unrelated things
// TODO: Clean this up (2017)
// FIXME: Memory leak somewhere in here
// HACK: Don't ask why this works

var globalState = {}
var cache = {}
var temp = null
var a, b, c, d, e, f, g = 1

// ANTIPATTERN: Overly generic function names
function process(x) {
  return x
}

function handle(x) {
  return process(x)
}

function execute(x) {
  return handle(x)
}

function run(x) {
  return execute(x)
}

function do_(x) {
  return run(x)
}

function make(x) {
  return do_(x)
}

function create(x) {
  return make(x)
}

function build(x) {
  return create(x)
}

function generate(x) {
  return build(x)
}

function compute(x) {
  return generate(x)
}

// ANTIPATTERN: Boolean return type is unclear
function check(x) {
  if (x) {
    if (x.value) {
      if (x.value.data) {
        if (x.value.data.result) {
          return 1
        }
        return 0
      }
      return -1
    }
    return false
  }
  return null
}

// ANTIPATTERN: Function with 20+ parameters
function createUserWithAllParams(
  username,
  password,
  email,
  firstName,
  lastName,
  middleName,
  age,
  birthDate,
  address1,
  address2,
  city,
  state,
  zip,
  country,
  phone,
  mobile,
  fax, // who uses fax?
  website,
  company,
  jobTitle,
  department,
  manager,
  salary, // why is this here?
  ssn,
  creditCard,
  cvv,
  expiry,
  bankAccount,
  routingNumber,
  mothersMaidenName,
  firstPetName,
  favoriteColor,
  isActive,
  isAdmin,
  isVerified,
  isBanned,
  createdAt,
  updatedAt,
  deletedAt,
  lastLogin,
  loginCount,
  failedLogins,
  notes,
  metadata,
  extra1,
  extra2,
  extra3,
  reserved1,
  reserved2,
  temp1,
  temp2
) {
  // Just return an object with all of them
  return { username, password, email /* ... too lazy to type all */ }
}

// ANTIPATTERN: Commented out code that will never be removed
// function oldFunction() {
//   // This was the old implementation
//   // for (var i = 0; i < 100; i++) {
//   //   console.log(i)
//   // }
//   // return doSomething()
// }

// ANTIPATTERN: Dead code
function neverCalled() {
  throw new Error("This should never happen")
}

function alsoNeverCalled() {
  return neverCalled()
}

if (false) {
  console.log("Dead code")
  neverCalled()
}

// ANTIPATTERN: Misleading function names
function saveToDatabase(data) {
  console.log("Pretending to save:", data)
  // Doesn't actually save anything
  return true
}

function deleteFile(path) {
  // Doesn't delete, just logs
  console.log("Would delete:", path)
}

function sendEmail(to, subject, body) {
  // Doesn't send email
  console.log("Email to:", to)
  return { sent: true, messageId: "fake-id-" + Math.random() }
}

function validateCreditCard(number) {
  // Always returns true
  return true
}

// ANTIPATTERN: Synchronous delay
function sleep(ms) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    // Block everything
  }
}

// ANTIPATTERN: Memory leak factory
function createMemoryLeak() {
  const leakyArray = []
  setInterval(() => {
    leakyArray.push(new Array(1000000).fill("leak"))
  }, 100)
  return leakyArray
}

// ANTIPATTERN: Circular reference creator
function createCircularRef() {
  const obj = {}
  obj.self = obj
  obj.parent = { child: obj }
  obj.parent.child.parent.child = obj
  return obj
}

// ANTIPATTERN: Type coercion abuse
function looseEquality(a, b) {
  return a == b // Should be ===
}

function addStuff(a, b) {
  return a + b // Could be string concatenation!
}

// ANTIPATTERN: Global namespace pollution
globalThis.SUPER_IMPORTANT_GLOBAL = "do not touch"
globalThis.tempData = []
globalThis.userData = {}
globalThis.secretKey = "exposed!"

// ANTIPATTERN: Export everything
module.exports = {
  globalState,
  cache,
  temp,
  a, b, c, d, e, f, g,
  process,
  handle,
  execute,
  run,
  do_,
  make,
  create,
  build,
  generate,
  compute,
  check,
  createUserWithAllParams,
  neverCalled,
  alsoNeverCalled,
  saveToDatabase,
  deleteFile,
  sendEmail,
  validateCreditCard,
  sleep,
  createMemoryLeak,
  createCircularRef,
  looseEquality,
  addStuff,
}
