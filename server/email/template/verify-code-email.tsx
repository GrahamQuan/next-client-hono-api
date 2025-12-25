/** @jsxImportSource react */

import { Body, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from '@react-email/components';
import env from '../../lib/env';

const WebsiteName = env.EMAIL_WEBSITE_NAME;
const WebsiteUrl = env.EMAIL_WEBSITE_URL;
// base64 image (64*64)
// const WebsiteLogo =
//   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAADAFBMVEVHcEyVtNtmvP6+zObr5vF8reKJyvtXaqet2Pxqn9+y6Po2cbGRz/+j0vx7wPpagb1igrEoZ7x7z/2e1vo6jOSXz/yb0PxutPFSndxBdLaEzP1Zr/Sb2P+Gx/xOkt+As+5Bg9M6ecQ3eco/db45fN206f+m4P+Mxvad3v+99/6ExvpCjNhir/aIxvtrtvmFwPhdkdRFh+Cb3P1Okd9wse0+i+M9c7dpo+EoYMItZbsfUI//AACo4/+K0fh5r+9kxf1UidZvq/BBiMtTldMkTZIhWagwWaUtZ7sqU54qY64dPYFFsvqS2f9OsPYpaLxVrvFVo/Rpyf9QoutRpO7B///F//9Srfhluv6Ezf+F0f9twv69/f9suv5rz/+U1f9QoOmR0v9jtPNs1f9cv/+Izv+L0/2v8P+R2P9Ot/+t6/9KpfRxzP5ImuKR4f982/941P9pru83rP5Mmdlsx/9Ioe972P87t/9er/Nov/6O0Pk4sv5zx/2s4v6z9v9Kiu9Pn+aX5/910P5et/4xoPxImN9crvw4p/5kxP9dofOp5/9QqfRSqvdsvfppzP9Inulisfl+u/dbu/+28P6X3PxgpveL3P+F1P9SpPyj4/+Bx/23//9Rp/FKnOWW2f9nt/o1pP1xv/x+5/9wxf+C8/+EvPdrvv5Ym9Ow+/+i6/66+/9Svv5Izv95v/dJjONKh8g8v/+n8P+EwPmGxPkxqP5Mkc59w/15t/iB+f9kwf+E1/+f4P1Ps/19yv+u8/+e2vxwtPSXzvys3f9PkexSoeBYxf9Au/5XtP5jx/9Crf2+9P+k//9hvftCsf45mO7Q//9ameVdpdtXqedaqPFiyv9Zqf1Fw/8ectad0vlw3v9l2P+Lw+tNnd9MmNZNltqy7f5greo/kuWe9v7D/f8of9ef/P9dzv9esu2YyPOX8P9ruvE6oPVOkdRWtvcoiu5o7f9Ox/9yrvw/g8p87/9MmPU3ec1HheNq4/8uh9yL+P8ndrxR3f/C+/+K7f9apOhP2P9aqvtgRK2pAAAA03RSTlMADP8GAhj+OxEq/v79H94wIfD+c/RNNV79U5i5KkGX/q7fxo39VqaMwe3Eu5qt+HA+y+97z951Q87W+wTZ4+d8WbbiYKPSasmHtMDv1c/h4X3////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+JEc7BAAACBNJREFUWMPtl2dYk1kWx0lAVEBGsSD2Xsc6ll2d3rdvCqSRkJCEJKRTI0kIhFACQoAkQAiEAFJCb0oH6SgwCFgAC5axF9a+6jjufWWdZVZwQD7t8+z/Sz79fzn3nHvPOa+Z2dS03+z/eqfMYTNmLVk6f8GsGeaTcFmYA9eC+Wvnzl20bsOGP39iY2lru2nL+m0QB2bx2/6169Zt+PjjnTtJZLKNDZlMptMtD0UfiY4+svzTT3d98eE2+6XT3vn3azceUyYkJFTVJSeTSGRAIZNLDh0qjgYESPX1W7cunvkO/9yNL47FKpVKiEBKTmYAkSxLSooPFR+GZDwYKhLBxyeYz93oCABWkjMH3ohOP2BZUlxcotMdzsurF1zrwMBFHZs/GNsPW2/lCABWVeqhhQubFjb19JwAasqEdOLgTYqIMjREMWAy4E6rxiTMWG+FBoALdepssYeHxzmPpqaz4Pf87TKgno6enjQ8BfgxcAzGZSzCtEVKAuHy5di6yqIi76Hz5855IPUoFNIlKens2bMyyrWyngwxGw+Hw0VwDPzid28RZm3JRhNMx6zUvABTEY/tcf6cB8oJKFyPQqL0TpRzZb7OeHEgAg+SANJw5XfTf+1fsiWbgDbFSripXCkh25t37byHBxL4I/R6FxeU3hd520PlnJEmZrPTnDNEotA7p39NWLIpwWQyxVoFpKcXESBAYJNCIYMCQCFlMqQ+wisJqXJ2xqelsQPZeDxeFKofTbBYsKkqNjaWpbyRnn6JQDBle3vzKAqOLMIpAvLLXFDuXlHhAJCRloYgBgZ6esJFoe6nf/8LYamtmhVrilX+lJ6enoUmEAIAQOzCORseoR8BuLtHRUX4OkMheCKI/EhEhSi04tYbgsV8WxJLSjAV/VRenn4JDQH44Ay+SJkeKoPMBQogyes1wAgACCIbQSRGVlDv/puwwJYc+wKNlqY+KC//J2EEwPcONLxOAKijCxIEwHEPVx0EwgNAZCSC6DpARNy5cnrVbACYTzr2gyP6eDkEyEIDEbiBfH6gQVUdgYIugizK3YvDCe+lZACAyDMShAARXImu4VeeLgMPfFuV4w+Ol8rLU1PTf0S/Bmj5EEDg6wT84CZFuScpopx6KUYRPrLPMzIykkgcARC9rqwGgJm7S44l8B48AIDEEUAln8fzPjgCcEniRHlxFKjWXgrIoOvVilBi/5N+4AZiU1a8bg4Oc847s/tTU1NHAkC/wLJ5PJ5RIOgFKZBxFElJCk51Tq/B09OzjxoTinhy794T1wHXyI7GHSMPe/+3+wq6wwxiXq3psiPQixpPb2+7mwLBEAAkKRQcjiKKWR0GAagx8grEwL17A83U1qT7K7e/6QPf77O+/7jxVQY+kB/HSFCyEYHiegHQS2QURwEJxQwPwyAQoTFyOTUmJqYjIy+6wHrO57+MJ9jX+woKHj8k1R21zDNoun07MKpgjSYsLIxioNy8ebNeYDAaOkLb2irkwRrBkWKbo0fPZFpb7/lPi90/+4/WBQX5KqnUqqGh4cz1wUOgB/4DKDOzSX+H6RT/8OLCly81mpOasO7l168D/wlr69Ww0a9p+jePbhfkDyYmSlmSBsmlbPWBQdBLlxc8e/bsyt27d58+LSi73Q1CCtMMAv/R5fcfrfiv7uwwJ78xvzs7MdEkvWCVdfz4j5cCGHR6B3hFXV232ltOXRvy9Q1WaTQlajWJbCm7v+qtzvrtnEb/RmMWILhJE48Dwg2t9kb/cA6z00/IzMnp6wuVyz0xzgw16PeUi19uf7slfz/H3/8hHRyi1i0L2AMYuDhuf+6wT0hQSGd189WrfTGgDnHQvMjrmvfVWE3560eN/vHZUjeg2oAALQ1Lq+zPPeVTGhQU0t7c1taGwSD4Ackkss5r3kdjzrjZf3jk71/PYrHcLrACuHQcTqt1zc31EZYGpbRTqR0YDAav5TLItIiLy2BjD4YPvlnjn29ZCyK4EECn0XA4S3FuYVCpn1DYGUOVY+QqNldNtsF0bR53PE7/62N/lypwArcqGg2L1enELX5BQX4+nUxw/+TBqkouw0Z8a8e4o83CwgEkUqBkuUlZdADAYmsgQKlPe04zVR4cbORyyVin3dvftVLsAYcYZLGk0ioaFofD1hSCHKb4tTc3t558pcJxGbQ78z5/53oAW73Gv7uOVZtVRKfh4rA1oAgpKUKf5tb4k6+MWi754DgFGF2KNaAStVlZXByIADvcIkxJKW0B/mA5TkvKyx+vAKMI3z1uPHABhKDVVmLjrp5q8fHxYQYHt7aKGfTi/BXTfnvJmb4yP6xOomQx4uIOR1MLCwt9/CLi4+NfYem07h0zJ7JmOax8WN8gkahBDo7IIUC7EwAYaTTV7r0T29P2zIsvkUgS6HGVOoOfn5+wnVkdEYylGf9kP9H9cPVFzRmJhBFXiTWEhISktDOZ1Uba4erPJrwuwlY8FDRI6nC4GmcACGqvro7BYuUfwia8bO6fvblsUNJA09UYb4EIQADsONHiaZPZcqevzDzTQNLZibuCUjqHh9sqxX9ZMrk92eHLeqVSp6vp6ko59fMw3+5vSye7aX+1kO52IM+uszQl9/mAXa/9ZP0W5h8NJVTleecI/X5+zt/6d/PJL/uwZXksy5ocYcvzAeMkCjAqhtmLGWodVXjqKv6LaWbvpZm7EnAVQqZo10yz99TeT7ht7TG2e83eW/Y72Z1w+/f3m+2fa8f8zHwKADPYokUzpvblNmOK/v8JTfX7/V+mdepHF5ql9wAAAABJRU5ErkJggg==';
const WebsiteLogo = 'https://assets.grahamquan.com/avatar/IMG_9444.JPG';

export default function VerifyCodeEmail({ verificationCode }: { verificationCode: string }) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>{WebsiteName} Email Verification</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Img src={WebsiteLogo} width='64' height='64' alt={`${WebsiteName}'s Logo`} />
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Verify your email address</Heading>
              <Text style={mainText}>
                Thanks for starting the new {WebsiteName} account creation process. We want to make sure it&apos;s
                really you. Please enter the following verification code when prompted. If you don&apos;t want to create
                an account, you can ignore this message.
              </Text>
              <Section style={verificationSection}>
                <Text style={verifyText}>Verification code</Text>

                <Text style={codeText}>{verificationCode}</Text>
                <Text style={validityText}>(This code is valid for 10 minutes)</Text>
              </Section>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={cautionText}>
                {WebsiteName} will never email you and ask you to disclose or verify your password, credit card, or
                banking account number.
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            This message was produced and distributed by {WebsiteName}, Inc., 410 Terry Ave. North, Seattle, WA 98109. ©
            2022, {WebsiteName}, Inc.. All rights reserved. {WebsiteName} is a registered trademark of{' '}
            <Link href={WebsiteUrl} target='_blank' style={link}>
              {WebsiteName}
            </Link>
            , Inc. View our{' '}
            <Link href={WebsiteUrl} target='_blank' style={link}>
              privacy policy
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#fff',
  color: '#212121',
};

const container = {
  padding: '20px',
  margin: '0 auto',
  backgroundColor: '#eee',
};

const h1 = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '15px',
};

const link = {
  color: '#2754C5',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  textDecoration: 'underline',
};

const text = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '24px 0',
};

const imageSection = {
  backgroundColor: '#252f3d',
  display: 'flex',
  padding: '20px 0',
  alignItems: 'center',
  justifyContent: 'center',
};

const coverSection = { backgroundColor: '#fff' };

const upperSection = { padding: '25px 35px' };

const lowerSection = { padding: '25px 35px' };

const footerText = {
  ...text,
  fontSize: '12px',
  padding: '0 20px',
};

const verifyText = {
  ...text,
  margin: 0,
  fontWeight: 'bold',
  textAlign: 'center' as const,
};

const codeText = {
  ...text,
  fontWeight: 'bold',
  fontSize: '36px',
  margin: '10px 0',
  textAlign: 'center' as const,
};

const validityText = {
  ...text,
  margin: '0px',
  textAlign: 'center' as const,
};

const verificationSection = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const mainText = { ...text, marginBottom: '14px' };

const cautionText = { ...text, margin: '0px' };
