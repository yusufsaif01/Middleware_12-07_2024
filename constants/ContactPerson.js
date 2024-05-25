class ContactPersonDesignation {
  static get ALLOWED_DESIGNATION() {
    return [
      "Owner",
      "Manager",
      "Head of youth development",
      "Head coache - Under 18/ 19",
      "Head coache - Under 16/ 15",
      "Head coache - Under 14/ 13",
      "Fitness coache",
      "Goalkeeping coache",
      "Video analyst",
      "Qualified physiotherapist",
      "Head of player recruitment/ chief scout",
    ];
  }
}

module.exports = ContactPersonDesignation;
