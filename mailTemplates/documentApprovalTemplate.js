module.exports = ({ email, documentType, name, memberType }) => {
  return {
    to: email,
    subject: "Your document details is verified",
    // html: "",
    text: `${documentType} document details for ${name} has been approved successfully by YFTChain.`,
  };
};