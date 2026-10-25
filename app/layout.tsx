import type {Metadata, Viewport} from 'next';import './globals.css';import './papercommons.css';import './stitch.css';import './stitch-integration.css';import './premium.css';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#070B14'
};
export const metadata:Metadata={title:'PaperVault PRO — Find papers. Practice smarter.',description:'Discover, share, save and practice question papers with verified topper solutions and AI step evaluation.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'},openGraph:{title:'PaperVault PRO',description:'Better prepared, together. CBSE and Board Practice & Topper Solution Vault.'},verification:{google:'DD5_-8dMFzBBYUPVXZ1zJXAGDzH2XCKMNJDEcn2tXi8'}};
export default function Layout({children}:{children:React.ReactNode}){
  const gaId = process.env.NEXT_PUBLIC_GA_ID || '';
  return <html lang="en" className="dark"><head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
    <meta name="theme-color" content="#070B14"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
    <meta name="google-site-verification" content="DD5_-8dMFzBBYUPVXZ1zJXAGDzH2XCKMNJDEcn2tXi8"/>
    {gaId ? (
      <>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { page_path: window.location.pathname });
            `,
          }}
        />
      </>
    ) : null}
    <link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&amp;family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&amp;display=swap" rel="stylesheet"/>
  </head><body className="bg-[#070B14] text-[#F8FAFC]">{children}</body></html>;
}
