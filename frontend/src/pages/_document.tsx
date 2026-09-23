import { Html, Head, Main, NextScript } from 'next/document';
import Document, { DocumentContext, DocumentInitialProps } from 'next/document';

// A link preview image has to be an absolute URL — crawlers such as WhatsApp,
// Slack and Teams do not resolve relative paths. The origin is read off the
// incoming request, so dev, staging and production each advertise their own
// host without any per-environment configuration.
const header = (ctx: DocumentContext, name: string): string | undefined => {
  const value = ctx.req?.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
};

const originOf = (ctx: DocumentContext): string => {
  const host = header(ctx, 'x-forwarded-host') || header(ctx, 'host');
  if (!host) return '';
  const local = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const protocol = header(ctx, 'x-forwarded-proto') || (local ? 'http' : 'https');
  return `${protocol}://${host}`;
};

interface DocumentProps extends DocumentInitialProps {
  origin: string;
}

class MyDocument extends Document<DocumentProps> {
  static override async getInitialProps(ctx: DocumentContext): Promise<DocumentProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, origin: originOf(ctx) };
  }

  override render() {
    const { origin } = this.props;
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          {origin
            ? [
                <meta key="og:url" property="og:url" content={origin} />,
                <meta key="og:image" property="og:image" content={`${origin}/og-image.png`} />,
                <meta key="twitter:image" name="twitter:image" content={`${origin}/og-image.png`} />,
              ]
            : null}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
