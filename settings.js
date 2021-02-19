module.exports = {
  // Probability that your bot will reply even if it wasn't mentioned
  unmentionedProbability: 1,
  // List of words your bot will respond to, and the tag from grammar.json it'll respond with
  origins: {
    "hello": "#hello#",
    "greetings": "#hello#",
    "hey": "#hello#",
    "sing": "#sing#",
    "feedback": "#feedback#",
    "song": "#sing#",
    "music": "#sing#",
    "teach": "#lesson#",
    "twitch": "#twitch#",
    "help": "#help#",
    "credits": "#credits#",
    "learn": "#lesson#",
    // You can use the "default" command as a response when no other commands were found
    "default": "#default#"
  }
}
