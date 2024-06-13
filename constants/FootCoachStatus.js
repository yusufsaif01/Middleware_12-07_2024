class FootCoachStatus {
  static get ADDED() {
    return "added";
  }
  static get PENDING() {
    return "pending";
  }
  static get REJECTED() {
    return "rejected";
  }
  static get INVITED() {
    return "invited";
  }
}

module.exports = FootCoachStatus;
