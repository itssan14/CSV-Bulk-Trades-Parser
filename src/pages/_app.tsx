import Head from 'next/head';
import { AppProps } from 'next/app';
import { MantineProvider, AppShell, Header, Navbar } from '@mantine/core';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Bulk trades</title>
        <meta
          name='viewport'
          content='minimum-scale=1, initial-scale=1, width=device-width'
        />
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme: 'light' }}
      >
        <AppShell
          padding='md'
          header={
            <Header height={60} padding='md'>
              Parser App
            </Header>
          }
          styles={(theme) => ({
            main: {
              height: `calc(100vh - 60px)`,
              backgroundColor:
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[8]
                  : theme.colors.gray[0],
            },
          })}
        >
          <Component {...pageProps} />
        </AppShell>
      </MantineProvider>
    </>
  );
}
