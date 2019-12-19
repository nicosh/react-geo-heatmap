import Head from 'next/head'

export default ({ children, ...rest }) => ([
  <Head key={0}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.6.0/leaflet.css" integrity="sha256-SHMGCYmST46SoyGgo4YR/9AlK1vf3ff84Aq9yK4hdqM=" crossorigin="anonymous" />
  </Head>,
  <main  key={1}>
    {children}
  </main>
])
