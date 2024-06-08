const Promise = require("bluebird");
const mailer = require("../mailer");
const mailTemplates = require("../mailTemplates");
const render = require("../mailTemplates/render");
const config = require("../config");
const {
  EmailClient,
  KnownEmailSendStatus,
} = require("@azure/communication-email");
class EmailService {
  async forgotPassword(email, otp) {
    console.log("otp and email is=>", email,otp);
    await this.sendMail("forgotPasswordOtp", {
      email: email,
      otp: otp,
    
    });
  }

  async emailVerification(email, otp) {
    console.log("otp before inset in sendmail",otp)
    await this.sendMail("sendOtpEmail", {
      email: email,
      otp: otp,
    });
  }

  async welcome(email) {
    await this.sendMail("welcome", { email: email });
  }

  async changePassword(email, name) {
    await this.sendMail("changePassword", { email: email, name });
  }

  async footplayerRequest(send_to_email, sent_by = {}) {
    await this.sendMail("footplayerRequest", {
      send_to_email: send_to_email,
      sent_by_member_type: sent_by.member_type,
      sent_by_name: sent_by.name,
      player_name: sent_by.player_name,
    });
  }

  async sendFootplayerInvite(send_to_email, send_to_name, sent_by = {}, link) {
    await this.sendMail("footplayerInvite", {
      send_to_email: send_to_email,
      send_to_name,
      sent_by_member_type: sent_by.member_type,
      sent_by_name: sent_by.name,
      link: link,
    });
  }

  async sendMail(mailTemplate, data) {
    try {
      let { to, subject, html, text } = mailTemplates[mailTemplate](data);
      if (html) {
        html = render(html, data);
      }
      // let details = await mailer.send({ to, subject, html, text });
      //fetch data from config file
      const connectionString = config.azureMailer.connection_String;
      const senderAddress = config.azureMailer.senderAddress;

      const POLLER_WAIT_TIME = 4;

      const message = {
        senderAddress: senderAddress,
        recipients: {
          to: [{ address: to }],
        },
        content: {
          subject: subject,
          plainText: text,
          html: html,
        },
      };

      try {
        const client = new EmailClient(connectionString);

        const poller = await client.beginSend(message);

        if (!poller.getOperationState().isStarted) {
          throw "Poller was not started.";
        }

        let timeElapsed = 0;
        while (!poller.isDone()) {
          poller.poll();
          console.log("Email send polling in progress");

          await new Promise((resolve) =>
            setTimeout(resolve, POLLER_WAIT_TIME * 1000)
          );
          timeElapsed += 10;

          if (timeElapsed > 18 * POLLER_WAIT_TIME) {
            throw "Polling timed out.";
          }
        }

        if (poller.getResult().status === KnownEmailSendStatus.Succeeded) {
          console.log(
            `Successfully sent the email (operation id: ${
              poller.getResult().id
            })`
          );
        } else {
          console.log("in else error");
          throw poller.getResult().error;
        }
      } catch (ex) {
        console.log("in else catch ");
        console.error(ex);
      }
    } catch (err) {
      console.log("Error in sending mail", err);
      return Promise.resolve();
    }
  }

  async profileVerified(email) {
    await this.sendMail("profileVerified", { email: email });
  }
  async profileDisapproved(email, remarks) {
    await this.sendMail("profileDisapproved", { email: email, remarks });
  }

  async employmentContractApproval(data) {
    await this.sendMail("employmentContractApproval", data);
  }

  async employmentContractDisapprovalByPlayer(data) {
    await this.sendMail("employmentContractDisapprovalByPlayer", data);
  }
  async employmentContractDisapprovalByClubAcademy(data) {
    await this.sendMail("employmentContractDisapprovalByClubAcademy", data);
  }
  async employmentContractApprovalByClubAcademy(data) {
    await this.sendMail("employmentContractApprovalByClubAcademy", data);
  }
  async employmentContractApprovalByPlayer(data) {
    await this.sendMail("employmentContractApprovalByPlayer", data);
  }

  async employmentContractCreatedClubAcademy(data) {
    await this.sendMail("employmentContractCreatedClubAcademy", data);
  }
  async employmentContractCreatedPlayer(data) {
    await this.sendMail("employmentContractCreatedPlayer", data);
  }

  async employmentContractApprovalAdmin(data) {
    await this.sendMail("employmentContractApprovalAdmin", data);
  }
  async employmentContractDisapprovalAdmin(data) {
    await this.sendMail("employmentContractDisapprovalAdmin", data);
  }

  async footPlayerInviteAccepted(data) {
    await this.sendMail("footPlayerInviteAccepted", data);
  }
  async postEmailConfirmation(data) {
    await this.sendMail("postEmailConfirmation", data);
  }
  async reportCardAdded(data) {
    await this.sendMail("reportCardAdded", data);
  }
  async sendOtpEmail(data) {
    await this.sendMail("sendOtpEmail", data);
  }
}

module.exports = EmailService;
