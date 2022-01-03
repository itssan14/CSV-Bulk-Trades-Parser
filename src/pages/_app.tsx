import Head from 'next/head';
import { AppProps } from 'next/app';
import { MantineProvider, AppShell, Header, Text } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Bulk trades</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme: 'light' }}
      >
        <NotificationsProvider>
          <AppShell
            fixed
            padding="md"
            header={
              <Header height={60} padding="sm">
                <div style={{ paddingLeft: 12 }}>
                  <Text size={'xl'} weight={500}>
                    Bulk Trades
                  </Text>
                </div>
              </Header>
            }
            styles={theme => ({
              main: {
                backgroundColor:
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[8]
                    : theme.colors.gray[0],
              },
            })}
          >
            <Component {...pageProps} />
          </AppShell>
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
}
