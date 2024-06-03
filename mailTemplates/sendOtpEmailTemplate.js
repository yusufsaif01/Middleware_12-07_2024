module.exports = ({ email, otp, activation_link, name }) => {
  return {
    to: email,
    subject: "Website access request",
    html() {
      return `
      <table class="spacer" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   width: 100%;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <td height="20" style="
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            border-collapse: collapse !important;
            hyphens: auto;
            line-height: 20px;
            margin: 0;
            mso-line-height-rule: exactly;
            padding: 0;
            vertical-align: top;
            word-wrap: break-word;
            "></td>
        </tr>
    </tbody>
</table>
<table width="100%" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <th style="
            color: #626262;
            line-height: 1.3;
            margin: 0;
            padding: 0;
            ">
                <h2 class="text-center" style="
               color: #626262;
               font-family: 'Paytone One',
               'Montserrat ', sans-serif;
               font-size: 30px;
               font-weight: 700;
               line-height: 1.3;
               margin: auto;
               padding: 0;
               text-align: center;
               width: 90%;
               word-wrap: normal;
               ">
                    Hi there
                </h2>
            </th>
        </tr>
    </tbody>
</table>
<table class="spacer" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   width: 100%;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <td height="20" style="
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            border-collapse: collapse !important;
            color: #626262;
            hyphens: auto;
            margin: 0;
            mso-line-height-rule: exactly;
            padding: 0;
            vertical-align: top;
            word-wrap: break-word;
            "></td>
        </tr>
    </tbody>
</table>
<table width="100%" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <th style="margin: 0; padding: 0">
                <p class="text-center" style="
               color: #626262;
               font-family: Montserrat, sans-serif;
               font-size: 14px;
               font-weight: 300;
               line-height: 1.3;
               margin: auto;
               margin-bottom: 0px;
               padding: 0;
               text-align: center;
               width: 90%;
               ">
                        Use the below OTP to access the website.
                </p>
            </th>
        </tr>
    </tbody>
</table>
<table class="spacer" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   width: 100%;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <td height="10" style="
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            border-collapse: collapse !important;
            hyphens: auto;
            margin: 0;
            mso-line-height-rule: exactly;
            padding: 0;
            vertical-align: top;
            word-wrap: break-word;
            "></td>
        </tr>
    </tbody>
</table>
<table width="100%" style="
   border-collapse: collapse;
   border-spacing: 0;
   padding: 0;
   vertical-align: top;
   ">
    <tbody>
        <tr style="padding: 0; vertical-align: top">
            <th style="margin: 0; padding: 0">
                <p class="text-center" style="
               color: #626262;
               font-family: Montserrat, sans-serif;
               font-size: 14px;
               font-weight: 400;
               line-height: 1.3;
               margin: auto;
               margin-bottom: 0px;
               padding: 0;
               text-align: center;
               width: 90%;
               ">
                    ${otp}
                </p>
            </th>
        </tr>
    </tbody>
</table>
            `;
    },
    text: `Welcome to YFTChain.`,
  };
};
